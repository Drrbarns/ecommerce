"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface HeroSlide {
    id: string;
    title: string;
    subtitle: string;
    badge?: string;
    buttonText: string;
    buttonLink: string;
    secondaryButtonText?: string;
    secondaryButtonLink?: string;
    image: string;
    mobileImage?: string;
    overlayOpacity?: number;
    textPosition?: "left" | "center" | "right";
}

interface HeroPremiumProps {
    slides?: HeroSlide[];
    autoPlay?: boolean;
    autoPlayInterval?: number;
}

const defaultSlides: HeroSlide[] = [
    {
        id: "1",
        title: "Discover\nPremium\nQuality Products",
        subtitle: "Shop the latest collection of handpicked items, crafted with care and delivered with love to your doorstep.",
        badge: "New Collection",
        buttonText: "Shop Now",
        buttonLink: "/shop",
        secondaryButtonText: "Watch Video",
        secondaryButtonLink: "#",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
        overlayOpacity: 0.4,
        textPosition: "left"
    },
    {
        id: "2",
        title: "Summer\nEssentials\nAre Here",
        subtitle: "Explore our curated selection of summer must-haves. Limited edition pieces you won't find anywhere else.",
        badge: "Limited Edition",
        buttonText: "Explore Collection",
        buttonLink: "/collections/summer",
        image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop",
        overlayOpacity: 0.5,
        textPosition: "left"
    },
    {
        id: "3",
        title: "Elevate\nYour\nEveryday Style",
        subtitle: "Premium accessories designed for the modern lifestyle. Quality that speaks for itself.",
        badge: "Bestsellers",
        buttonText: "Shop Accessories",
        buttonLink: "/collections/accessories",
        image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop",
        overlayOpacity: 0.45,
        textPosition: "left"
    }
];

export function HeroPremium({
    slides = defaultSlides,
    autoPlay = true,
    autoPlayInterval = 6000
}: HeroPremiumProps) {
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(0);

    const next = () => {
        setDirection(1);
        setCurrent((prev) => (prev + 1) % slides.length);
    };

    const prev = () => {
        setDirection(-1);
        setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    };

    useEffect(() => {
        if (!autoPlay) return;
        const timer = setInterval(next, autoPlayInterval);
        return () => clearInterval(timer);
    }, [autoPlay, autoPlayInterval]);

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? "100%" : "-100%",
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction < 0 ? "100%" : "-100%",
            opacity: 0
        })
    };

    const textVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: { delay: 0.3 + i * 0.1, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const }
        })
    };

    const currentSlide = slides[current];

    return (
        <section className="relative w-full h-[85vh] md:h-[90vh] overflow-hidden bg-black">
            {/* Slides */}
            <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                    key={current}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="absolute inset-0"
                >
                    {/* Background Image */}
                    <Image
                        src={currentSlide.image}
                        alt={currentSlide.title}
                        fill
                        priority
                        className="object-cover"
                    />

                    {/* Overlay */}
                    <div
                        className="absolute inset-0 bg-black"
                        style={{ opacity: currentSlide.overlayOpacity || 0.4 }}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                </motion.div>
            </AnimatePresence>

            {/* Content */}
            <div className="relative z-10 h-full flex items-center">
                <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="max-w-2xl"
                        >
                            {/* Badge */}
                            {currentSlide.badge && (
                                <motion.span
                                    custom={0}
                                    variants={textVariants}
                                    className="inline-flex items-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 text-xs font-semibold text-white uppercase tracking-wider mb-6"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2 animate-pulse" />
                                    {currentSlide.badge}
                                </motion.span>
                            )}

                            {/* Title */}
                            <motion.h1
                                custom={1}
                                variants={textVariants}
                                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6"
                            >
                                {currentSlide.title.split('\n').map((line, i) => (
                                    <span key={i} className="block">
                                        {line}
                                    </span>
                                ))}
                            </motion.h1>

                            {/* Subtitle */}
                            <motion.p
                                custom={2}
                                variants={textVariants}
                                className="text-base md:text-lg text-white/80 max-w-lg mb-8 leading-relaxed"
                            >
                                {currentSlide.subtitle}
                            </motion.p>

                            {/* Buttons */}
                            <motion.div
                                custom={3}
                                variants={textVariants}
                                className="flex flex-wrap gap-4"
                            >
                                <Button
                                    size="lg"
                                    className="h-12 md:h-14 px-8 rounded-full bg-white text-black hover:bg-white/90 font-semibold text-base shadow-xl"
                                    asChild
                                >
                                    <Link href={currentSlide.buttonLink}>
                                        {currentSlide.buttonText}
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                                {currentSlide.secondaryButtonText && (
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="h-12 md:h-14 px-8 rounded-full border-2 border-white/30 bg-white/5 text-white hover:bg-white/10 hover:border-white/50 font-semibold text-base backdrop-blur-sm"
                                        asChild
                                    >
                                        <Link href={currentSlide.secondaryButtonLink || "#"}>
                                            <Play className="mr-2 h-4 w-4 fill-current" />
                                            {currentSlide.secondaryButtonText}
                                        </Link>
                                    </Button>
                                )}
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Navigation Arrows */}
            {slides.length > 1 && (
                <>
                    <button
                        onClick={prev}
                        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
                    </button>
                </>
            )}

            {/* Slide Indicators */}
            {slides.length > 1 && (
                <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setDirection(index > current ? 1 : -1);
                                setCurrent(index);
                            }}
                            className={`h-1.5 rounded-full transition-all duration-300 ${index === current
                                ? 'w-8 bg-white'
                                : 'w-1.5 bg-white/40 hover:bg-white/60'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Bottom Gradient Fade */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent z-10" />
        </section>
    );
}
