"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { updateCoupon, deleteCoupon } from "@/lib/actions/coupon-actions";
import { toMinorUnits } from "@/lib/money";

interface Coupon {
    id: string;
    code: string;
    description: string | null;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_order_minor: number;
    max_discount_minor: number | null;
    usage_limit: number | null;
    usage_limit_per_customer: number;
    starts_at: string;
    expires_at: string | null;
    is_active: boolean;
    free_shipping: boolean;
}

export function EditCouponForm({ coupon }: { coupon: Coupon }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState({
        code: coupon.code,
        description: coupon.description || "",
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value.toString(),
        minOrderValue: (coupon.min_order_minor / 100).toString(),
        maxDiscountValue: coupon.max_discount_minor ? (coupon.max_discount_minor / 100).toString() : "",
        usageLimit: coupon.usage_limit ? coupon.usage_limit.toString() : "",
        usageLimitPerCustomer: coupon.usage_limit_per_customer.toString(),
        startsAt: coupon.starts_at ? new Date(coupon.starts_at).toISOString().split('T')[0] : "",
        expiresAt: coupon.expires_at ? new Date(coupon.expires_at).toISOString().split('T')[0] : "",
        isActive: coupon.is_active,
        freeShipping: coupon.free_shipping,
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
        setIsLoading(true);

        try {
            const result = await updateCoupon(coupon.id, {
                description: formData.description,
                discountType: formData.discountType,
                discountValue: Number(formData.discountValue),
                minOrderMinor: toMinorUnits(Number(formData.minOrderValue || 0)),
                maxDiscountMinor: formData.maxDiscountValue ? toMinorUnits(Number(formData.maxDiscountValue)) : undefined,
                usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
                usageLimitPerCustomer: Number(formData.usageLimitPerCustomer),
                startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : undefined,
                expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
                isActive: formData.isActive,
                freeShipping: formData.freeShipping,
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success("Coupon updated successfully!");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to update coupon");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this coupon?")) {
            return;
        }

        setIsDeleting(true);
        try {
            const result = await deleteCoupon(coupon.id);
            if (!result.success) throw new Error(result.error);

            toast.success("Coupon deleted");
            router.push("/admin/coupons");
        } catch (error: any) {
            toast.error(error.message);
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/coupons">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Coupon</h1>
                        <p className="text-muted-foreground">
                            Manage discount details for {coupon.code}.
                        </p>
                    </div>
                </div>
                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    Delete Coupon
                </Button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Coupon Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="code">Coupon Code</Label>
                                    <Input
                                        id="code"
                                        value={formData.code}
                                        disabled
                                        className="uppercase bg-muted"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
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
                                        value={formData.discountType}
                                        onValueChange={(value: "percentage" | "fixed") => setFormData({ ...formData, discountType: value })}
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
                                        {formData.discountType === 'percentage' ? 'Percentage' : 'Discount Amount (₵)'} *
                                    </Label>
                                    <Input
                                        id="discountValue"
                                        type="number"
                                        min="0"
                                        step={formData.discountType === 'percentage' ? '1' : '0.01'}
                                        max={formData.discountType === 'percentage' ? '100' : undefined}
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
                                            value={formData.maxDiscountValue}
                                            onChange={handleChange}
                                        />
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
                                        value={formData.usageLimit}
                                        onChange={handleChange}
                                        placeholder="Unlimited"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="usageLimitPerCustomer">Limit Per Customer</Label>
                                    <Input
                                        id="usageLimitPerCustomer"
                                        type="number"
                                        min="1"
                                        value={formData.usageLimitPerCustomer}
                                        onChange={handleChange}
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
                                </div>
                            </CardContent>
                        </Card>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
