"use client";

import Image from "next/image";
import { useCartStore } from "@/store/cart-store";
import { Separator } from "@/components/ui/separator";

export function CheckoutSummary() {
    const { items, getCartTotal } = useCartStore();
    const subtotal = getCartTotal();
    const shipping = 25.00; // Flat rate for demo
    const total = subtotal + shipping;

    return (
        <div className="bg-secondary/20 p-6 rounded-xl border">
            <h2 className="text-lg font-medium mb-4">Order Summary</h2>
            <ul className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {items.map((item) => (
                    <li key={item.cartItemId} className="flex gap-4">
                        <div className="relative h-16 w-16 overflow-hidden rounded-md border bg-white">
                            <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                            />
                            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white z-10">
                                {item.quantity}
                            </span>
                        </div>
                        <div className="flex flex-1 justify-between">
                            <div>
                                <h3 className="text-sm font-medium">{item.name}</h3>
                                <p className="text-xs text-muted-foreground">
                                    {item.selectedColor} / {item.selectedSize}
                                </p>
                            </div>
                            <p className="text-sm font-medium">
                                ₵{(item.price * item.quantity).toFixed(2)}
                            </p>
                        </div>
                    </li>
                ))}
            </ul>

            <Separator className="my-6" />

            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₵{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>₵{shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold mt-4">
                    <span>Total</span>
                    <span className="text-primary">₵{total.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}
