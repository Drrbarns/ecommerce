import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Moolre Webhook Handler
 * 
 * This endpoint receives payment notifications from Moolre
 * when a customer completes (or fails) a payment.
 * 
 * Webhook URL to configure in Moolre dashboard:
 * https://yoursite.com/api/webhooks/moolre
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('[Moolre Webhook] Received:', JSON.stringify(body, null, 2));

        // Extract relevant fields from Moolre webhook
        // Note: Adjust these based on actual Moolre webhook structure
        const {
            status,
            code,
            message,
            data,
            externalref,  // Our reference
            transactionid,
            amount,
        } = body;

        // Store the webhook event for audit
        await supabase.from('payment_events').insert({
            provider: 'moolre',
            event_type: `webhook.${code || status}`,
            provider_event_id: transactionid,
            payload: body,
            processed: false,
        });

        // Find the payment intent by our reference
        const { data: intent, error: intentError } = await supabase
            .from('payment_intents')
            .select('*')
            .eq('provider_reference', externalref)
            .single();

        if (intentError || !intent) {
            console.error('[Moolre Webhook] Payment intent not found for reference:', externalref);
            // Still return 200 to acknowledge receipt
            return NextResponse.json({ received: true, error: 'Intent not found' });
        }

        // Update the payment event with intent ID
        await supabase
            .from('payment_events')
            .update({
                payment_intent_id: intent.id,
                processed: true
            })
            .eq('provider', 'moolre')
            .eq('provider_event_id', transactionid);

        // Determine if payment was successful
        // Moolre success codes (adjust based on actual documentation)
        const isSuccess = status === 1 && (code === 'TP00' || code === 'SUCCESS' || code === 'TP01');
        const isFailed = status === 0 || code === 'FAILED' || code === 'TP99';

        if (isSuccess) {
            // Update payment intent to succeeded
            await supabase
                .from('payment_intents')
                .update({
                    status: 'succeeded',
                    updated_at: new Date().toISOString()
                })
                .eq('id', intent.id);

            // Update order status
            if (intent.order_id) {
                await supabase
                    .from('orders')
                    .update({ status: 'paid' })
                    .eq('id', intent.order_id);

                // Create payment record
                await supabase.from('payments').insert({
                    payment_intent_id: intent.id,
                    order_id: intent.order_id,
                    customer_id: intent.customer_id,
                    provider: 'moolre',
                    provider_transaction_id: transactionid,
                    amount_minor: intent.amount_minor,
                    currency: intent.currency,
                    status: 'captured',
                    metadata: { webhook_data: body }
                });
            }

            console.log('[Moolre Webhook] Payment succeeded for order:', intent.order_id);
        } else if (isFailed) {
            // Update payment intent to failed
            await supabase
                .from('payment_intents')
                .update({
                    status: 'failed',
                    updated_at: new Date().toISOString()
                })
                .eq('id', intent.id);

            console.log('[Moolre Webhook] Payment failed for order:', intent.order_id, message);
        }

        // Always return 200 to acknowledge receipt
        return NextResponse.json({
            success: true,
            received: true,
            intentId: intent.id
        });

    } catch (error) {
        console.error('[Moolre Webhook] Error processing webhook:', error);
        // Return 200 anyway to prevent retries that we can't handle
        return NextResponse.json({
            received: true,
            error: 'Processing error'
        });
    }
}

// Handle GET for webhook verification (if Moolre requires it)
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const challenge = searchParams.get('challenge');

    // If this is a verification request, return the challenge
    if (challenge) {
        return new NextResponse(challenge);
    }

    return NextResponse.json({
        status: 'Moolre webhook endpoint active',
        timestamp: new Date().toISOString()
    });
}
