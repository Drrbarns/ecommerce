"use client";

import Link from "next/link";
import { ShoppingBag, X, ArrowRight } from "lucide-react";
import { AnimatePresence } from "framer-motion";

import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CartItem } from "./cart-item";

export function CartDrawer() {
    const { isOpen, setOpen, items, getCartTotal } = useCartStore();

    return (
        <Sheet open={isOpen} onOpenChange={setOpen}>
            <SheetContent className="flex w-full flex-col pr-0 sm:max-w-md">
                <SheetHeader className="px-1 pr-6">
                    <SheetTitle className="flex items-center gap-2 text-xl font-heading">
                        <ShoppingBag className="h-5 w-5" /> Shopping Cart
                        <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs font-normal text-muted-foreground">
                            {items.length} items
                        </span>
                    </SheetTitle>
                </SheetHeader>

                <Separator className="my-4" />

                {items.length > 0 ? (
                    <>
                        <ScrollArea className="flex-1 pr-6">
                            <ul role="list" className="divide-y divide-border">
                                <AnimatePresence initial={false}>
                                    {items.map((item) => (
                                        <CartItem key={item.cartItemId} item={item} />
                                    ))}
                                </AnimatePresence>
                            </ul>
                        </ScrollArea>

                        <div className="space-y-4 pr-6 pt-6 pb-2">
                            <Separator />
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-base font-medium">
                                    <p>Subtotal</p>
                                    <p>₵{getCartTotal().toFixed(2)}</p>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Shipping and taxes calculated at checkout.
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <SheetClose asChild>
                                    <Button className="w-full h-12 rounded-full text-base" asChild>
                                        <Link href="/checkout">
                                            Checkout Live <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Button variant="outline" className="w-full rounded-full" asChild>
                                        <Link href="/cart">
                                            View Full Cart
                                        </Link>
                                    </Button>
                                </SheetClose>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex h-full flex-col items-center justify-center space-y-2 pr-6">
                        <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
                        <span className="text-lg font-medium text-muted-foreground">
                            Your cart is empty
                        </span>
                        <SheetClose asChild>
                            <Button variant="link" className="text-sm text-primary underline-offset-4">
                                Continue Shopping
                            </Button>
                        </SheetClose>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
