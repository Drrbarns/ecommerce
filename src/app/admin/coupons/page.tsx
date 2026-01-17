import Link from "next/link";
import { Plus, Percent, Tags } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCoupons } from "@/lib/actions/coupon-actions";
import { formatMoney } from "@/lib/money";

interface Coupon {
    id: string;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_order_minor: number;
    usage_count: number;
    usage_limit: number | null;
    expires_at: string | null;
    is_active: boolean;
}

export default async function AdminCouponsPage() {
    const { coupons, count } = await getCoupons() as { coupons: Coupon[]; count: number };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>
                    <p className="text-muted-foreground">
                        Manage discount codes and promotions.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/coupons/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Coupon
                    </Link>
                </Button>
            </div>

            {/* Coupons List */}
            <Card>
                <CardHeader>
                    <CardTitle>All Coupons ({count})</CardTitle>
                </CardHeader>
                <CardContent>
                    {coupons.length > 0 ? (
                        <div className="space-y-4">
                            {coupons.map((coupon) => {
                                const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
                                const isActive = coupon.is_active && !isExpired;

                                return (
                                    <div
                                        key={coupon.id}
                                        className="flex items-center justify-between p-4 border rounded-lg"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                {coupon.discount_type === 'percentage' ? (
                                                    <Percent className="h-5 w-5 text-primary" />
                                                ) : (
                                                    <Tags className="h-5 w-5 text-primary" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-mono font-bold text-lg">{coupon.code}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {coupon.discount_type === 'percentage'
                                                        ? `${coupon.discount_value}% off`
                                                        : `${formatMoney(coupon.discount_value)} off`}
                                                    {coupon.min_order_minor > 0 &&
                                                        ` • Min order ${formatMoney(coupon.min_order_minor)}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-sm">
                                                    Used: {coupon.usage_count}
                                                    {coupon.usage_limit && ` / ${coupon.usage_limit}`}
                                                </p>
                                                {coupon.expires_at && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Expires: {new Date(coupon.expires_at).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                            <Badge variant={isActive ? "default" : "secondary"}>
                                                {isExpired ? 'Expired' : isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">
                            No coupons yet. Create your first coupon to offer discounts.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
