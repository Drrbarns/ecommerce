"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Heart, Eye, Plus, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types";

type ProductCardVariant = "premium" | "minimal" | "classic" | "modern" | "luxury";

interface ProductCardVariantProps {
    product: Product;
    variant?: ProductCardVariant;
    index?: number;
}

/**
 * PREMIUM VARIANT
 * Clean, modern design with hover effects and quick actions
 */
function ProductCardPremium({ product, index = 0 }: { product: Product; index?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="group"
        >
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted mb-3">
                {/* Badges */}
                <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
                    {product.isNew && (
                        <Badge className="bg-black text-white text-[10px] px-2 py-0.5 uppercase tracking-wide">
                            New
                        </Badge>
                    )}
                    {product.isSale && (
                        <Badge variant="destructive" className="text-[10px] px-2 py-0.5 uppercase tracking-wide">
                            Sale
                        </Badge>
                    )}
                </div>

                {/* Wishlist */}
                <button className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                    <Heart className="h-4 w-4" />
                </button>

                <Link href={`/products/${product.slug}`}>
                    <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                </Link>

                {/* Quick Add Desktop */}
                <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-all hidden md:block">
                    <Button className="w-full rounded-full bg-black/90 backdrop-blur-sm hover:bg-black text-white h-10">
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Quick Add
                    </Button>
                </div>

                {/* Mobile Add */}
                <button className="md:hidden absolute bottom-2 right-2 h-9 w-9 rounded-full bg-white shadow-md flex items-center justify-center">
                    <ShoppingBag className="h-4 w-4" />
                </button>
            </div>

            <div className="space-y-1">
                <Link href={`/products/${product.slug}`} className="block text-sm font-medium hover:underline line-clamp-1">
                    {product.name}
                </Link>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">₵{product.price.toFixed(2)}</span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="text-xs text-muted-foreground line-through">₵{product.compareAtPrice.toFixed(2)}</span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

/**
 * MINIMAL VARIANT
 * Ultra-clean, typography-focused, no clutter
 */
function ProductCardMinimal({ product, index = 0 }: { product: Product; index?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="group"
        >
            <Link href={`/products/${product.slug}`} className="block">
                <div className="relative aspect-square overflow-hidden bg-zinc-100 mb-4">
                    <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover transition-all duration-500 group-hover:scale-102"
                    />
                </div>
                <div className="text-center">
                    <h3 className="text-sm tracking-wide mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">₵{product.price.toFixed(2)}</p>
                </div>
            </Link>
        </motion.div>
    );
}

/**
 * CLASSIC VARIANT
 * Traditional e-commerce card with all info visible
 */
function ProductCardClassic({ product, index = 0 }: { product: Product; index?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="group bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow overflow-hidden"
        >
            <div className="relative aspect-square overflow-hidden">
                {/* Badges */}
                {(product.isNew || product.isSale) && (
                    <div className="absolute left-0 top-3 z-10 flex flex-col gap-1">
                        {product.isNew && (
                            <span className="bg-blue-500 text-white text-xs px-3 py-1 font-medium">NEW</span>
                        )}
                        {product.isSale && (
                            <span className="bg-red-500 text-white text-xs px-3 py-1 font-medium">SALE</span>
                        )}
                    </div>
                )}

                <Link href={`/products/${product.slug}`}>
                    <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </Link>

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="icon" variant="secondary" className="rounded-full h-10 w-10">
                        <Heart className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="secondary" className="rounded-full h-10 w-10">
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="icon" className="rounded-full h-10 w-10 bg-primary">
                        <ShoppingBag className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="p-4">
                <Link href={`/products/${product.slug}`}>
                    <h3 className="font-medium text-sm mb-1 hover:text-primary transition-colors line-clamp-2">
                        {product.name}
                    </h3>
                </Link>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">₵{product.price.toFixed(2)}</span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="text-sm text-muted-foreground line-through">
                            ₵{product.compareAtPrice.toFixed(2)}
                        </span>
                    )}
                </div>

                {/* Add to Cart Button */}
                <Button className="w-full mt-3 rounded-md" size="sm">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Add to Cart
                </Button>
            </div>
        </motion.div>
    );
}

/**
 * MODERN VARIANT
 * Bold, high contrast, dynamic
 */
function ProductCardModern({ product, index = 0 }: { product: Product; index?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.03 }}
            className="group relative bg-black text-white overflow-hidden"
        >
            <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-75"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                {/* Badges */}
                {product.isNew && (
                    <div className="absolute top-3 left-3 bg-white text-black px-3 py-1 text-xs font-black uppercase tracking-wider">
                        NEW DROP
                    </div>
                )}
                {product.isSale && (
                    <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 text-xs font-black uppercase">
                        -{Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)}%
                    </div>
                )}

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-bold text-lg mb-1 drop-shadow-lg">{product.name}</h3>
                    <div className="flex items-center justify-between">
                        <span className="text-xl font-black">₵{product.price.toFixed(2)}</span>
                        <button className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform">
                            <Plus className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

/**
 * LUXURY VARIANT
 * Editorial, elegant, sophisticated
 */
function ProductCardLuxury({ product, index = 0 }: { product: Product; index?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08, duration: 0.6 }}
            className="group"
        >
            <Link href={`/products/${product.slug}`} className="block">
                <div className="relative aspect-[3/4] overflow-hidden bg-stone-100 mb-6">
                    <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover transition-all duration-700 group-hover:scale-105"
                    />

                    {/* Subtle Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />

                    {/* Elegant Badge */}
                    {product.isNew && (
                        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-800">
                            New Arrival
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <p className="text-[11px] uppercase tracking-[0.15em] text-zinc-400">
                        {product.category || "Collection"}
                    </p>
                    <h3 className="font-serif text-lg text-zinc-900 group-hover:text-zinc-600 transition-colors">
                        {product.name}
                    </h3>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-zinc-900">₵{product.price.toFixed(2)}</span>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <span className="text-sm text-zinc-400 line-through">₵{product.compareAtPrice.toFixed(2)}</span>
                        )}
                    </div>
                </div>
            </Link>

            {/* Elegant CTA */}
            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Link
                    href={`/products/${product.slug}`}
                    className="inline-flex items-center text-xs uppercase tracking-[0.15em] text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                    Discover
                    <ArrowRight className="ml-2 h-3 w-3" />
                </Link>
            </div>
        </motion.div>
    );
}

/**
 * Main ProductCard component that renders the appropriate variant
 */
export function ProductCardVariant({ product, variant = "premium", index = 0 }: ProductCardVariantProps) {
    switch (variant) {
        case "minimal":
            return <ProductCardMinimal product={product} index={index} />;
        case "classic":
            return <ProductCardClassic product={product} index={index} />;
        case "modern":
            return <ProductCardModern product={product} index={index} />;
        case "luxury":
            return <ProductCardLuxury product={product} index={index} />;
        case "premium":
        default:
            return <ProductCardPremium product={product} index={index} />;
    }
}

// Export individual variants for direct use
export {
    ProductCardPremium,
    ProductCardMinimal,
    ProductCardClassic,
    ProductCardModern,
    ProductCardLuxury
};
