/**
 * Moolre Payment Adapter
 * Based on Moolre API Documentation
 * https://api.moolre.com/open/transact/payment
 */

import type { PaymentAdapter, InitializePaymentInput } from '../index';
import { createClient } from '@supabase/supabase-js';

const MOOLRE_API_URL = 'https://api.moolre.com/open/transact/payment';

// Supabase client for fetching credentials
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface MoolreCredentials {
    api_user: string;
    api_pubkey: string;
    account_number: string;
}

interface MoolrePaymentRequest {
    type: number;
    channel: string;
    currency: string;
    payer: string;
    amount: string;
    externalref: string;
    otpcode?: string;
    reference?: string;
    sessionid?: string;
    accountnumber: string;
}

interface MoolreResponse {
    status: number;
    code: string;
    message: string;
    data: any;
    go: string | null;
}

// Channel codes for different networks
const CHANNEL_CODES: Record<string, string> = {
    'MTN': '13',
    'VODAFONE': '11',
    'AIRTELTIGO': '12',
};

/**
 * Get Moolre credentials from database
 */
async function getMoolreCredentials(): Promise<MoolreCredentials | null> {
    const { data } = await supabase
        .from('payment_providers')
        .select('credentials')
        .eq('provider', 'moolre')
        .single();

    if (!data?.credentials) return null;

    const creds = data.credentials as MoolreCredentials;
    if (!creds.api_user || !creds.api_pubkey || !creds.account_number) {
        return null;
    }

    return creds;
}

/**
 * Detect network from phone number (Ghana)
 */
function detectNetwork(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    const prefix = cleaned.slice(-9, -6); // Get the network prefix

    // MTN prefixes
    if (['024', '054', '055', '059'].some(p => cleaned.includes(p))) {
        return 'MTN';
    }
    // Vodafone prefixes
    if (['020', '050'].some(p => cleaned.includes(p))) {
        return 'VODAFONE';
    }
    // AirtelTigo prefixes
    if (['027', '057', '026', '056'].some(p => cleaned.includes(p))) {
        return 'AIRTELTIGO';
    }

    // Default to MTN
    return 'MTN';
}

/**
 * Format phone number for Moolre API
 */
function formatPhone(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');

    // If starts with 233, keep as is
    if (cleaned.startsWith('233')) {
        return cleaned;
    }

    // If starts with 0, replace with 233
    if (cleaned.startsWith('0')) {
        return '233' + cleaned.slice(1);
    }

    // Otherwise assume it's already in correct format or add 233
    if (cleaned.length === 9) {
        return '233' + cleaned;
    }

    return cleaned;
}

export class MoolreAdapter implements PaymentAdapter {
    name = 'moolre';

