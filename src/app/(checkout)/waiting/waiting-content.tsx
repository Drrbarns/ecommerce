"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, XCircle, Smartphone, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PaymentStatus = 'waiting' | 'checking' | 'succeeded' | 'failed' | 'timeout';

export function WaitingContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const reference = searchParams.get('ref');
    const callback = searchParams.get('callback');

    const [status, setStatus] = useState<PaymentStatus>('waiting');
    const [attempts, setAttempts] = useState(0);
    const [message, setMessage] = useState('');
    const maxAttempts = 30; // Poll for 2.5 minutes (30 * 5 seconds)

    const checkPaymentStatus = async () => {
        if (!reference) return;

        setStatus('checking');

        try {
            const response = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reference,
                    provider: 'moolre'
                })
            });

            const result = await response.json();

            if (result.success && result.status === 'succeeded') {
                setStatus('succeeded');
                // Wait a moment then redirect
                setTimeout(() => {
                    if (callback) {
                        router.push(decodeURIComponent(callback));
                    } else if (result.orderId) {
                        router.push(`/order-confirmation?orderId=${result.orderId}&status=success`);
                    }
                }, 2000);
            } else if (result.status === 'failed') {
                setStatus('failed');
                setMessage(result.error || 'Payment was declined');
            } else {
                // Still pending, continue polling
                setStatus('waiting');
                setAttempts(prev => prev + 1);
            }
        } catch (error) {
            console.error('Status check error:', error);
            setStatus('waiting');
            setAttempts(prev => prev + 1);
        }
    };

    useEffect(() => {
        if (!reference) {
            router.push('/checkout');
            return;
        }

        // Start polling after initial delay
        const pollInterval = setInterval(() => {
            if (attempts >= maxAttempts) {
                clearInterval(pollInterval);
                setStatus('timeout');
                return;
            }

            if (status === 'waiting') {
                checkPaymentStatus();
            }
        }, 5000); // Check every 5 seconds

        // Initial check after 3 seconds
        const initialCheck = setTimeout(checkPaymentStatus, 3000);

        return () => {
            clearInterval(pollInterval);
            clearTimeout(initialCheck);
        };
    }, [reference, attempts, status]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mx-auto mb-4"
                    >
                        {status === 'succeeded' ? (
                            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                        ) : status === 'failed' ? (
                            <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                                <XCircle className="h-10 w-10 text-red-600" />
                            </div>
                        ) : (
                            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto relative">
                                <Smartphone className="h-10 w-10 text-primary" />
                                {status === 'checking' && (
                                    <motion.div
                                        className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                )}
                            </div>
                        )}
                    </motion.div>

                    <CardTitle className="text-xl">
                        {status === 'succeeded' && 'Payment Successful!'}
                        {status === 'failed' && 'Payment Failed'}
                        {status === 'timeout' && 'Payment Timeout'}
                        {(status === 'waiting' || status === 'checking') && 'Approve Payment on Your Phone'}
                    </CardTitle>

                    <CardDescription className="text-base mt-2">
                        {status === 'succeeded' && 'Your payment has been confirmed. Redirecting...'}
                        {status === 'failed' && (message || 'Your payment was not completed.')}
                        {status === 'timeout' && 'We couldn\'t confirm your payment. Please check your transaction history.'}
                        {(status === 'waiting' || status === 'checking') && (
                            'A payment prompt has been sent to your phone. Please enter your Mobile Money PIN to complete the payment.'
                        )}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {(status === 'waiting' || status === 'checking') && (
                        <div className="space-y-4">
                            {/* Visual instructions */}
                            <div className="bg-muted rounded-lg p-4 space-y-2">
                                <p className="text-sm font-medium">Follow these steps:</p>
                                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                                    <li>Check your phone for a payment prompt</li>
                                    <li>Enter your Mobile Money PIN</li>
                                    <li>Wait for confirmation</li>
                                </ol>
                            </div>

                            {/* Status indicator */}
                            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm">
                                    {status === 'checking' ? 'Checking status...' : 'Waiting for approval...'}
                                </span>
                            </div>

                            {/* Progress indicator */}
                            <div className="w-full bg-muted rounded-full h-1.5">
                                <motion.div
                                    className="bg-primary h-1.5 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(attempts / maxAttempts) * 100}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </div>
                    )}

                    {status === 'timeout' && (
                        <div className="flex flex-col gap-3">
                            <Button onClick={checkPaymentStatus} variant="outline" className="gap-2">
                                <RefreshCw className="h-4 w-4" />
                                Check Again
                            </Button>
                            <Button onClick={() => router.push('/checkout')} variant="ghost">
                                Return to Checkout
                            </Button>
                        </div>
                    )}

                    {status === 'failed' && (
                        <div className="flex flex-col gap-3">
                            <Button onClick={() => router.push('/checkout')}>
                                Try Again
                            </Button>
                            <Button onClick={() => router.push('/cart')} variant="ghost">
                                Return to Cart
                            </Button>
                        </div>
                    )}

                    {status === 'succeeded' && (
                        <div className="flex items-center justify-center gap-2 text-green-600">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Redirecting to confirmation...</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
