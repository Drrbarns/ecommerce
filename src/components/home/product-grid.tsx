"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Product } from "@/types";
import { ProductCardVariant } from "./product-card-variants";

type LayoutVariant = "premium" | "minimal" | "classic" | "modern" | "luxury";

interface ProductGridProps {
    products: Product[];
    title?: string;
    subtitle?: string;
    backgroundColor?: string;
    showViewAll?: boolean;
    viewAllLink?: string;
    columns?: 2 | 3 | 4;
    variant?: LayoutVariant;
}

export function ProductGrid({
    products,
    title = "Trending Now",
    subtitle = "Our most popular products this week",
    backgroundColor = "#FAFAFA",
    showViewAll = true,
    viewAllLink = "/shop",
    columns = 4,
    variant = "premium"
}: ProductGridProps) {
    // Different grid configurations per variant
    const getGridClasses = () => {
        switch (variant) {
            case "modern":
                return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1";
            case "luxury":
                return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12";
            case "minimal":
                return "grid-cols-2 md:grid-cols-4 gap-6 md:gap-8";
            case "classic":
                return "grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6";
            case "premium":
            default:
                return `grid-cols-2 lg:grid-cols-${columns} gap-4 md:gap-6`;
        }
    };

    // Different header styles per variant
    const renderHeader = () => {
        switch (variant) {
            case "luxury":
                return (
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 mb-3">
                            Curated Selection
                        </p>
                        <h2 className="font-serif text-3xl md:text-4xl text-zinc-900 mb-4">
                            {title}
                        </h2>
                        <div className="w-12 h-px bg-zinc-300 mx-auto" />
                    </motion.div>
                );
            case "modern":
                return (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex items-end justify-between mb-6 border-b-4 border-black pb-4"
                    >
                        <div>
                            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight">
                                {title}
                            </h2>
                            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                                {subtitle}
                            </p>
                        </div>
                        {showViewAll && (
                            <Link
                                href={viewAllLink}
                                className="hidden md:inline-flex items-center gap-1 text-sm font-bold uppercase hover:underline"
                            >
                                View All
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        )}
                    </motion.div>
                );
            case "minimal":
                return (
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-xl md:text-2xl font-light tracking-wide">
                            {title}
                        </h2>
                    </motion.div>
                );
            case "classic":
            case "premium":
            default:
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-12"
                    >
                        <div>
                            <h2 className="text-2xl md:text-4xl font-bold mb-2">
                                {title}
                            </h2>
                            <p className="text-muted-foreground">
                                {subtitle}
                            </p>
                        </div>
                        {showViewAll && (
                            <Link
                                href={viewAllLink}
                                className="hidden md:inline-flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors group"
                            >
                                View All Products
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        )}
                    </motion.div>
                );
        }
    };

    return (
        <section
            className="py-12 md:py-20 px-4"
            style={{ backgroundColor }}
        >
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                {renderHeader()}

                {/* Products Grid */}
                <div className={`grid ${getGridClasses()}`}>
                    {products.map((product, index) => (
                        <ProductCardVariant
                            key={product.id}
                            product={product}
                            variant={variant}
                            index={index}
                        />
                    ))}
                </div>

                {/* Mobile View All */}
                {showViewAll && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mt-8 md:hidden"
                    >
                        <Button
                            variant={variant === "modern" ? "default" : "outline"}
                            className={variant === "luxury" ? "rounded-none" : "rounded-full"}
                            asChild
                        >
                            <Link href={viewAllLink}>
                                View All Products
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </motion.div>
                )}
            </div>
        </section>
    );
}
