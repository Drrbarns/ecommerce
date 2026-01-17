"use client";

import { motion } from "framer-motion";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Container } from "@/components/shared/container";

export function Newsletter() {
    return (
        <section className="relative overflow-hidden bg-primary py-24 text-primary-foreground">
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-black/10 blur-3xl" />

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
                        <p className="mt-4 max-w-2xl text-lg text-primary-foreground/90">
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
                                className="h-12 rounded-full border-primary-foreground/20 bg-white/10 px-6 text-primary-foreground placeholder:text-primary-foreground/60 focus-visible:ring-primary-foreground/50 focus-visible:ring-offset-0"
                            />
                            <Button
                                type="submit"
                                variant="secondary"
                                size="lg"
                                className="h-12 rounded-full px-8 text-primary font-bold hover:bg-white"
                            >
                                Subscribe <Send className="ml-2 h-4 w-4" />
                            </Button>
                        </form>
                        <p className="mt-4 text-xs text-primary-foreground/70">
                            By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
                        </p>
                    </motion.div>
                </div>
            </Container>
        </section>
    );
}
