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
}

export function FeaturedProducts({ products, backgroundColor }: FeaturedProductsProps) {

    return (
        <Section className="" style={{ backgroundColor: backgroundColor || undefined }} grid>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-4">
                <Heading
                    title="Trending Essentials"
                    description="Our most coveted pieces, loved by the community."
                    className="mb-0 text-left"
                />

                <Button variant="ghost" className="group self-start md:self-end" asChild>
                    <Link href="/shop">
                        View All Products <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </Section>
    );
}
