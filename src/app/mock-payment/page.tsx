"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function MockPaymentContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [isProcessing, setIsProcessing] = useState(false);

    const reference = searchParams.get("ref");
    const amountMinor = searchParams.get("amount");
    const currency = searchParams.get("currency") || "GHS";
    const callbackUrl = searchParams.get("callback");

    const amount = amountMinor ? (parseInt(amountMinor) / 100).toFixed(2) : "0.00";

    if (!reference || !callbackUrl) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center text-red-500">
                <XCircle className="h-12 w-12 mb-4" />
                <h2 className="text-xl font-bold">Invalid Payment Session</h2>
                <p>Missing reference or callback URL.</p>
            </div>
        );
    }

    const handleApprove = () => {
        setIsProcessing(true);
        // Simulate network delay
        setTimeout(() => {
            const separator = callbackUrl.includes("?") ? "&" : "?";
            const finalUrl = `${callbackUrl}${separator}reference=${reference}`;
            window.location.href = finalUrl;
        }, 1500);
    };

    const handleDecline = () => {
        setIsProcessing(true);
        // Simulate network delay
        setTimeout(() => {
            // Redirect to callback but maybe without reference or with error?
            // Usually we just cancel.
            // Let's redirect to checkout with error
            const url = new URL(callbackUrl);
            const orderId = url.searchParams.get("orderId");
            router.push(`/checkout?error=payment_cancelled&orderId=${orderId}`);
        }, 1000);
    };

    return (
        <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary">
            <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <CreditCard className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Moolre Payment</CardTitle>
                <CardDescription>Secure Payment Simulator (Test Mode)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="rounded-lg bg-muted p-4 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Order Reference</span>
                        <span className="font-mono text-xs truncate max-w-[150px]">{reference}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Amount</span>
                        <span className="text-xl font-bold">{currency} {amount}</span>
                    </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/10 text-yellow-800 dark:text-yellow-400 p-3 rounded-md text-sm text-center">
                    This is a simulated payment page. No real money will be charged.
                </div>
            </CardContent>
            <CardFooter className="flex gap-4">
                <Button
                    variant="outline"
                    className="flex-1 border-red-200 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                    onClick={handleDecline}
                    disabled={isProcessing}
                >
                    Cancel
                </Button>
                <Button
                    variant="default"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={handleApprove}
                    disabled={isProcessing}
                >
                    {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                    Approve Payment
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function MockPaymentPage() {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex flex-col items-center justify-center p-4">
            <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
                <MockPaymentContent />
            </Suspense>
        </div>
    );
}
