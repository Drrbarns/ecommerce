"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Heading } from "@/components/shared/heading";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { CartItem } from "@/components/cart/cart-item";

export default function CartPage() {
    const { items, getCartTotal } = useCartStore();
    const total = getCartTotal();

    return (
        <section className="py-12">
            <Container>
                <Heading
                    title="Your Cart"
                    className="mb-8"
                />

                {items.length > 0 ? (
                    <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
                        <div className="lg:col-span-8">
                            <ul className="divide-y border-t border-b">
                                {items.map((item) => (
                                    <CartItem key={item.cartItemId} item={item} />
                                ))}
                            </ul>
                        </div>

                        <div className="rounded-lg bg-secondary/30 p-6 lg:sticky lg:top-24 lg:col-span-4">
                            <h2 className="text-lg font-medium">Order Summary</h2>

                            <dl className="mt-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <dt className="text-sm text-muted-foreground">Subtotal</dt>
                                    <dd className="text-sm font-medium">₵{total.toFixed(2)}</dd>
                                </div>
                                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                    <dt className="text-sm text-muted-foreground">Shipping estimate</dt>
                                    <dd className="text-sm font-medium">Calculated at checkout</dd>
                                </div>
                                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                    <dt className="text-base font-medium">Order total</dt>
                                    <dd className="text-base font-medium">₵{total.toFixed(2)}</dd>
                                </div>
                            </dl>

                            <div className="mt-6">
                                <Button className="w-full rounded-full h-12 text-base" asChild>
                                    <Link href="/checkout">
                                        Checkout <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button variant="link" className="mt-2 w-full" asChild>
                                    <Link href="/shop">
                                        Continue Shopping
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
                        <h2 className="text-xl font-medium">Your cart is empty</h2>
                        <p className="mt-2 text-muted-foreground">
                            Looks like you haven't added anything yet.
                        </p>
                        <Button asChild className="mt-8 rounded-full">
                            <Link href="/shop">Start Shopping</Link>
                        </Button>
                    </div>
                )}
            </Container>
        </section>
    );
}
