"use client";

import { Section } from "@/components/shared/section";
import { Heading } from "@/components/shared/heading";
import { ProductCard } from "@/components/shared/product-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Product } from "@/types";

interface FeaturedProductsProps {
    products: Product[];
    backgroundColor?: string;
    variant?: 'classic' | 'modern' | 'luxury';
}

export function FeaturedProducts({ products, backgroundColor, variant = 'classic' }: FeaturedProductsProps) {

    return (
        <Section className="" style={{ backgroundColor: backgroundColor || undefined }} grid>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-4">
                <Heading
                    title={variant === 'modern' ? "FRESH DROPS" : variant === 'luxury' ? "The Essentials" : "Trending Essentials"}
                    description={variant === 'luxury' ? undefined : "Our most coveted pieces, loved by the community."}
                    className="mb-0 text-left"
                    centered={variant === 'luxury'}
                />

                {variant !== 'luxury' && (
                    <Button variant={variant === 'modern' ? "outline" : "ghost"} className={cn("group self-start md:self-end", variant === 'modern' && "border-2 border-black rounded-none hover:bg-black hover:text-white uppercase font-bold")} asChild>
                        <Link href="/shop">
                            {variant === 'modern' ? "View All" : "View All Products"} <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {products.map((product) => {
                    if (variant === 'modern') return <ModernProductCard key={product.id} product={product} />;
                    if (variant === 'luxury') return <LuxuryProductCard key={product.id} product={product} />;
                    return <ProductCard key={product.id} product={product} />;
                })}
            </div>

            {variant === 'luxury' && (
                <div className="mt-16 flex justify-center">
                    <Button variant="link" className="text-zinc-900" asChild>
                        <Link href="/shop">View Full Collection</Link>
                    </Button>
                </div>
            )}
        </Section>
    );
}

// MODERN CARD: Brutalist, Bold
function ModernProductCard({ product }: { product: Product }) {
    return (
        <div className="group relative border-2 border-black bg-white p-2 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
            {/* Badges */}
            {product.isNew && <span className="absolute top-4 left-4 z-10 bg-blue-600 text-white text-xs font-bold px-2 py-1 uppercase tracking-wider">New</span>}

            <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden mb-3 border border-black/10">
                <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
            </Link>

            <div className="space-y-2 px-1">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-sm uppercase leading-tight line-clamp-2">
                        <Link href={`/products/${product.slug}`}>{product.name}</Link>
                    </h3>
                    <span className="font-black text-lg">₵{product.price}</span>
                </div>
                <Button className="w-full rounded-none font-bold uppercase border-2 border-black bg-transparent text-black hover:bg-black hover:text-white transition-colors">
                    Add to Cart
                </Button>
            </div>
        </div>
    );
}

// LUXURY CARD: Minimal, Gallery-like
function LuxuryProductCard({ product }: { product: Product }) {
    return (
        <div className="group relative">
            <Link href={`/products/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden bg-zinc-100 mb-4">
                <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                />
                {/* Minimal Overlay Action */}
                <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex justify-center">
                    <span className="bg-white/90 backdrop-blur text-black text-xs uppercase tracking-widest py-2 px-6">
                        Quick View
                    </span>
                </div>
            </Link>

            <div className="text-center space-y-1">
                <h3 className="font-heading text-lg text-zinc-900 group-hover:text-zinc-600 transition-colors">
                    <Link href={`/products/${product.slug}`}>{product.name}</Link>
                </h3>
                <p className="text-zinc-500 font-serif italic">₵{product.price.toFixed(2)}</p>
            </div>
        </div>
    );
}
