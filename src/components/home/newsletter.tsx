"use client";

import { motion } from "framer-motion";
import { Send } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Container } from "@/components/shared/container";

interface NewsletterProps {
    backgroundColor?: string;
    backgroundImage?: string;
    textColor?: string;
}

export function Newsletter({ backgroundColor, backgroundImage, textColor }: NewsletterProps) {
    // Determine text color classes based on background
    const isDark = backgroundColor?.startsWith('#')
        ? parseInt(backgroundColor.slice(1, 3), 16) < 128
        : true; // Default to dark background assumption

    const textColorClass = textColor || (isDark ? "#FFFFFF" : "#1C1917");

    return (
        <section
            className="relative overflow-hidden py-24"
            style={{
                backgroundColor: backgroundColor || "#1B4D3E",
                color: textColorClass
            }}
        >
            {/* Background Image */}
            {backgroundImage && (
                <div className="absolute inset-0">
                    <Image
                        src={backgroundImage}
                        alt="Newsletter background"
                        fill
                        className="object-cover"
                        priority={false}
                    />
                    {/* Dark overlay for text readability */}
                    <div className="absolute inset-0 bg-black/50" />
                </div>
            )}

            {/* Abstract Background Shapes (only show if no image) */}
            {!backgroundImage && (
                <>
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-black/10 blur-3xl" />
                </>
            )}

            <Container className="relative z-10">
                <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                            Join the Inner Circle
                        </h2>
                        <p className="mt-4 max-w-2xl text-lg opacity-90">
                            Subscribe to our newsletter for exclusive access to new drops, member-only offers, and design inspiration.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mt-10 w-full max-w-md"
                    >
                        <form className="flex flex-col gap-4 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                className="h-12 rounded-full border-white/20 bg-white/10 px-6 text-white placeholder:text-white/60 focus-visible:ring-white/50 focus-visible:ring-offset-0"
                            />
                            <Button
                                type="submit"
                                variant="secondary"
                                size="lg"
                                className="h-12 rounded-full px-8 font-bold"
                            >
                                Subscribe <Send className="ml-2 h-4 w-4" />
                            </Button>
                        </form>
                        <p className="mt-4 text-xs opacity-70">
                            By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
                        </p>
                    </motion.div>
                </div>
            </Container>
        </section>
    );
}
