"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updateProductStatus } from "@/lib/actions/product-actions";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProductStatusToggleProps {
    productId: string;
    currentStatus: string;
    isActive: boolean;
}

export function ProductStatusToggle({ productId, currentStatus, isActive }: ProductStatusToggleProps) {
    const [status, setStatus] = useState(currentStatus);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusChange = async (newStatus: string) => {
        setIsUpdating(true);
        const result = await updateProductStatus(productId, newStatus as 'draft' | 'published' | 'archived');

        setIsUpdating(false);

        if (result.success) {
            setStatus(newStatus);
            toast.success(`Product ${newStatus}`);
            window.location.reload();
        } else {
            toast.error(result.error || "Failed to update status");
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Status Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label className="text-sm font-medium mb-2 block">Publication Status</label>
                    <Select value={status} onValueChange={handleStatusChange} disabled={isUpdating}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <span className="text-sm">Visibility</span>
                    <Badge variant={isActive ? "default" : "secondary"}>
                        {isActive ? "Active" : "Inactive"}
                    </Badge>
                </div>

                <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                    <p><strong>Draft:</strong> Not visible on storefront</p>
                    <p><strong>Published:</strong> Visible to customers</p>
                    <p><strong>Archived:</strong> Hidden but kept in system</p>
                </div>
            </CardContent>
        </Card>
    );
}
