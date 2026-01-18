"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Shield, Smartphone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function VerifyOTPContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const reference = searchParams.get('ref');
    const phone = searchParams.get('phone');
    const callback = searchParams.get('callback');
    const amount = searchParams.get('amount');

    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!otp || otp.length < 4) {
            toast.error('Please enter a valid OTP');
            return;
        }

        if (!reference || !phone) {
            toast.error('Invalid session. Please try again.');
            router.push('/checkout');
            return;
        }

        setIsLoading(true);

        try {
            // Call your API to verify OTP and trigger payment
            const response = await fetch('/api/payments/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reference,
                    phone,
                    otp,
                    amount,
                })
            });

            const result = await response.json();

            if (result.success) {
                toast.success('OTP verified! Please approve the payment on your phone.');
                // Redirect to waiting page
                const waitUrl = `/waiting?ref=${reference}&callback=${encodeURIComponent(callback || '')}`;
                router.push(waitUrl);
            } else {
                toast.error(result.error || 'Invalid OTP. Please try again.');
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            toast.error('Verification failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        toast.info('Requesting new OTP...');
        // Trigger a new OTP request
        try {
            const response = await fetch('/api/payments/resend-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reference, phone })
            });

            const result = await response.json();

            if (result.success) {
                toast.success('New OTP sent to your phone');
            } else {
                toast.error(result.error || 'Could not resend OTP');
            }
        } catch (error) {
            toast.error('Could not resend OTP');
        }
    };

    // Mask phone number for display
    const maskedPhone = phone ? phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2') : '';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/50 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
                        >
                            <Shield className="h-8 w-8 text-primary" />
                        </motion.div>

                        <CardTitle className="text-xl">Verify Your Number</CardTitle>
                        <CardDescription className="text-base mt-2">
                            We've sent a verification code to{' '}
                            <span className="font-mono font-medium text-foreground">{maskedPhone}</span>
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="otp">Enter OTP Code</Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    placeholder="Enter 4-6 digit code"
                                    className="text-center text-2xl tracking-widest font-mono h-14"
                                    autoFocus
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12"
                                disabled={isLoading || otp.length < 4}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        Verify & Continue
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    className="text-sm text-muted-foreground hover:text-primary underline"
                                >
                                    Didn't receive the code? Resend
                                </button>
                            </div>
                        </form>

                        {/* Info box */}
                        <div className="mt-6 p-4 bg-muted rounded-lg">
                            <div className="flex gap-3">
                                <Smartphone className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-muted-foreground">
                                    The OTP was sent via SMS. After verification, you'll receive a payment
                                    prompt on your phone to enter your Mobile Money PIN.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
