/**
 * Payments Hub - Provider-agnostic payment processing
 */

import { createClient } from '@supabase/supabase-js';
import { PaystackAdapter } from './adapters/paystack';
import { FlutterwaveAdapter } from './adapters/flutterwave';
import { MoolreAdapter } from './adapters/moolre';

// Use untyped client for payment tables not in the type definitions yet
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface PaymentProvider {
    name: string;
    displayName: string;
    isEnabled: boolean;
    isPrimary: boolean;
    supportedCurrencies: string[];
}

export interface InitializePaymentInput {
    orderId: string;
    amountMinor: number;
    currency: string;
    customerEmail: string;
    customerName?: string;
    customerPhone?: string;
    metadata?: Record<string, unknown>;
    callbackUrl: string;
    provider?: string; // Force specific provider
    idempotencyKey?: string;
}

export interface InitializePaymentResult {
    success: boolean;
    paymentIntentId?: string;
    redirectUrl?: string;
    providerReference?: string;
    error?: string;
}

export interface VerifyPaymentInput {
    paymentIntentId?: string;
    providerReference?: string;
    provider?: string;
}

export interface VerifyPaymentResult {
    success: boolean;
    status: 'succeeded' | 'pending' | 'failed';
    orderId?: string;
    amountMinor?: number;
    providerTransactionId?: string;
    error?: string;
}

export interface PaymentAdapter {
    name: string;
    initialize(input: InitializePaymentInput): Promise<{
        success: boolean;
        redirectUrl?: string;
        providerReference?: string;
        error?: string;
    }>;
    verify(reference: string): Promise<{
        success: boolean;
        status: 'succeeded' | 'pending' | 'failed';
        amountMinor?: number;
        transactionId?: string;
        metadata?: Record<string, unknown>;
        error?: string;
    }>;
    verifyWebhookSignature?(payload: string, signature: string): boolean;
}

// Adapter registry
const adapters: Record<string, PaymentAdapter> = {
    paystack: new PaystackAdapter(),
    flutterwave: new FlutterwaveAdapter(),
    moolre: new MoolreAdapter(),
};

interface PaymentIntentRecord {
    id: string;
    order_id: string | null;
    provider: string;
    provider_reference: string | null;
    redirect_url: string | null;
    amount_minor: number;
    currency: string;
    status: string;
}

interface PaymentProviderRecord {
    provider: string;
    display_name: string;
    is_enabled: boolean;
    is_primary: boolean;
    supported_currencies: string[];
}

/**
 * Get enabled payment providers
 */
export async function getPaymentProviders(): Promise<PaymentProvider[]> {
    const { data, error } = await supabase
        .from('payment_providers')
        .select('*')
        .eq('is_enabled', true)
        .order('priority', { ascending: true });

    if (error || !data) {
        console.error('Error fetching payment providers:', error);
        return [];
    }

    return (data as PaymentProviderRecord[]).map(p => ({
        name: p.provider,
        displayName: p.display_name,
        isEnabled: p.is_enabled,
        isPrimary: p.is_primary,
        supportedCurrencies: p.supported_currencies || ['GHS'],
    }));
}

/**
 * Get the best provider for a currency
 */
export async function selectProvider(currency: string, preferredProvider?: string): Promise<string | null> {
    const providers = await getPaymentProviders();

    // If preferred provider is specified and available
    if (preferredProvider) {
        const pref = providers.find(p => p.name === preferredProvider && p.supportedCurrencies.includes(currency));
        if (pref) return pref.name;
    }

    // Find primary that supports currency
    const primary = providers.find(p => p.isPrimary && p.supportedCurrencies.includes(currency));
    if (primary) return primary.name;

    // Find any that supports currency
    const any = providers.find(p => p.supportedCurrencies.includes(currency));
    return any?.name || null;
}

/**
 * Initialize a payment
 */
