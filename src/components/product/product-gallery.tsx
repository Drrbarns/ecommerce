"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Product } from "@/types";

interface ProductGalleryProps {
    product: Product;
}

export function ProductGallery({ product }: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(0);

    // Mock multiple images if only one exists
    const images = [
        product.image,
        product.image, // Duplicate for demo
        product.image,
        product.image
    ];

    return (
        <div className="flex flex-col-reverse gap-4 md:flex-row">
            {/* Thumbnails */}
            <div className="flex gap-4 md:flex-col overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                {images.map((image, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={cn(
                            "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 bg-secondary",
                            selectedImage === index ? "border-primary" : "border-transparent"
                        )}
                    >
                        <Image
                            src={image}
                            alt={`Product image ${index + 1}`}
                            fill
                            className="object-cover"
                        />
                    </button>
                ))}
            </div>

            {/* Main Image */}
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-secondary">
                <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="h-full w-full"
                >
                    <Image
                        src={images[selectedImage]}
                        alt={product.name}
                        fill
                        className="object-cover"
                        priority
                    />
                </motion.div>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                    {product.isNew && (
                        <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
                            New
                        </span>
                    )}
                    {product.isSale && (
                        <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                            Sale
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
