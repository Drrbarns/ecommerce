"use client";

import Link from "next/link";
import { MessageCircle, ShoppingBag, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useScroll } from "@/hooks/use-scroll";

export function StickyMobileBar() {
    const scrolled = useScroll(100);

    return (
        <AnimatePresence>
            {scrolled && (
                <motion.div
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    exit={{ y: 100 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="fixed bottom-0 left-0 right-0 z-50 flex h-[80px] items-center justify-between gap-4 border-t bg-background/80 p-4 backdrop-blur-lg md:hidden pb-safe"
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        className="flex-1 flex-col gap-1 rounded-none hover:bg-transparent"
                        asChild
                    >
                        <Link href="/cart">
                            <ShoppingBag className="h-5 w-5" />
                            <span className="text-[10px] uppercase font-bold tracking-wide">Cart</span>
                        </Link>
                    </Button>

                    <Button
                        className="flex-[2] rounded-full shadow-lg gap-2"
                        asChild
                    >
                        <Link href="/checkout">
                            Checkout <CreditCard className="h-4 w-4" />
                        </Link>
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="flex-1 flex-col gap-1 rounded-none hover:bg-transparent text-green-600"
                        asChild
                    >
                        <Link href="https://wa.me/233000000000" target="_blank">
                            <MessageCircle className="h-5 w-5" />
                            <span className="text-[10px] uppercase font-bold tracking-wide">WhatsApp</span>
                        </Link>
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
