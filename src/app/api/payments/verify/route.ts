import { NextRequest, NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/payments';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');
    const reference = searchParams.get('reference') || searchParams.get('trxref') || searchParams.get('tx_ref');
    const paymentIntentId = searchParams.get('paymentIntentId');

    if (!orderId && !reference && !paymentIntentId) {
        // Redirect to home on error
        return NextResponse.redirect(new URL('/', request.url));
    }

    try {
        const result = await verifyPayment({
            paymentIntentId: paymentIntentId || undefined,
            providerReference: reference || undefined,
        });

        if (result.success && result.status === 'succeeded') {
            // Redirect to success page
            return NextResponse.redirect(
                new URL(`/order-confirmation?orderId=${result.orderId || orderId}&status=success`, request.url)
            );
        } else if (result.status === 'pending') {
            // Payment still processing
            return NextResponse.redirect(
                new URL(`/order-confirmation?orderId=${orderId}&status=pending`, request.url)
            );
        } else {
            // Payment failed
            return NextResponse.redirect(
                new URL(`/checkout?error=payment_failed&orderId=${orderId}`, request.url)
            );
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        return NextResponse.redirect(
            new URL(`/checkout?error=verification_error&orderId=${orderId}`, request.url)
        );
    }
}

// Also handle POST for some providers
export async function POST(request: NextRequest) {
    const body = await request.json();

    const result = await verifyPayment({
        paymentIntentId: body.paymentIntentId,
        providerReference: body.reference,
        provider: body.provider,
    });

    return NextResponse.json(result);
}
