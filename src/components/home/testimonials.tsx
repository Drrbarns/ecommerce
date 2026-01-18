"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Testimonial {
    id: string;
    name: string;
    role?: string;
    avatar?: string;
    content: string;
    rating: number;
}

interface TestimonialsProps {
    testimonials?: Testimonial[];
    backgroundColor?: string;
    title?: string;
    subtitle?: string;
}

const defaultTestimonials: Testimonial[] = [
    {
        id: "1",
        name: "Sarah Johnson",
        role: "Verified Buyer",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
        content: "Absolutely love the quality! The products exceeded my expectations. Fast shipping and excellent customer service. Will definitely be ordering again!",
        rating: 5
    },
    {
        id: "2",
        name: "Michael Chen",
        role: "Loyal Customer",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
        content: "Best online shopping experience I've had in years. The attention to detail in packaging and product quality is remarkable. Highly recommend!",
        rating: 5
    },
    {
        id: "3",
        name: "Emma Williams",
        role: "Fashion Enthusiast",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
        content: "These products are a game-changer! Premium quality at reasonable prices. The customer support team is incredibly helpful and responsive.",
        rating: 5
    }
];

export function Testimonials({
    testimonials = defaultTestimonials,
    backgroundColor = "#FFFFFF",
    title = "What Our Customers Say",
    subtitle = "Real reviews from real customers"
}: TestimonialsProps) {
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(0);

    const next = () => {
        setDirection(1);
        setCurrent((prev) => (prev + 1) % testimonials.length);
    };

    const prev = () => {
        setDirection(-1);
        setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    // Auto-advance
    useEffect(() => {
        const timer = setInterval(next, 6000);
        return () => clearInterval(timer);
    }, []);

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 300 : -300,
            opacity: 0
        })
    };

    return (
        <section
            className="py-16 md:py-24 px-4 overflow-hidden"
            style={{ backgroundColor }}
        >
            <div className="max-w-4xl mx-auto text-center">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-3">
                        {title}
                    </h2>
                    <p className="text-muted-foreground">
                        {subtitle}
                    </p>
                </motion.div>

                {/* Testimonial Carousel */}
                <div className="relative">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={current}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="px-4 md:px-12"
                        >
                            {/* Quote Icon */}
                            <Quote className="h-10 w-10 mx-auto mb-6 text-primary/20 rotate-180" />

                            {/* Content */}
                            <blockquote className="text-lg md:text-xl lg:text-2xl font-medium leading-relaxed mb-8">
                                "{testimonials[current].content}"
                            </blockquote>

                            {/* Rating */}
                            <div className="flex justify-center gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <svg
                                        key={i}
                                        className={`h-5 w-5 ${i < testimonials[current].rating ? 'text-yellow-400' : 'text-gray-200'}`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>

                            {/* Author */}
                            <div className="flex items-center justify-center gap-3">
                                {testimonials[current].avatar && (
                                    <div className="relative h-12 w-12 rounded-full overflow-hidden">
                                        <Image
                                            src={testimonials[current].avatar}
                                            alt={testimonials[current].name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                                <div className="text-left">
                                    <p className="font-semibold">
                                        {testimonials[current].name}
                                    </p>
                                    {testimonials[current].role && (
                                        <p className="text-sm text-muted-foreground">
                                            {testimonials[current].role}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex justify-center gap-4 mt-10">
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full h-10 w-10"
                            onClick={prev}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>

                        {/* Dots */}
                        <div className="flex items-center gap-2">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setDirection(index > current ? 1 : -1);
                                        setCurrent(index);
                                    }}
                                    className={`h-2 rounded-full transition-all ${index === current ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30'
                                        }`}
                                />
                            ))}
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full h-10 w-10"
                            onClick={next}
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
