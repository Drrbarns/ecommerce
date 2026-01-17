"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adjustProductStock } from "@/lib/actions/product-actions";
import { adjustVariantInventory } from "@/lib/actions/variant-actions";
import { toast } from "sonner";
import { Package } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StockAdjustmentFormProps {
    productId: string;
    variantId?: string;
    currentStock: number;
    productName: string;
}

export function StockAdjustmentForm({ productId, variantId, currentStock, productName }: StockAdjustmentFormProps) {
    const [quantity, setQuantity] = useState("");
    const [type, setType] = useState<"restock" | "sale" | "damage" | "correction" | "return">("restock");
    const [reason, setReason] = useState("");
    const [isAdjusting, setIsAdjusting] = useState(false);

    const handleAdjust = async () => {
        const adjustment = parseInt(quantity);
        if (isNaN(adjustment) || adjustment === 0) {
            toast.error("Please enter a valid quantity");
            return;
        }

        if (!reason.trim()) {
            toast.error("Please provide a reason");
            return;
        }

        setIsAdjusting(true);

        const result = variantId
            ? await adjustVariantInventory(variantId, adjustment, reason, type)
            : await adjustProductStock(productId, adjustment, reason, type);

        setIsAdjusting(false);

        if (result.success) {
            toast.success(`Stock adjusted to ${result.newInventory}`);
            setQuantity("");
            setReason("");
            window.location.reload();
        } else {
            toast.error(result.error || "Failed to adjust stock");
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Adjust Stock - {productName}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label>Current Stock</Label>
                    <p className="text-2xl font-bold">{currentStock}</p>
                </div>

                <div>
                    <Label>Adjustment Type</Label>
                    <Select value={type} onValueChange={(value: any) => setType(value)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="restock">Restock (Add)</SelectItem>
                            <SelectItem value="sale">Sale (Deduct)</SelectItem>
                            <SelectItem value="damage">Damage (Deduct)</SelectItem>
                            <SelectItem value="return">Return (Add)</SelectItem>
                            <SelectItem value="correction">Correction</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label>Quantity Change</Label>
                    <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="Enter positive or negative number"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        New stock will be: {currentStock + (parseInt(quantity) || 0)}
                    </p>
                </div>

                <div>
                    <Label>Reason</Label>
                    <Input
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Why are you adjusting the stock?"
                    />
                </div>

                <Button onClick={handleAdjust} disabled={isAdjusting} className="w-full">
                    {isAdjusting ? "Adjusting..." : "Adjust Stock"}
                </Button>
            </CardContent>
        </Card>
    );
}