export async function initializePayment(input: InitializePaymentInput): Promise<InitializePaymentResult> {
    const { orderId, amountMinor, currency, callbackUrl, idempotencyKey } = input;

    // Select provider
    const providerName = await selectProvider(currency, input.provider);
    if (!providerName) {
        return { success: false, error: 'No payment provider available for this currency' };
    }

    const adapter = adapters[providerName];
    if (!adapter) {
        return { success: false, error: `Payment adapter not found: ${providerName}` };
    }

    // Check idempotency
    if (idempotencyKey) {
        const { data: existingData } = await supabase
            .from('payment_intents')
            .select('id, redirect_url, provider_reference, status')
            .eq('idempotency_key', idempotencyKey)
            .single();

        const existing = existingData as PaymentIntentRecord | null;
        if (existing && existing.status === 'pending') {
            return {
                success: true,
                paymentIntentId: existing.id,
                redirectUrl: existing.redirect_url || undefined,
                providerReference: existing.provider_reference || undefined,
            };
        }
    }

    // Create payment intent record
    const { data: intentData, error: intentError } = await supabase
        .from('payment_intents')
        .insert({
            order_id: orderId,
            provider: providerName,
            amount_minor: amountMinor,
            currency,
            status: 'pending',
            callback_url: callbackUrl,
            idempotency_key: idempotencyKey,
            metadata: input.metadata || {},
        })
        .select()
        .single();

    const intent = intentData as PaymentIntentRecord | null;

    if (intentError || !intent) {
        console.error('Error creating payment intent:', intentError);
        return { success: false, error: 'Failed to create payment intent' };
    }

    try {
        // Initialize with provider
        const result = await adapter.initialize({
            ...input,
            metadata: {
                ...input.metadata,
                payment_intent_id: intent.id,
            },
        });

        if (!result.success) {
            // Update intent as failed
            await supabase
                .from('payment_intents')
                .update({ status: 'failed' })
                .eq('id', intent.id);

            return { success: false, error: result.error };
        }

        // Update intent with provider reference
        await supabase
            .from('payment_intents')
            .update({
                provider_reference: result.providerReference,
                redirect_url: result.redirectUrl,
                status: 'processing',
            })
            .eq('id', intent.id);

        return {
            success: true,
            paymentIntentId: intent.id,
            redirectUrl: result.redirectUrl,
            providerReference: result.providerReference,
        };
    } catch (err) {
        console.error('Payment initialization error:', err);
        await supabase
            .from('payment_intents')
            .update({ status: 'failed' })
            .eq('id', intent.id);

        return { success: false, error: 'Payment initialization failed' };
    }
}

/**
 * Verify a payment
 */
export async function verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    const { paymentIntentId, providerReference, provider } = input;

    // Find payment intent
    let intent: PaymentIntentRecord | null = null;
    if (paymentIntentId) {
        const { data } = await supabase
            .from('payment_intents')
            .select('*')
            .eq('id', paymentIntentId)
            .single();
        intent = data as PaymentIntentRecord | null;
    } else if (providerReference && provider) {
        const { data } = await supabase
            .from('payment_intents')
            .select('*')
            .eq('provider', provider)
            .eq('provider_reference', providerReference)
            .single();
        intent = data as PaymentIntentRecord | null;
    }

    if (!intent) {
        return { success: false, status: 'failed', error: 'Payment intent not found' };
    }

    // Already succeeded?
    if (intent.status === 'succeeded') {
        return {
            success: true,
            status: 'succeeded',
            orderId: intent.order_id || undefined,
            amountMinor: intent.amount_minor,
        };
    }

    const adapter = adapters[intent.provider];
    if (!adapter) {
        return { success: false, status: 'failed', error: 'Payment adapter not found' };
    }

    try {
        const result = await adapter.verify(intent.provider_reference || '');

        // Log the verification event
        await supabase.from('payment_events').insert({
            payment_intent_id: intent.id,
            provider: intent.provider,
            event_type: `verification.${result.status}`,
            payload: result as Record<string, unknown>,
            processed: true,
        });

        if (result.success && result.status === 'succeeded') {
            // Verify amount matches
            if (result.amountMinor !== intent.amount_minor) {
                console.error('Amount mismatch:', { expected: intent.amount_minor, received: result.amountMinor });
                return { success: false, status: 'failed', error: 'Amount verification failed' };
            }

            // Update intent
            await supabase
                .from('payment_intents')
                .update({ status: 'succeeded', updated_at: new Date().toISOString() })
                .eq('id', intent.id);

            // Update order status
            if (intent.order_id) {
                await supabase
                    .from('orders')
                    .update({ status: 'paid' })
                    .eq('id', intent.order_id);

                // Record payment
                await supabase.from('payments').insert({
                    payment_intent_id: intent.id,
                    order_id: intent.order_id,
                    provider: intent.provider,
                    provider_transaction_id: result.transactionId,
                    amount_minor: intent.amount_minor,
                    currency: intent.currency,
                    status: 'captured',
                });
            }

            return {
                success: true,
                status: 'succeeded',
                orderId: intent.order_id || undefined,
                amountMinor: intent.amount_minor,
                providerTransactionId: result.transactionId,
            };
        }

        // Update as failed if verification failed
        if (result.status === 'failed') {
            await supabase
                .from('payment_intents')
                .update({ status: 'failed' })
                .eq('id', intent.id);
        }

        return {
            success: false,
            status: result.status,
            error: result.error,
        };
    } catch (err) {
        console.error('Payment verification error:', err);
        return { success: false, status: 'failed', error: 'Verification failed' };
    }
}
