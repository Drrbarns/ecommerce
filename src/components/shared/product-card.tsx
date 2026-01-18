"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Product } from "@/types";

interface ProductCardProps {
    product: Product;
    className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className={cn("group relative", className)}
        >
            {/* Image Container */}
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-secondary/10">
                {product.isNew && (
                    <Badge className="absolute left-2 top-2 z-10 bg-black text-white px-2 py-0.5 text-xs font-medium hover:bg-black/90 rounded-sm uppercase tracking-wide">
                        New
                    </Badge>
                )}
                {product.isSale && (
                    <Badge variant="destructive" className="absolute left-2 top-2 z-10 px-2 py-0.5 text-xs font-medium rounded-sm uppercase tracking-wide">
                        Sale
                    </Badge>
                )}

                <Link href={`/products/${product.slug}`} className="block h-full w-full">
                    <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </Link>

                {/* Desktop Action Buttons (Reveal on Hover) */}
                <div className="hidden md:flex absolute bottom-4 left-0 right-0 justify-center gap-2 px-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <Button
                        size="icon"
                        variant="secondary"
                        className="h-10 w-10 rounded-full bg-white shadow-md hover:bg-white hover:scale-105 transition-all text-black"
                        aria-label="Add to Wishlist"
                    >
                        <Heart className="h-4 w-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="secondary"
                        className="h-10 w-10 rounded-full bg-white shadow-md hover:bg-white hover:scale-105 transition-all text-black"
                        aria-label="Quick View"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                        size="icon"
                        className="h-10 w-10 rounded-full bg-black shadow-md hover:bg-black/90 hover:scale-105 transition-all text-white"
                        aria-label="Add to Cart"
                    >
                        <ShoppingBag className="h-4 w-4" />
                    </Button>
                </div>

                {/* Mobile Add to Cart Button (Always Visible) */}
                <div className="md:hidden absolute bottom-2 right-2 z-10">
                    <Button
                        size="icon"
                        className="h-9 w-9 rounded-full bg-white/90 shadow-sm backdrop-blur-sm text-black hover:bg-white border border-black/5"
                        aria-label="Add to Cart"
                    >
                        <ShoppingBag className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Product Info */}
            <div className="mt-4 space-y-1">
                <h3 className="text-sm md:text-base font-medium text-foreground leading-snug">
                    <Link href={`/products/${product.slug}`} className="hover:underline decoration-1 underline-offset-4">
                        {product.name}
                    </Link>
                </h3>
                <div className="flex items-center gap-2">
                    <p className="text-sm md:text-base font-semibold">₵{product.price.toFixed(2)}</p>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <p className="text-xs md:text-sm text-muted-foreground line-through">
                            ₵{product.compareAtPrice.toFixed(2)}
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
