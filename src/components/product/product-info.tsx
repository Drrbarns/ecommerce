"use client";

import { useState } from "react";
import { Star, Truck, ShieldCheck, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button"; import { Product } from "@/types";
import { Separator } from "@/components/ui/separator";

interface ProductInfoProps {
    product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
    const [selectedSize, setSelectedSize] = useState("M");
    const [selectedColor, setSelectedColor] = useState("Black");
    const { addItem, setOpen } = useCartStore();

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="font-heading text-3xl font-bold md:text-4xl">
                    {product.name}
                </h1>
                <div className="mt-2 flex items-center gap-4">
                    <p className="text-2xl font-semibold text-primary">
                        ₵{product.price.toFixed(2)}
                    </p>
                    {product.compareAtPrice && (
                        <p className="text-xl text-muted-foreground line-through">
                            ₵{product.compareAtPrice.toFixed(2)}
                        </p>
                    )}
                </div>

                <div className="mt-4 flex items-center gap-2">
                    <div className="flex text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`h-4 w-4 ${i < Math.floor(product.rating || 0) ? "fill-current" : "text-gray-300"}`}
                            />
                        ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                        ({product.reviewCount} reviews)
                    </span>
                </div>
            </div>

            <Separator />

            {/* Description */}
            <div className="text-base text-muted-foreground">
                <p>
                    Experience premium quality with the {product.name}. Designed for the modern lifestyle,
                    combining durability with elegant aesthetics. Perfect for everyday use.
                </p>
            </div>

            {/* Variants */}
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium">Color</label>
                    <div className="mt-2 flex gap-3">
                        {["Black", "Navy", "Olive"].map((color) => (
                            <button
                                key={color}
                                onClick={() => setSelectedColor(color)}
                                className={`h-8 w-8 rounded-full border-2 focus:outline-none ${selectedColor === color ? "border-primary ring-2 ring-primary ring-offset-2" : "border-transparent ring-1 ring-gray-200"
                                    }`}
                                style={{ backgroundColor: color.toLowerCase() === 'navy' ? '#000080' : color.toLowerCase() === 'olive' ? '#808000' : 'black' }}
                                title={color}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium">Size</label>
                    <div className="mt-2 flex gap-3">
                        {["S", "M", "L", "XL"].map((size) => (
                            <button
                                key={size}
                                onClick={() => setSelectedSize(size)}
                                className={`flex h-10 w-10 items-center justify-center rounded-md border text-sm font-medium transition-colors hover:bg-muted ${selectedSize === size
                                    ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                                    : "border-input bg-background"
                                    }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row mt-6">
                <Button
                    size="lg"
                    variant="outline"
                    className="h-12 w-full flex-1 rounded-full text-base border-2 hover:bg-secondary/50 transition-colors font-medium"
                    onClick={() => {
                        addItem(product, 1, selectedSize, selectedColor);
                        toast.success("Added to cart");
                    }}
                >
                    Add to Cart
                </Button>
                <Button
                    size="lg"
                    className="h-12 w-full flex-1 rounded-full text-base font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all bg-black text-white hover:bg-black/90"
                    onClick={() => {
                        addItem(product, 1, selectedSize, selectedColor);
                        setOpen(true);
                    }}
                >
                    Buy Now
                </Button>
            </div>

            {/* Trust Badges */}
            <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-secondary/30 p-4">
                <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-primary" />
                    <div>
                        <p className="text-sm font-medium">Free Shipping</p>
                        <p className="text-xs text-muted-foreground">On orders over ₵500</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <div>
                        <p className="text-sm font-medium">Secure Checkout</p>
                        <p className="text-xs text-muted-foreground">Encrypted payments</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
