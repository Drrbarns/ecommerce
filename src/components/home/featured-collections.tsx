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
        <Section grid className="py-24">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:auto-rows-[280px] lg:auto-rows-[320px]">
                {collections.map((collection, index) => (
                    <motion.div
                        key={collection.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className={cn(
                            "group relative overflow-hidden rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-border/5",
                            index === 0 ? "md:col-span-2 md:row-span-2 aspect-[4/3] md:aspect-auto" : "md:col-span-1 md:row-span-1 aspect-square md:aspect-auto"
                        )}
                    >
                        <Link href={`/collections/${collection.slug}`} className="block w-full h-full relative">
                            {/* Image Background */}
                            <Image
                                src={collection.image}
                                alt={collection.name}
                                fill
                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                sizes={index === 0 ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
                            />

                            {/* Premium Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-500" />

                            {/* Content */}
                            <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end text-white">
                                <div className="transform transition-transform duration-300 translate-y-2 group-hover:translate-y-0">
                                    <p className="text-sm font-medium text-white/80 mb-2 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-100">
                                        Collection
                                    </p>
                                    <h3 className={cn(
                                        "font-heading font-bold tracking-tight text-white mb-2",
                                        index === 0 ? "text-3xl md:text-5xl" : "text-2xl md:text-3xl"
                                    )}>
                                        {collection.name}
                                    </h3>

                                    <div className="h-0 overflow-hidden group-hover:h-auto group-hover:mt-4 transition-all duration-300 origin-bottom">
                                        <span className="inline-flex items-center text-sm font-semibold text-white/90">
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
