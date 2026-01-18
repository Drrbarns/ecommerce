import { NextRequest, NextResponse } from 'next/server';
import { MoolreAdapter } from '@/lib/payments/adapters/moolre';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const moolreAdapter = new MoolreAdapter();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { reference, phone, otp, amount } = body;

        if (!reference || !phone || !otp) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get the payment intent to find the order ID
        const { data: intent } = await supabase
            .from('payment_intents')
            .select('order_id, amount_minor')
            .eq('provider_reference', reference)
            .single();

        const orderId = intent?.order_id || reference;
        const paymentAmount = amount || (intent?.amount_minor ? (intent.amount_minor / 100).toFixed(2) : '0');

        // Verify OTP and trigger payment
        const result = await moolreAdapter.verifyOtpAndPay(
            reference,
            phone,
            otp,
            paymentAmount,
            orderId
        );

        if (result.success) {
            // Update payment intent status to processing
            await supabase
                .from('payment_intents')
                .update({
                    status: 'processing',
                    updated_at: new Date().toISOString()
                })
                .eq('provider_reference', reference);

            return NextResponse.json({
                success: true,
                message: result.message || 'Payment prompt sent. Please approve on your phone.',
            });
        } else {
            return NextResponse.json({
                success: false,
                error: result.error || 'OTP verification failed',
            });
        }
    } catch (error) {
        console.error('OTP verification error:', error);
        return NextResponse.json(
            { success: false, error: 'Verification failed' },
            { status: 500 }
        );
    }
}
