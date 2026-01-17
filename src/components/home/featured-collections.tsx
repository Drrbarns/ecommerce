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
}

export function FeaturedCollections({ collections }: FeaturedCollectionsProps) {
    return (
        <Section grid className="py-24 bg-zinc-50/50 dark:bg-zinc-950/50">
            <div className="flex items-end justify-between mb-12">
                <Heading
                    title="Curated Collections"
                    description="Explore our thoughtfully designed categories for every aspect of your life."
                    className="mb-0"
                />
                <Button variant="ghost" className="hidden md:flex gap-2 group" asChild>
                    <Link href="/collections">
                        View All Collections
                        <MoveRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {collections.map((collection, index) => (
                    <motion.div
                        key={collection.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="group relative overflow-hidden rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-border/5 aspect-[3/4]"
                    >
                        <Link href={`/collections/${collection.slug}`} className="block w-full h-full relative">
                            {/* Image Background */}
                            <Image
                                src={collection.image}
                                alt={collection.name}
                                fill
                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            />

                            {/* Premium Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-70 transition-opacity duration-500" />

                            {/* Content */}
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
                ))}
            </div>

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
