"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createCoupon } from "@/lib/actions/coupon-actions";
import { toMinorUnits } from "@/lib/money";

export default function NewCouponPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        code: "",
        description: "",
        discountType: "percentage",
        discountValue: "",
        minOrderValue: "",
        maxDiscountValue: "",
        usageLimit: "",
        usageLimitPerCustomer: "1",
        startsAt: new Date().toISOString().split('T')[0],
        expiresAt: "",
        isActive: true,
        freeShipping: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const handleSwitchChange = (id: string, checked: boolean) => {
        setFormData((prev) => ({ ...prev, [id]: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.code || !formData.discountValue || !formData.usageLimitPerCustomer) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsLoading(true);

        try {
            const result = await createCoupon({
                code: formData.code,
                description: formData.description,
                discountType: formData.discountType as "percentage" | "fixed",
                discountValue: Number(formData.discountValue), // For percentage: 10 = 10%
                minOrderMinor: toMinorUnits(Number(formData.minOrderValue || 0)),
                maxDiscountMinor: formData.maxDiscountValue ? toMinorUnits(Number(formData.maxDiscountValue)) : undefined,
                usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
                usageLimitPerCustomer: Number(formData.usageLimitPerCustomer),
                startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : undefined,
                expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
                isActive: formData.isActive,
                freeShipping: formData.freeShipping,
                appliesTo: 'all',
                firstOrderOnly: false,
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success("Coupon created successfully!");
            router.push("/admin/coupons");
        } catch (error: any) {
            toast.error(error.message || "Failed to create coupon");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/coupons">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Coupon</h1>
                    <p className="text-muted-foreground">
                        Add a new discount code for your customers.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Coupon Details</CardTitle>
                                <CardDescription>
                                    Basic information about the discount.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="code">Coupon Code *</Label>
                                    <Input
                                        id="code"
                                        placeholder="e.g. SAVE20"
                                        value={formData.code}
                                        onChange={handleChange}
                                        className="uppercase"
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Customers will enter this code at checkout.
                                    </p>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Internal description related to this promotion..."
                                        rows={2}
                                        value={formData.description}
                                        onChange={handleChange}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Discount Value</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-3">
                                    <Label>Discount Type</Label>
                                    <RadioGroup
                                        defaultValue="percentage"
                                        value={formData.discountType}
                                        onValueChange={(value) => setFormData({ ...formData, discountType: value })}
                                        className="flex flex-col space-y-1"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="percentage" id="percentage" />
                                            <Label htmlFor="percentage">Percentage (%)</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="fixed" id="fixed" />
                                            <Label htmlFor="fixed">Fixed Amount (₵)</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="discountValue">
                                        {formData.discountType === 'percentage' ? 'Percentage Percentage' : 'Discount Amount (₵)'} *
                                    </Label>
                                    <Input
                                        id="discountValue"
                                        type="number"
                                        min="0"
                                        step={formData.discountType === 'percentage' ? '1' : '0.01'}
                                        max={formData.discountType === 'percentage' ? '100' : undefined}
                                        placeholder="0"
                                        value={formData.discountValue}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                {formData.discountType === 'percentage' && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="maxDiscountValue">Max Discount Amount (₵)</Label>
                                        <Input
                                            id="maxDiscountValue"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="Optional limit"
                                            value={formData.maxDiscountValue}
                                            onChange={handleChange}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Maximum amount that can be deducted.
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-center space-x-2 pt-2">
                                    <Switch
                                        id="freeShipping"
                                        checked={formData.freeShipping}
                                        onCheckedChange={(checked) => handleSwitchChange('freeShipping', checked)}
                                    />
                                    <Label htmlFor="freeShipping">Allow Free Shipping</Label>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="isActive"
                                        checked={formData.isActive}
                                        onCheckedChange={(checked) => handleSwitchChange('isActive', checked)}
                                    />
                                    <Label htmlFor="isActive">Active</Label>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Restrictions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="minOrderValue">Min. Order Value (₵)</Label>
                                    <Input
                                        id="minOrderValue"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.minOrderValue}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="usageLimit">Total Usage Limit</Label>
                                    <Input
                                        id="usageLimit"
                                        type="number"
                                        min="1"
                                        placeholder="Optional (Unlimited)"
                                        value={formData.usageLimit}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="usageLimitPerCustomer">Limit Per Customer *</Label>
                                    <Input
                                        id="usageLimitPerCustomer"
                                        type="number"
                                        min="1"
                                        value={formData.usageLimitPerCustomer}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Schedule</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="startsAt">Start Date</Label>
                                    <Input
                                        id="startsAt"
                                        type="date"
                                        value={formData.startsAt}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="expiresAt">End Date</Label>
                                    <Input
                                        id="expiresAt"
                                        type="date"
                                        value={formData.expiresAt}
                                        onChange={handleChange}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Leave blank for no expiration.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Coupon"
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
