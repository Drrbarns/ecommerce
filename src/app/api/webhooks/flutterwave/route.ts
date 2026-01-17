import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyPayment } from '@/lib/payments';
import { FlutterwaveAdapter } from '@/lib/payments/adapters/flutterwave';

const adapter = new FlutterwaveAdapter();

// Use untyped client for tables not in the type definitions yet
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PaymentEvent {
    id: string;
}

export async function POST(request: NextRequest) {
    const secretHash = request.headers.get('verif-hash');

    // Verify webhook signature
    if (!adapter.verifyWebhookSignature('', secretHash || '')) {
        console.error('Invalid Flutterwave webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = await request.json();
    const eventType = payload.event;
    const data = payload.data;

    // Log the webhook event
    const { data: eventLog, error: logError } = await supabase
        .from('payment_events')
        .insert({
            provider: 'flutterwave',
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
            .eq('provider', 'flutterwave')
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
        if (eventType === 'charge.completed' && data.status === 'successful') {
            const reference = data.tx_ref;

            // Verify the payment
            await verifyPayment({
                providerReference: reference,
                provider: 'flutterwave',
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

        return NextResponse.json({ received: true, error: 'Processing failed' });
    }
}
