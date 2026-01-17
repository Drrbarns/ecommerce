"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Package, Truck, CheckCircle, Clock, Search, ExternalLink, MapPin } from "lucide-react";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getOrderByTrackingNumber } from "@/lib/actions/order-actions";

interface TrackingResult {
    id: string;
    status: string;
    trackingNumber: string;
    carrier: string | null;
    trackingUrl: string | null;
    createdAt: string;
    updatedAt: string;
    recipientName: string;
}

const statusSteps = [
    { key: "pending", label: "Order Placed", icon: Package },
    { key: "processing", label: "Processing", icon: Clock },
    { key: "shipped", label: "Shipped", icon: Truck },
    { key: "delivered", label: "Delivered", icon: CheckCircle },
];

function getStatusIndex(status: string): number {
    const index = statusSteps.findIndex(s => s.key === status);
    return index >= 0 ? index : 0;
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
    switch (status) {
        case "delivered": return "default";
        case "shipped": return "secondary";
        case "cancelled": return "destructive";
        default: return "outline";
    }
}

export function TrackingForm() {
    const [trackingNumber, setTrackingNumber] = useState("");
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<TrackingResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!trackingNumber.trim()) {
            setError("Please enter a tracking number");
            return;
        }

        setError(null);
        setResult(null);
        setHasSearched(true);

        startTransition(async () => {
            const response = await getOrderByTrackingNumber(trackingNumber);

            if (response.success && response.order) {
                setResult(response.order);
            } else {
                setError(response.error || "Something went wrong");
            }
        });
    };

    const currentStep = result ? getStatusIndex(result.status) : -1;

    return (
        <Container>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <Truck className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                    Track Your Order
                </h1>
                <p className="text-muted-foreground max-w-md mx-auto">
                    Enter your tracking number below to see the current status of your shipment.
                </p>
            </motion.div>

            {/* Search Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="max-w-xl mx-auto mb-12"
            >
                <form onSubmit={handleSearch} className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Enter your tracking number"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            className="pl-10 h-12"
                        />
                    </div>
                    <Button type="submit" size="lg" disabled={isPending} className="h-12 px-6">
                        {isPending ? "Searching..." : "Track"}
                    </Button>
                </form>
            </motion.div>

            {/* Error Message */}
            {error && hasSearched && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-xl mx-auto"
                >
                    <Card className="border-destructive/50 bg-destructive/5">
                        <CardContent className="py-6 text-center">
                            <p className="text-destructive font-medium">{error}</p>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Tracking Result */}
            {result && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto space-y-6"
                >
                    {/* Order Info Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <CardTitle className="flex items-center gap-3 flex-wrap">
                                        Order #{result.id.substring(0, 8)}
                                        <Badge variant={getStatusVariant(result.status)}>
                                            {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                                        </Badge>
                                    </CardTitle>
                                    <CardDescription>
                                        Tracking: {result.trackingNumber}
                                    </CardDescription>
                                </div>
                                {result.trackingUrl && (
                                    <Button variant="outline" size="sm" asChild>
                                        <a href={result.trackingUrl} target="_blank" rel="noopener noreferrer">
                                            Track with Carrier <ExternalLink className="ml-2 h-4 w-4" />
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Quick Info */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Recipient</p>
                                    <p className="font-medium">{result.recipientName}</p>
                                </div>
                                {result.carrier && (
                                    <div>
                                        <p className="text-muted-foreground">Carrier</p>
                                        <p className="font-medium">{result.carrier}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-muted-foreground">Order Date</p>
                                    <p className="font-medium">
                                        {new Date(result.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {/* Status Timeline */}
                            <div className="pt-6 border-t">
                                <h3 className="font-semibold mb-6">Shipment Progress</h3>
                                <div className="relative">
                                    {/* Progress Line */}
                                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted hidden sm:block" />
                                    <div
                                        className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500 hidden sm:block"
                                        style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
                                    />

                                    {/* Steps */}
                                    <div className="relative flex flex-col sm:flex-row sm:justify-between gap-4 sm:gap-0">
                                        {statusSteps.map((step, index) => {
                                            const isCompleted = index <= currentStep;
                                            const isCurrent = index === currentStep;
                                            const StepIcon = step.icon;

                                            return (
                                                <div key={step.key} className="flex sm:flex-col items-center gap-3 sm:gap-0">
                                                    <div
                                                        className={`
                                                            relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all flex-shrink-0
                                                            ${isCompleted
                                                                ? "bg-primary border-primary text-primary-foreground"
                                                                : "bg-background border-muted text-muted-foreground"
                                                            }
                                                            ${isCurrent ? "ring-4 ring-primary/20" : ""}
                                                        `}
                                                    >
                                                        <StepIcon className="h-5 w-5" />
                                                    </div>
                                                    <p className={`sm:mt-2 text-sm font-medium sm:text-center ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                                                        {step.label}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Last Update */}
                            <div className="pt-4 text-center text-sm text-muted-foreground">
                                Last updated: {new Date(result.updatedAt).toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Help Section */}
                    <Card className="bg-secondary/30">
                        <CardContent className="py-6">
                            <div className="flex items-start gap-4">
                                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold mb-1">Need Help?</h4>
                                    <p className="text-sm text-muted-foreground">
                                        If you have any questions about your order, please contact our support team
                                        with your tracking number ready.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </Container>
    );
}
