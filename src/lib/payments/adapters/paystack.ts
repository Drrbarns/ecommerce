/**
 * Paystack Payment Adapter
 * Documentation: https://paystack.com/docs/api/
 */

import type { PaymentAdapter, InitializePaymentInput } from '../index';
import { createClient } from '@supabase/supabase-js';

// Supabase client to fetch credentials
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

interface PaystackCredentials {
    public_key: string;
    secret_key: string;
}

/**
 * Get Paystack credentials from database
 */
async function getPaystackCredentials(): Promise<PaystackCredentials | null> {
    const { data } = await supabase
        .from('payment_providers')
        .select('credentials, is_enabled')
        .eq('provider', 'paystack')
        .single();

    if (!data?.is_enabled || !data?.credentials) return null;

    const creds = data.credentials as PaystackCredentials;
    if (!creds.secret_key) return null;

    return creds;
}

export class PaystackAdapter implements PaymentAdapter {
    name = 'paystack';

    async initialize(input: InitializePaymentInput) {
        const credentials = await getPaystackCredentials();

        if (!credentials) {
            return { success: false, error: 'Paystack is not configured or enabled.' };
        }

        const { amountMinor, currency, customerEmail, callbackUrl, metadata, orderId } = input;

        // Paystack expects amount in smallest currency unit (already minor)
        const reference = `pstk_${orderId}_${Date.now()}`;

        try {
            const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${credentials.secret_key}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: customerEmail,
                    amount: amountMinor,
                    currency: currency.toUpperCase(),
                    reference,
                    callback_url: callbackUrl,
                    metadata: {
                        ...metadata,
                        order_id: orderId,
                        custom_fields: [
                            {
                                display_name: 'Order ID',
                                variable_name: 'order_id',
                                value: orderId,
                            },
                        ],
                    },
                }),
            });

            const data = await response.json();

            if (!data.status) {
                console.error('Paystack init failed:', data.message);
                return { success: false, error: data.message || 'Paystack initialization failed' };
            }

            return {
                success: true,
                redirectUrl: data.data.authorization_url,
                providerReference: reference,
            };
        } catch (error) {
            console.error('Paystack initialize error:', error);
            return { success: false, error: 'Network error connecting to Paystack' };
        }
    }

    async verify(reference: string) {
        const credentials = await getPaystackCredentials();

        if (!credentials) {
            return { success: false, status: 'failed' as const, error: 'Paystack configuration missing' };
        }

        try {
            const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
                headers: {
                    'Authorization': `Bearer ${credentials.secret_key}`,
                },
            });

            const data = await response.json();

            if (!data.status) {
                return { success: false, status: 'failed' as const, error: data.message };
            }

            const txData = data.data;

            if (txData.status === 'success') {
                return {
                    success: true,
                    status: 'succeeded' as const,
                    amountMinor: txData.amount,
                    transactionId: txData.id?.toString(),
                    metadata: txData.metadata,
                };
            } else if (txData.status === 'pending' || txData.status === 'ongoing') {
                return { success: false, status: 'pending' as const };
            } else {
                return { success: false, status: 'failed' as const, error: txData.gateway_response };
            }
        } catch (error) {
            console.error('Paystack verify error:', error);
            return { success: false, status: 'failed' as const, error: 'Verification failed' };
        }
    }

    // Static method for webhook verification since we might not instantiate the class
    async verifyWebhook(payload: string, signature: string): Promise<boolean> {
        const credentials = await getPaystackCredentials();
        if (!credentials?.secret_key) return false;

        const crypto = require('crypto');
        const hash = crypto
            .createHmac('sha512', credentials.secret_key)
            .update(payload)
            .digest('hex');

        return hash === signature;
    }

    // Keep existing signature for interface compatibility, but it relies on static env vars which we are moving away from.
    // In the webhook route, we should use the async verifyWebhook method.
    verifyWebhookSignature(payload: string, signature: string): boolean {
        // This is deprecated in favor of async verification in the route handler
        // But we keep it to satisfy the interface. 
        // If ENV var exists, use it as fallback
        if (process.env.PAYSTACK_SECRET_KEY) {
            const crypto = require('crypto');
            const hash = crypto
                .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
                .update(payload)
                .digest('hex');
            return hash === signature;
        }
        return false;
    }
}