    async initialize(input: InitializePaymentInput) {
        const { amountMinor, currency, customerPhone, callbackUrl, metadata, orderId } = input;

        // Check for mock mode via environment
        const isMock = process.env.NEXT_PUBLIC_MOOLRE_MOCK === 'true';

        if (isMock) {
            console.log('[Moolre] Using Mock Mode');
            const reference = `moolre_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;

            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
            const mockUrl = `${siteUrl}/mock-payment?ref=${reference}&amount=${amountMinor}&currency=${currency}&callback=${encodeURIComponent(callbackUrl)}`;

            return {
                success: true,
                redirectUrl: mockUrl,
                providerReference: reference,
            };
        }

        // Get credentials from database
        const credentials = await getMoolreCredentials();

        if (!credentials) {
            return {
                success: false,
                error: 'Moolre payment not configured. Please add your API credentials in the admin settings.'
            };
        }

        if (!customerPhone) {
            return { success: false, error: 'Customer phone number is required for Moolre payments' };
        }

        const formattedPhone = formatPhone(customerPhone);
        const network = detectNetwork(customerPhone);
        const channelCode = CHANNEL_CODES[network] || '13';
        const reference = `moolre_${orderId}_${Date.now()}`;

        // Convert amount from minor to major (pesewas to cedis)
        const amountMajor = (amountMinor / 100).toFixed(2);

        const requestBody: MoolrePaymentRequest = {
            type: 1,
            channel: channelCode,
            currency: currency || 'GHS',
            payer: formattedPhone,
            amount: amountMajor,
            externalref: reference,
            reference: `Order ${orderId}`,
            accountnumber: credentials.account_number,
        };

        try {
            console.log('[Moolre] Initiating payment:', { phone: formattedPhone, amount: amountMajor, reference });

            const response = await fetch(MOOLRE_API_URL, {
                method: 'POST',
                headers: {
                    'X-API-USER': credentials.api_user,
                    'X-API-PUBKEY': credentials.api_pubkey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const data: MoolreResponse = await response.json();
            console.log('[Moolre] Response:', data);

            // Check response codes
            if (data.status === 1) {
                // Code TP14 = OTP Required
                if (data.code === 'TP14') {
                    // OTP has been sent to customer
                    // We need to handle this via a special flow
                    // For now, we'll create a pending payment and redirect to OTP page
                    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
                    const otpUrl = `${siteUrl}/checkout/verify-otp?ref=${reference}&phone=${formattedPhone}&callback=${encodeURIComponent(callbackUrl)}`;

                    return {
                        success: true,
                        redirectUrl: otpUrl,
                        providerReference: reference,
                        requiresOtp: true,
                    };
                }

                // Payment request sent successfully (no OTP required)
                // Customer will receive prompt on their phone
                const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
                const waitUrl = `${siteUrl}/checkout/waiting?ref=${reference}&callback=${encodeURIComponent(callbackUrl)}`;

                return {
                    success: true,
                    redirectUrl: waitUrl,
                    providerReference: reference,
                };
            }

            // Handle error responses
            return {
                success: false,
                error: data.message || 'Payment initialization failed'
            };

        } catch (error) {
            console.error('[Moolre] Initialize error:', error);
            return { success: false, error: 'Moolre payment service unavailable' };
        }
    }

    /**
     * Submit OTP verification and trigger payment
     */
    async verifyOtpAndPay(
        reference: string,
        phone: string,
        otp: string,
        amount: string,
        orderId: string
    ): Promise<{ success: boolean; message?: string; error?: string }> {
        const credentials = await getMoolreCredentials();
        if (!credentials) {
            return { success: false, error: 'Moolre not configured' };
        }

        const network = detectNetwork(phone);
        const channelCode = CHANNEL_CODES[network] || '13';

        // Step 1: Verify OTP
        const verifyBody: MoolrePaymentRequest = {
            type: 1,
            channel: channelCode,
            currency: 'GHS',
            payer: phone,
            amount: amount,
            externalref: reference,
            otpcode: otp,
            accountnumber: credentials.account_number,
        };

        try {
            const verifyResponse = await fetch(MOOLRE_API_URL, {
                method: 'POST',
                headers: {
                    'X-API-USER': credentials.api_user,
                    'X-API-PUBKEY': credentials.api_pubkey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(verifyBody),
            });

            const verifyData: MoolreResponse = await verifyResponse.json();
            console.log('[Moolre] OTP Verify Response:', verifyData);

            if (verifyData.status !== 1 || verifyData.code === 'TP15') {
                return { success: false, error: verifyData.message || 'Invalid OTP' };
            }

            // Step 2: Trigger actual payment (without OTP)
            const paymentBody: MoolrePaymentRequest = {
                type: 1,
                channel: channelCode,
                currency: 'GHS',
                payer: phone,
                amount: amount,
                externalref: reference,
                reference: `Order ${orderId}`,
                accountnumber: credentials.account_number,
            };

            const payResponse = await fetch(MOOLRE_API_URL, {
                method: 'POST',
                headers: {
                    'X-API-USER': credentials.api_user,
                    'X-API-PUBKEY': credentials.api_pubkey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentBody),
            });

            const payData: MoolreResponse = await payResponse.json();
            console.log('[Moolre] Payment Trigger Response:', payData);

            if (payData.status === 1) {
                return {
                    success: true,
                    message: payData.message || 'Payment request sent. Please approve on your phone.'
                };
            }

            return { success: false, error: payData.message || 'Payment request failed' };

        } catch (error) {
            console.error('[Moolre] OTP/Payment error:', error);
            return { success: false, error: 'Payment service error' };
        }
    }

    async verify(reference: string) {
        // Mock verification
        if (reference.startsWith('moolre_mock_')) {
            return {
                success: true,
                status: 'succeeded' as const,
                amountMinor: 0,
                transactionId: `mock_txn_${Date.now()}`,
                metadata: { mock: true },
            };
        }

        // For Moolre, verification happens via webhook or polling
        // The payment status is updated when customer approves on their phone
        // For now, we check our database for the payment intent status

        const { data: intent } = await supabase
            .from('payment_intents')
            .select('*')
            .eq('provider_reference', reference)
            .single();

        if (!intent) {
            return { success: false, status: 'failed' as const, error: 'Payment not found' };
        }

        if (intent.status === 'succeeded') {
            return {
                success: true,
                status: 'succeeded' as const,
                amountMinor: intent.amount_minor,
                transactionId: intent.provider_reference,
            };
        }

        if (intent.status === 'failed') {
            return { success: false, status: 'failed' as const, error: 'Payment failed' };
        }

        return { success: false, status: 'pending' as const };
    }

    verifyWebhookSignature(payload: string, signature: string): boolean {
        // Moolre webhook verification
        // TODO: Implement when webhook documentation is available
        return true;
    }
}
