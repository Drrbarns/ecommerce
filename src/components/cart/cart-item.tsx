"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

import { useCartStore, CartItem as CartItemType } from "@/store/cart-store";
import { Button } from "@/components/ui/button";

interface CartItemProps {
    item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
    const { updateQuantity, removeItem } = useCartStore();

    return (
        <motion.li
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex py-6"
        >
            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border bg-secondary/20 relative">
                <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover object-center"
                />
            </div>

            <div className="ml-4 flex flex-1 flex-col">
                <div>
                    <div className="flex justify-between text-base font-medium text-foreground">
                        <h3>{item.name}</h3>
                        <p className="ml-4">₵{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                        {item.selectedColor && <span className="mr-2">{item.selectedColor}</span>}
                        {item.selectedSize && <span className="mr-2 border-l pl-2">{item.selectedSize}</span>}
                    </div>
                </div>
                <div className="flex flex-1 items-end justify-between text-sm">
                    <div className="flex items-center gap-2 border rounded-full px-2 py-1">
                        <button
                            onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))}
                            className="p-1 hover:text-primary transition-colors"
                            disabled={item.quantity <= 1}
                        >
                            <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-4 text-center">{item.quantity}</span>
                        <button
                            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                            className="p-1 hover:text-primary transition-colors"
                        >
                            <Plus className="h-3 w-3" />
                        </button>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.cartItemId)}
                        className="text-muted-foreground hover:text-destructive p-0 h-auto font-medium"
                    >
                        Remove
                    </Button>
                </div>
            </div>
        </motion.li>
    );
}
