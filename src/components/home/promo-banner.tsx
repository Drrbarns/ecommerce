"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface PromoBannerProps {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    buttonLink?: string;
    image?: string;
    backgroundColor?: string;
    textColor?: string;
    badge?: string;
    discount?: string;
}

export function PromoBanner({
    title = "Summer Sale",
    subtitle = "Up to 50% off on selected items. Limited time offer.",
    buttonText = "Shop the Sale",
    buttonLink = "/shop?sale=true",
    image = "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
    backgroundColor = "#0B1220",
    textColor = "#FFFFFF",
    badge = "LIMITED TIME",
    discount = "50% OFF"
}: PromoBannerProps) {
    return (
        <section className="py-8 md:py-16 px-4">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative overflow-hidden rounded-2xl md:rounded-3xl"
                    style={{ backgroundColor }}
                >
                    <div className="grid md:grid-cols-2 min-h-[400px] md:min-h-[500px]">
                        {/* Content */}
                        <div
                            className="relative z-10 flex flex-col justify-center p-8 md:p-12 lg:p-16"
                            style={{ color: textColor }}
                        >
                            {badge && (
                                <span className="inline-flex items-center self-start rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-sm">
                                    {badge}
                                </span>
                            )}

                            {discount && (
                                <div className="mb-4">
                                    <span className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter">
                                        {discount}
                                    </span>
                                </div>
                            )}

                            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4">
                                {title}
                            </h2>

                            <p className="text-sm md:text-base opacity-80 max-w-md mb-8">
                                {subtitle}
                            </p>

                            <Button
                                size="lg"
                                className="self-start h-12 md:h-14 px-8 rounded-full bg-white text-black hover:bg-white/90 font-semibold"
                                asChild
                            >
                                <Link href={buttonLink}>
                                    {buttonText}
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        </div>

                        {/* Image */}
                        <div className="relative hidden md:block">
                            {image && (
                                <>
                                    <Image
                                        src={image}
                                        alt="Promo"
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile Background Image */}
                    <div
                        className="absolute inset-0 md:hidden opacity-30"
                        style={{
                            backgroundImage: image ? `url(${image})` : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    />
                </motion.div>
            </div>
        </section>
    );
}
