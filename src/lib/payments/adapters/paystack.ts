/**
 * Paystack Payment Adapter
 * Documentation: https://paystack.com/docs/api/
 */

import type { PaymentAdapter, InitializePaymentInput } from '../index';
import { toMajorUnits } from '@/lib/money';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export class PaystackAdapter implements PaymentAdapter {
    name = 'paystack';

    async initialize(input: InitializePaymentInput) {
        if (!PAYSTACK_SECRET_KEY) {
            return { success: false, error: 'Paystack not configured' };
        }

        const { amountMinor, currency, customerEmail, callbackUrl, metadata } = input;

        // Paystack expects amount in smallest currency unit (already minor)
        const reference = `moolre_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        try {
            const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: customerEmail,
                    amount: amountMinor, // Paystack uses minor units
                    currency: currency.toUpperCase(),
                    reference,
                    callback_url: callbackUrl,
                    metadata: {
                        ...metadata,
                        custom_fields: [
                            {
                                display_name: 'Order ID',
                                variable_name: 'order_id',
                                value: input.orderId,
                            },
                        ],
                    },
                }),
            });

            const data = await response.json();

            if (!data.status) {
                return { success: false, error: data.message || 'Paystack initialization failed' };
            }

            return {
                success: true,
                redirectUrl: data.data.authorization_url,
                providerReference: reference,
            };
        } catch (error) {
            console.error('Paystack initialize error:', error);
            return { success: false, error: 'Network error' };
        }
    }

    async verify(reference: string) {
        if (!PAYSTACK_SECRET_KEY) {
            return { success: false, status: 'failed' as const, error: 'Paystack not configured' };
        }

        try {
            const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
                headers: {
                    'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
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
                    amountMinor: txData.amount, // Paystack returns in minor units
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

    verifyWebhookSignature(payload: string, signature: string): boolean {
        if (!PAYSTACK_SECRET_KEY) return false;

        // Paystack uses HMAC SHA512
        const crypto = require('crypto');
        const hash = crypto
            .createHmac('sha512', PAYSTACK_SECRET_KEY)
            .update(payload)
            .digest('hex');

        return hash === signature;
    }
}
