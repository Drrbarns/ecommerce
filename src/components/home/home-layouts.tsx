import { Hero } from "@/components/home/hero";
import { FeaturedCollections } from "@/components/home/featured-collections";
import { FeaturedProducts } from "@/components/home/featured-products";
import { Newsletter } from "@/components/home/newsletter";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionContent {
    backgroundColor?: string;
    backgroundImage?: string;
    textColor?: string;
}

interface HomeLayoutProps {
    data: {
        featuredProducts: any[];
        collections: any[];
        collectionContent: SectionContent | null;
        productContent: SectionContent | null;
        newsletterContent: SectionContent | null;
    };
}

/**
 * CLASSIC LAYOUT
 * The standard, balanced e-commerce layout.
 */
export function HomeClassic({ data }: HomeLayoutProps) {
    return (
        <>
            <Hero />
            <FeaturedCollections
                collections={data.collections}
                backgroundColor={data.collectionContent?.backgroundColor || "#FAFAFA"}
                variant="classic"
            />
            <FeaturedProducts
                products={data.featuredProducts}
                backgroundColor={data.productContent?.backgroundColor || "#F3F4F6"}
                variant="classic"
            />
            <Newsletter
                backgroundColor={data.newsletterContent?.backgroundColor || "#1B4D3E"}
                backgroundImage={data.newsletterContent?.backgroundImage}
                textColor={data.newsletterContent?.textColor}
            />
        </>
    );
}

/**
 * MODERN LAYOUT
 * Bold typography, high contrast, focused on products first.
 */
export function HomeModern({ data }: HomeLayoutProps) {
    return (
        <>
            <Hero />

            {/* Trending Marquee */}
            <div className="bg-black text-white overflow-hidden py-3 border-y-2 border-white">
                <div className="whitespace-nowrap animate-marquee flex gap-8 font-bold tracking-widest uppercase text-sm">
                    {Array(10).fill("NEW ARRIVALS • LIMITED EDITION • WORLDWIDE SHIPPING • PREMIUM QUALITY • ").map((text, i) => (
                        <span key={i}>{text}</span>
                    ))}
                </div>
            </div>

            {/* Products First */}
            <FeaturedProducts
                products={data.featuredProducts}
                backgroundColor={data.productContent?.backgroundColor || "#FFFFFF"}
                variant="modern"
            />

            {/* Newsletter Mid-page Break */}
            <Newsletter
                backgroundColor={data.newsletterContent?.backgroundColor || "#000000"}
                backgroundImage={data.newsletterContent?.backgroundImage}
                textColor={data.newsletterContent?.textColor || "#FFFFFF"}
            />

            {/* Collections Grid with Gap */}
            <div className="py-12 bg-white">
                <FeaturedCollections
                    collections={data.collections}
                    backgroundColor={data.collectionContent?.backgroundColor || "#F8F8F8"}
                    variant="modern"
                />
            </div>
        </>
    );
}

/**
 * LUXURY LAYOUT
 * Minimal, editorial, lots of whitespace.
 */
export function HomeLuxury({ data }: HomeLayoutProps) {
    return (
        <>
            <Hero />

            {/* Brand Statement / Manifesto */}
            <section className="bg-white py-24 px-6 md:px-12 text-center">
                <div className="max-w-3xl mx-auto space-y-6">
                    <p className="text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase">The Philosophy</p>
                    <h2 className="font-heading text-3xl md:text-5xl leading-tight text-zinc-900">
                        We believe in the power of <span className="italic font-serif">simplicity</span> and the elegance of function.
                    </h2>
                    <div className="w-12 h-1 bg-black mx-auto mt-8" />
                </div>
            </section>

            {/* Minimal Collections List */}
            <FeaturedCollections
                collections={data.collections}
                backgroundColor="#FFFFFF" // Force white for luxury
                variant="luxury"
            />

            {/* Curated Products */}
            <section className="py-24 bg-zinc-50">
                <FeaturedProducts
                    products={data.featuredProducts}
                    backgroundColor="transparent"
                    variant="luxury"
                />
            </section>

            {/* Slim Newsletter */}
            <Newsletter
                backgroundColor="#18181b"
                backgroundImage={undefined} // Minimal, no background image
                textColor="#FFFFFF"
            />
        </>
    );
}

// Map layouts
export const homeLayouts = {
    classic: HomeClassic,
    modern: HomeModern,
    luxury: HomeLuxury
};
