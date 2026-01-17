/**
 * Flutterwave Payment Adapter
 * Documentation: https://developer.flutterwave.com/docs
 */

import type { PaymentAdapter, InitializePaymentInput } from '../index';

const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
const FLUTTERWAVE_BASE_URL = 'https://api.flutterwave.com/v3';

export class FlutterwaveAdapter implements PaymentAdapter {
    name = 'flutterwave';

    async initialize(input: InitializePaymentInput) {
        if (!FLUTTERWAVE_SECRET_KEY) {
            return { success: false, error: 'Flutterwave not configured' };
        }

        const { amountMinor, currency, customerEmail, customerName, customerPhone, callbackUrl, metadata, orderId } = input;

        // Flutterwave expects amount in major units
        const amountMajor = amountMinor / 100;
        const txRef = `moolre_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        try {
            const response = await fetch(`${FLUTTERWAVE_BASE_URL}/payments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tx_ref: txRef,
                    amount: amountMajor,
                    currency: currency.toUpperCase(),
                    redirect_url: callbackUrl,
                    customer: {
                        email: customerEmail,
                        name: customerName || customerEmail.split('@')[0],
                        phonenumber: customerPhone,
                    },
                    meta: {
                        order_id: orderId,
                        ...metadata,
                    },
                    customizations: {
                        title: 'Moolre Payment',
                        logo: 'https://your-logo-url.com/logo.png',
                    },
                }),
            });

            const data = await response.json();

            if (data.status !== 'success') {
                return { success: false, error: data.message || 'Flutterwave initialization failed' };
            }

            return {
                success: true,
                redirectUrl: data.data.link,
                providerReference: txRef,
            };
        } catch (error) {
            console.error('Flutterwave initialize error:', error);
            return { success: false, error: 'Network error' };
        }
    }

    async verify(reference: string) {
        if (!FLUTTERWAVE_SECRET_KEY) {
            return { success: false, status: 'failed' as const, error: 'Flutterwave not configured' };
        }

        try {
            // First find the transaction by tx_ref
            const response = await fetch(`${FLUTTERWAVE_BASE_URL}/transactions?tx_ref=${reference}`, {
                headers: {
                    'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
                },
            });

            const data = await response.json();

            if (data.status !== 'success' || !data.data || data.data.length === 0) {
                return { success: false, status: 'failed' as const, error: 'Transaction not found' };
            }

            const tx = data.data[0];

            if (tx.status === 'successful') {
                return {
                    success: true,
                    status: 'succeeded' as const,
                    amountMinor: Math.round(tx.amount * 100), // Convert to minor units
                    transactionId: tx.id?.toString(),
                    metadata: tx.meta,
                };
            } else if (tx.status === 'pending') {
                return { success: false, status: 'pending' as const };
            } else {
                return { success: false, status: 'failed' as const, error: tx.processor_response };
            }
        } catch (error) {
            console.error('Flutterwave verify error:', error);
            return { success: false, status: 'failed' as const, error: 'Verification failed' };
        }
    }

    verifyWebhookSignature(payload: string, signature: string): boolean {
        // Flutterwave uses a secret hash header
        const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
        return signature === secretHash;
    }
}
