"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2, Tag } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cart-store";
import { createOrder, type CreateOrderInput } from "@/lib/actions/checkout-actions";
import { validateCoupon } from "@/lib/actions/coupon-actions";
import { toMinorUnits, formatMoney } from "@/lib/money";

export function CheckoutForm() {
    const router = useRouter();
    const { items, getCartTotal, clearCart } = useCartStore();
    const [isLoading, setIsLoading] = useState(false);
    const [couponLoading, setCouponLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        name: "",
        address: "",
        city: "",
        region: "",
        phone: "",
        paymentMethod: "paystack",
        couponCode: "",
    });
    const [appliedCoupon, setAppliedCoupon] = useState<{
        code: string;
        discountMinor: number;
        freeShipping: boolean;
    } | null>(null);

    const subtotal = getCartTotal();
    const subtotalMinor = toMinorUnits(subtotal);
    const shippingMinor = appliedCoupon?.freeShipping || subtotalMinor >= 50000 ? 0 : 2500;
    const discountMinor = appliedCoupon?.discountMinor || 0;
    const totalMinor = subtotalMinor + shippingMinor - discountMinor;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleApplyCoupon = async () => {
        if (!formData.couponCode.trim()) return;

        setCouponLoading(true);
        try {
            const result = await validateCoupon(formData.couponCode, subtotalMinor, formData.email);

            if (result.valid) {
                setAppliedCoupon({
                    code: formData.couponCode.toUpperCase(),
                    discountMinor: result.discountMinor || 0,
                    freeShipping: result.freeShipping || false,
                });
                toast.success(`Coupon applied! You save ${formatMoney(result.discountMinor || 0)}`);
            } else {
                toast.error(result.error || "Invalid coupon");
            }
        } catch {
            toast.error("Failed to validate coupon");
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setFormData({ ...formData, couponCode: "" });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (items.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        // Basic validation
        if (!formData.email || !formData.name || !formData.address || !formData.city || !formData.phone) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsLoading(true);

        try {
            // Create order with server-side total calculation
            const orderInput: CreateOrderInput = {
                items: items.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image,
                    selectedSize: item.selectedSize,
                    selectedColor: item.selectedColor,
                })),
                shippingAddress: {
                    name: formData.name,
                    email: formData.email,
                    address: formData.address,
                    city: formData.city,
                    region: formData.region,
                    phone: formData.phone,
                    country: 'GH',
                },
                couponCode: appliedCoupon?.code,
            };

            const result = await createOrder(orderInput);

            if (!result.success || !result.orderId) {
                toast.error(result.error || "Failed to create order");
                setIsLoading(false);
                return;
            }

            // Initialize payment
            const paymentResponse = await fetch('/api/payments/initialize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: result.orderId,
                    amountMinor: result.totals?.totalMinor || totalMinor,
                    currency: 'GHS',
                    customerEmail: formData.email,
                    customerName: formData.name,
                    customerPhone: formData.phone,
                    provider: formData.paymentMethod,
                }),
            });

            const paymentData = await paymentResponse.json();

            if (!paymentData.success || !paymentData.redirectUrl) {
                // Payment initialization failed, but order was created
                // Redirect to pending order page
                toast.error(paymentData.error || "Payment initialization failed");
                router.push(`/order-confirmation?orderId=${result.orderId}&status=pending`);
                return;
            }

            // Clear cart and redirect to payment provider
            clearCart();
            window.location.href = paymentData.redirectUrl;
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error("An unexpected error occurred");
            setIsLoading(false);
        }
    };

    return (
        <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Contact */}
            <div>
                <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address *</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
            </div>

            <Separator />

            {/* Shipping */}
            <div>
                <h3 className="text-lg font-medium mb-4">Shipping Address</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2 sm:col-span-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                            id="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="grid gap-2 sm:col-span-2">
                        <Label htmlFor="address">Address *</Label>
                        <Input
                            id="address"
                            placeholder="123 Main St"
                            value={formData.address}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="city">City *</Label>
                        <Input
                            id="city"
                            placeholder="Accra"
                            value={formData.city}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="region">Region</Label>
                        <Input
                            id="region"
                            placeholder="Greater Accra"
                            value={formData.region}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="grid gap-2 sm:col-span-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="+233 20 000 0000"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
            </div>

            <Separator />

            {/* Coupon */}
            <div>
                <h3 className="text-lg font-medium mb-4">Discount Code</h3>
                {appliedCoupon ? (
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/5 border-primary/20">
                        <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-primary" />
                            <span className="font-medium">{appliedCoupon.code}</span>
                            <span className="text-sm text-muted-foreground">
                                (-{formatMoney(appliedCoupon.discountMinor)})
                            </span>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={handleRemoveCoupon}>
                            Remove
                        </Button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <Input
                            id="couponCode"
                            placeholder="Enter coupon code"
                            value={formData.couponCode}
                            onChange={handleChange}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleApplyCoupon}
                            disabled={couponLoading || !formData.couponCode.trim()}
                        >
                            {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                        </Button>
                    </div>
                )}
            </div>

            <Separator />

            {/* Payment */}
            <div>
                <h3 className="text-lg font-medium mb-4">Payment Method</h3>
                <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                    className="grid gap-4"
                >
                    <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-secondary/10 [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
                        <RadioGroupItem value="paystack" id="paystack" />
                        <Label htmlFor="paystack" className="flex-1 cursor-pointer font-medium">
                            Paystack
                        </Label>
                        <span className="text-xs text-muted-foreground">Cards, Mobile Money, Bank</span>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-secondary/10 [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
                        <RadioGroupItem value="flutterwave" id="flutterwave" />
                        <Label htmlFor="flutterwave" className="flex-1 cursor-pointer font-medium">
                            Flutterwave
                        </Label>
                        <span className="text-xs text-muted-foreground">Cards, Mobile Money</span>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-secondary/10 [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5 opacity-50">
                        <RadioGroupItem value="moolre" id="moolre" disabled />
                        <Label htmlFor="moolre" className="flex-1 cursor-pointer font-medium">
                            Moolre Pay
                        </Label>
                        <span className="text-xs text-muted-foreground">Coming Soon</span>
                    </div>
                </RadioGroup>
            </div>

            {/* Order Summary */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatMoney(subtotalMinor)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shippingMinor === 0 ? 'Free' : formatMoney(shippingMinor)}</span>
                </div>
                {discountMinor > 0 && (
                    <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-{formatMoney(discountMinor)}</span>
                    </div>
                )}
                <Separator />
                <div className="flex justify-between font-medium text-base">
                    <span>Total</span>
                    <span>{formatMoney(totalMinor)}</span>
                </div>
            </div>

            <Button
                type="submit"
                size="lg"
                className="w-full h-12 rounded-full text-base"
                disabled={isLoading || items.length === 0}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                    </>
                ) : (
                    `Pay ${formatMoney(totalMinor)}`
                )}
            </Button>
        </form>
    );
}
