"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface NewsletterEnhancedProps {
    title?: string;
    subtitle?: string;
    backgroundColor?: string;
    textColor?: string;
    backgroundImage?: string;
}

export function NewsletterEnhanced({
    title = "Join the Community",
    subtitle = "Subscribe for exclusive offers, early access to new products, and 10% off your first order.",
    backgroundColor = "#18181B",
    textColor = "#FFFFFF",
    backgroundImage
}: NewsletterEnhancedProps) {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setIsSubscribed(true);
        setIsLoading(false);
        toast.success("Welcome! Check your email for a special discount.");
    };

    return (
        <section
            className="relative py-16 md:py-24 overflow-hidden"
            style={{
                backgroundColor,
                color: textColor,
                backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            {/* Overlay for background image */}
            {backgroundImage && (
                <div className="absolute inset-0 bg-black/60" />
            )}

            {/* Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-white/10 backdrop-blur-sm mb-6">
                        <Sparkles className="h-6 w-6" style={{ color: textColor }} />
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                        {title}
                    </h2>

                    {/* Subtitle */}
                    <p
                        className="text-base md:text-lg max-w-xl mx-auto mb-8"
                        style={{ color: textColor, opacity: 0.8 }}
                    >
                        {subtitle}
                    </p>

                    {/* Form */}
                    {!isSubscribed ? (
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                        >
                            <div className="relative flex-1">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12 pl-12 rounded-full bg-white text-black placeholder:text-muted-foreground border-0"
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                size="lg"
                                disabled={isLoading}
                                className="h-12 px-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shrink-0"
                            >
                                {isLoading ? (
                                    <span className="animate-pulse">Subscribing...</span>
                                ) : (
                                    <>
                                        Subscribe
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3"
                        >
                            <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                                <Check className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-medium">You're on the list!</span>
                        </motion.div>
                    )}

                    {/* Trust Text */}
                    <p
                        className="text-xs mt-4"
                        style={{ color: textColor, opacity: 0.5 }}
                    >
                        No spam, unsubscribe at any time. We respect your privacy.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
