"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface Category {
    id: string;
    name: string;
    slug: string;
    image?: string | null;
    productCount?: number;
}

interface CategoryGridProps {
    categories: Category[];
    title?: string;
    subtitle?: string;
    backgroundColor?: string;
}

export function CategoryGrid({
    categories,
    title = "Shop by Category",
    subtitle = "Find exactly what you're looking for",
    backgroundColor = "#FFFFFF"
}: CategoryGridProps) {
    // Take first 6 categories for the grid
    const displayCategories = categories.slice(0, 6);

    return (
        <section
            className="py-12 md:py-20 px-4"
            style={{ backgroundColor }}
        >
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-10 md:mb-14"
                >
                    <h2 className="text-2xl md:text-4xl font-bold mb-3">
                        {title}
                    </h2>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                        {subtitle}
                    </p>
                </motion.div>

                {/* Category Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                    {displayCategories.map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link
                                href={`/collections/${category.slug}`}
                                className="group relative block aspect-[4/5] md:aspect-square overflow-hidden rounded-xl md:rounded-2xl bg-muted"
                            >
                                {/* Image */}
                                {category.image ? (
                                    <Image
                                        src={category.image}
                                        alt={category.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5" />
                                )}

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                                {/* Content */}
                                <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6">
                                    <h3 className="text-white text-lg md:text-xl font-bold mb-1">
                                        {category.name}
                                    </h3>
                                    <div className="flex items-center text-white/80 text-sm group-hover:text-white transition-colors">
                                        <span>Shop Now</span>
                                        <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>

                                {/* Hover Effect Border */}
                                <div className="absolute inset-0 rounded-xl md:rounded-2xl ring-2 ring-white/0 group-hover:ring-white/20 transition-all" />
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* View All Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mt-10"
                >
                    <Link
                        href="/collections"
                        className="inline-flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors group"
                    >
                        View All Categories
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
