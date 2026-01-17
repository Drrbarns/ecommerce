/**
 * Moolre Payment Adapter (Skeleton)
 * TODO: Implement when Moolre API documentation is available
 */

import type { PaymentAdapter, InitializePaymentInput } from '../index';

const MOOLRE_API_KEY = process.env.MOOLRE_API_KEY;
const MOOLRE_SECRET_KEY = process.env.MOOLRE_SECRET_KEY;
const MOOLRE_BASE_URL = process.env.MOOLRE_API_URL || 'https://api.moolre.com/v1';

export class MoolreAdapter implements PaymentAdapter {
    name = 'moolre';

    async initialize(input: InitializePaymentInput) {
        const { amountMinor, currency, customerEmail, callbackUrl, metadata, orderId } = input;

        // Mock Mode Check
        const isMock = !MOOLRE_API_KEY || process.env.NEXT_PUBLIC_MOOLRE_MOCK === 'true';

        if (isMock) {
            console.log('Using Mock Moolre Adapter');
            const reference = `moolre_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;

            // Construct mock payment page URL
            // We pass the actual callback URL to the mock page so it knows where to return
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
            const mockUrl = `${siteUrl}/mock-payment?ref=${reference}&amount=${amountMinor}&currency=${currency}&callback=${encodeURIComponent(callbackUrl)}`;

            return {
                success: true,
                redirectUrl: mockUrl,
                providerReference: reference,
            };
        }

        if (!MOOLRE_API_KEY || !MOOLRE_SECRET_KEY) {
            return { success: false, error: 'Moolre payment not configured. Please add MOOLRE_API_KEY and MOOLRE_SECRET_KEY.' };
        }

        const reference = `moolre_pay_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        try {
            // Example implementation (adjust based on actual API)
            const response = await fetch(`${MOOLRE_BASE_URL}/payments/initialize`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${MOOLRE_API_KEY}`,
                    'X-Secret-Key': MOOLRE_SECRET_KEY,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reference,
                    amount: amountMinor,
                    currency,
                    email: customerEmail,
                    callback_url: callbackUrl,
                    order_id: orderId,
                    metadata,
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                console.error('Moolre initialization failed:', error);
                return { success: false, error: 'Moolre payment initialization failed' };
            }

            const data = await response.json();

            return {
                success: true,
                redirectUrl: data.checkout_url || data.authorization_url,
                providerReference: reference,
            };
        } catch (error) {
            console.error('Moolre initialize error:', error);
            return { success: false, error: 'Moolre payment service unavailable' };
        }
    }

    async verify(reference: string) {
        // Mock Verification
        if (reference.startsWith('moolre_mock_')) {
            return {
                success: true,
                status: 'succeeded' as const,
                amountMinor: 0, // In real scenario, we'd look this up or pass it
                transactionId: `mock_txn_${Date.now()}`,
                metadata: { mock: true },
            };
        }

        if (!MOOLRE_API_KEY || !MOOLRE_SECRET_KEY) {
            return { success: false, status: 'failed' as const, error: 'Moolre not configured' };
        }

        try {
            // Example implementation (adjust based on actual API)
            const response = await fetch(`${MOOLRE_BASE_URL}/payments/verify/${reference}`, {
                headers: {
                    'Authorization': `Bearer ${MOOLRE_API_KEY}`,
                    'X-Secret-Key': MOOLRE_SECRET_KEY,
                },
            });

            if (!response.ok) {
                return { success: false, status: 'failed' as const, error: 'Verification request failed' };
            }

            const data = await response.json();

            if (data.status === 'success' || data.status === 'completed') {
                return {
                    success: true,
                    status: 'succeeded' as const,
                    amountMinor: data.amount,
                    transactionId: data.transaction_id || data.id,
                    metadata: data.metadata,
                };
            } else if (data.status === 'pending') {
                return { success: false, status: 'pending' as const };
            } else {
                return { success: false, status: 'failed' as const, error: data.message };
            }
        } catch (error) {
            console.error('Moolre verify error:', error);
            return { success: false, status: 'failed' as const, error: 'Verification failed' };
        }
    }

    verifyWebhookSignature(payload: string, signature: string): boolean {
        // TODO: Implement webhook signature verification when docs available
        if (!MOOLRE_SECRET_KEY) return false;

        const crypto = require('crypto');
        const hash = crypto
            .createHmac('sha256', MOOLRE_SECRET_KEY)
            .update(payload)
            .digest('hex');

        return hash === signature;
    }
}
