"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { Section } from "@/components/shared/section";
import { Heading } from "@/components/shared/heading";
import { Collection } from "@/types";

interface FeaturedCollectionsProps {
    collections: Collection[];
}

export function FeaturedCollections({ collections }: FeaturedCollectionsProps) {
    return (
        <Section grid>
            <Heading
                title="Curated Collections"
                description="Explore our thoughtfully designed categories for every aspect of your life."
                className="mb-12"
            />

            <div className="grid gap-3 grid-cols-2 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {collections.map((collection, index) => (
                    <motion.div
                        key={collection.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="group relative overflow-hidden rounded-2xl bg-zinc-900"
                    >
                        <Link href={`/collections/${collection.slug}`} className="block aspect-square w-full overflow-hidden">
                            <Image
                                src={collection.image}
                                alt={collection.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                            />
                            {/* Overlay - Gradient for clearer text */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                            {/* Content - Bottom Aligned */}
                            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                                <h3 className="font-heading text-xl font-bold tracking-tight transform group-hover:-translate-y-2 transition-transform duration-300">
                                    {collection.name}
                                </h3>
                                <div className="h-0 overflow-hidden group-hover:h-auto group-hover:mt-2 transition-all duration-300">
                                    <span className="inline-flex items-center text-sm font-medium text-primary-foreground">
                                        Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </Section>
    );
}
