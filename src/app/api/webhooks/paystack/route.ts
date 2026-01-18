import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyPayment } from '@/lib/payments';
import { PaystackAdapter } from '@/lib/payments/adapters/paystack';

const adapter = new PaystackAdapter();

// Use untyped client for tables not in the type definitions yet
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PaymentEvent {
    id: string;
}

export async function POST(request: NextRequest) {
    const signature = request.headers.get('x-paystack-signature');

    if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const rawBody = await request.text();

    // Verify webhook signature using credentials from DB
    const isValid = await adapter.verifyWebhook(rawBody, signature);

    // Fallback to Env var if DB verification fails (for legacy/transition support)
    const isLegacyValid = !isValid ? adapter.verifyWebhookSignature(rawBody, signature) : false;

    if (!isValid && !isLegacyValid) {
        console.error('Invalid Paystack webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event;
    const data = payload.data;

    // Log the webhook event
    const { data: eventLog, error: logError } = await supabase
        .from('payment_events')
        .insert({
            provider: 'paystack',
            event_type: eventType,
            provider_event_id: data.id?.toString() || null,
            payload: payload,
            processed: false,
        })
        .select('id')
        .single();

    if (logError) {
        console.error('Failed to log webhook event:', logError);
    }

    const eventId = (eventLog as PaymentEvent | null)?.id;

    // Check for duplicate (idempotency)
    if (eventId) {
        const { data: existing } = await supabase
            .from('payment_events')
            .select('id')
            .eq('provider', 'paystack')
            .eq('provider_event_id', data.id?.toString() || '')
            .eq('processed', true)
            .single();

        if (existing) {
            console.log('Duplicate webhook event, skipping');
            return NextResponse.json({ received: true, duplicate: true });
        }
    }

    try {
        // Handle different event types
        if (eventType === 'charge.success') {
            const reference = data.reference;
            console.log('[Paystack] Processing successful charge for reference:', reference);

            // Verify the payment
            await verifyPayment({
                providerReference: reference,
                provider: 'paystack',
            });
        }

        // Mark event as processed
        if (eventId) {
            await supabase
                .from('payment_events')
                .update({ processed: true })
                .eq('id', eventId);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook processing error:', error);

        // Mark event with error
        if (eventId) {
            await supabase
                .from('payment_events')
                .update({
                    processed: true,
                    error_message: error instanceof Error ? error.message : 'Unknown error'
                })
                .eq('id', eventId);
        }

        // Still return 200 to acknowledge receipt (retry logic should be in our verification)
        return NextResponse.json({ received: true, error: 'Processing failed' });
    }
}
