"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MoveRight } from "lucide-react";
import { motion } from "framer-motion";

import { Section } from "@/components/shared/section";
import { Heading } from "@/components/shared/heading";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Collection } from "@/types";

interface FeaturedCollectionsProps {
    collections: Collection[];
    backgroundColor?: string;
    variant?: 'classic' | 'modern' | 'luxury';
}

export function FeaturedCollections({ collections, backgroundColor, variant = 'classic' }: FeaturedCollectionsProps) {
    if (collections.length === 0) return null;

    return (
        <Section grid className="py-24" style={{ backgroundColor: backgroundColor || undefined }}>
            <div className="flex items-end justify-between mb-12">
                <Heading
                    title={variant === 'luxury' ? "The Collections" : "Curated Collections"}
                    description={variant === 'luxury' ? undefined : "Explore our thoughtfully designed categories."}
                    className="mb-0"
                    align={variant === 'luxury' ? "center" : "left"}
                />
                {variant !== 'luxury' && (
                    <Button variant="ghost" className="hidden md:flex gap-2 group" asChild>
                        <Link href="/collections">
                            View All Collections
                            <MoveRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Button>
                )}
            </div>

            {/* CLASSIC LAYOUT */}
            {variant === 'classic' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {collections.map((collection, index) => (
                        <ClassicCard key={collection.id} collection={collection} index={index} />
                    ))}
                </div>
            )}

            {/* MODERN LAYOUT (Bento / Masonry feel) */}
            {variant === 'modern' && (
                <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-[800px] md:h-[600px]">
                    {collections.slice(0, 4).map((collection, index) => (
                        <ModernCard
                            key={collection.id}
                            collection={collection}
                            index={index}
                            className={cn(
                                index === 0 ? "md:col-span-2 md:row-span-2" : "md:col-span-1 md:row-span-1",
                                index === 3 ? "md:col-span-1 md:row-span-1" : ""
                            )}
                        />
                    ))}
                </div>
            )}

            {/* LUXURY LAYOUT (Minimal Horizontal Scroll) */}
            {variant === 'luxury' && (
                <div className="relative">
                    <div className="flex gap-8 overflow-x-auto pb-12 snap-x scrollbar-none">
                        {collections.map((collection, index) => (
                            <LuxuryCard key={collection.id} collection={collection} index={index} />
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-8 flex md:hidden justify-center">
                <Button variant="outline" className="w-full" asChild>
                    <Link href="/collections">
                        View All Collections
                    </Link>
                </Button>
            </div>
        </Section>
    );
}

function ClassicCard({ collection, index }: { collection: Collection; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="group relative overflow-hidden rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-border/5 aspect-[3/4]"
        >
            <Link href={`/collections/${collection.slug}`} className="block w-full h-full relative">
                <Image
                    src={collection.image}
                    alt={collection.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-70 transition-opacity duration-500" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                    <div className="transform transition-transform duration-300 translate-y-4 group-hover:translate-y-0">
                        <h3 className="font-heading text-2xl font-bold tracking-tight text-white mb-2">
                            {collection.name}
                        </h3>
                        <div className="h-0 overflow-hidden group-hover:h-auto opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <span className="inline-flex items-center text-sm font-semibold text-white/90 mt-2">
                                Shop Collection <ArrowRight className="ml-2 h-4 w-4" />
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

function ModernCard({ collection, index, className }: { collection: Collection; index: number, className?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className={cn("group relative overflow-hidden border-2 border-black bg-black", className)}
        >
            <Link href={`/collections/${collection.slug}`} className="block w-full h-full relative">
                <Image
                    src={collection.image}
                    alt={collection.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-60"
                />
                {/* Bold Overlays */}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    <span className="bg-black text-white px-4 py-2 font-bold text-xl uppercase tracking-widest border border-white transform -rotate-2 group-hover:rotate-0 transition-transform duration-300">
                        {collection.name}
                    </span>
                </div>
                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-white" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-white" />
            </Link>
        </motion.div>
    );
}

function LuxuryCard({ collection, index }: { collection: Collection; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="flex-none w-[300px] md:w-[400px] snap-center group"
        >
            <Link href={`/collections/${collection.slug}`} className="block">
                <div className="relative aspect-[3/4] overflow-hidden mb-6">
                    <Image
                        src={collection.image}
                        alt={collection.name}
                        fill
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    />
                </div>
                <div className="text-center group-hover:-translate-y-2 transition-transform duration-500">
                    <p className="text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase mb-2">Collection 0{index + 1}</p>
                    <h3 className="font-heading text-3xl text-zinc-900 group-hover:italic transition-all">
                        {collection.name}
                    </h3>
                </div>
            </Link>
        </motion.div>
    );
}
