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
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-secondary/20">
                {product.isNew && (
                    <Badge className="absolute left-3 top-3 z-10 bg-primary px-3 py-1 font-medium hover:bg-primary">
                        New
                    </Badge>
                )}
                {product.isSale && (
                    <Badge variant="destructive" className="absolute left-3 top-3 z-10 px-3 py-1 font-medium">
                        Sale
                    </Badge>
                )}

                <Link href={`/products/${product.slug}`} className="block h-full w-full">
                    {/* Fallback image if source is missing or placeholder */}
                    <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </Link>

                {/* Action Buttons (Reveal on Hover) */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <Button
                        size="icon"
                        variant="secondary"
                        className="h-10 w-10 rounded-full bg-background/90 shadow-sm backdrop-blur-sm transition-transform hover:scale-110 hover:bg-background"
                        aria-label="Add to Wishlist"
                    >
                        <Heart className="h-4 w-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="secondary"
                        className="h-10 w-10 rounded-full bg-background/90 shadow-sm backdrop-blur-sm transition-transform hover:scale-110 hover:bg-background"
                        aria-label="Quick View"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                        size="icon"
                        className="h-10 w-10 rounded-full bg-primary shadow-sm transition-transform hover:scale-110 hover:bg-primary/90"
                        aria-label="Add to Cart"
                    >
                        <ShoppingBag className="h-4 w-4 text-primary-foreground" />
                    </Button>
                </div>
            </div>

            {/* Product Info */}
            <div className="mt-4 space-y-1">
                <div className="flex justify-between items-start">
                    <h3 className="font-medium text-foreground leading-snug">
                        <Link href={`/products/${product.slug}`}>
                            {product.name}
                        </Link>
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    <p className="font-semibold text-primary">₵{product.price.toFixed(2)}</p>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <p className="text-sm text-muted-foreground line-through">
                            ₵{product.compareAtPrice.toFixed(2)}
                        </p>
                    )}
                </div>
                {/* <p className="text-sm text-muted-foreground">{product.category}</p> */}
            </div>
        </motion.div>
    );
}
