"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Truck, Gift, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AnnouncementBarProps {
    text?: string;
    link?: string;
    backgroundColor?: string;
    textColor?: string;
}

export function AnnouncementBar({
    text = "🎉 Free Shipping on Orders Over ₵500 • Shop Now →",
    link = "/shop",
    backgroundColor = "#18181B",
    textColor = "#FFFFFF"
}: AnnouncementBarProps) {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="relative overflow-hidden"
                style={{ backgroundColor, color: textColor }}
            >
                <div className="flex items-center justify-center gap-2 py-2.5 px-4 text-center text-xs sm:text-sm font-medium">
                    <div className="hidden sm:flex items-center gap-6">
                        <span className="flex items-center gap-1.5">
                            <Truck className="h-3.5 w-3.5" />
                            Free Shipping
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Gift className="h-3.5 w-3.5" />
                            Gift Wrapping
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5" />
                            Premium Quality
                        </span>
                    </div>
                    <Link
                        href={link}
                        className="sm:hidden hover:underline underline-offset-4"
                    >
                        {text}
                    </Link>
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-60 hover:opacity-100 transition-opacity"
                    aria-label="Close announcement"
                >
                    <X className="h-4 w-4" />
                </button>
            </motion.div>
        </AnimatePresence>
    );
}
