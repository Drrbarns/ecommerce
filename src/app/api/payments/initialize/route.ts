import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { initializePayment } from '@/lib/payments';

const InitializeSchema = z.object({
    orderId: z.string().uuid(),
    amountMinor: z.number().int().positive(),
    currency: z.string().length(3).default('GHS'),
    customerEmail: z.string().email(),
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),
    provider: z.string().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validated = InitializeSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                { success: false, error: 'Invalid request', details: validated.error.issues },
                { status: 400 }
            );
        }

        const { orderId, amountMinor, currency, customerEmail, customerName, customerPhone, provider, metadata } = validated.data;

        // Generate callback URL
        const callbackUrl = `${request.nextUrl.origin}/api/payments/verify?orderId=${orderId}`;

        const result = await initializePayment({
            orderId,
            amountMinor,
            currency,
            customerEmail,
            customerName,
            customerPhone,
            callbackUrl,
            provider,
            metadata,
            idempotencyKey: `init_${orderId}_${Date.now()}`,
        });

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            paymentIntentId: result.paymentIntentId,
            redirectUrl: result.redirectUrl,
        });
    } catch (error) {
        console.error('Payment initialization error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
