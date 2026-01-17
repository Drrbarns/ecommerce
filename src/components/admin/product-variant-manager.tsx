"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { bulkCreateVariants, deleteVariant, updateVariant } from "@/lib/actions/variant-actions";
import { toast } from "sonner";
import { Plus, Trash2, Edit } from "lucide-react";

interface Variant {
    id: string;
    name: string;
    sku?: string;
    price_minor: number;
    inventory_count: number;
    is_active: boolean;
}

interface ProductVariantManagerProps {
    productId: string;
    variants: Variant[];
    basePrice: number;
}

export function ProductVariantManager({ productId, variants, basePrice }: ProductVariantManagerProps) {
    const [showBulkCreate, setShowBulkCreate] = useState(false);
    const [option1Name, setOption1Name] = useState("Size");
    const [option1Values, setOption1Values] = useState("S, M, L, XL");
    const [option2Name, setOption2Name] = useState("");
    const [option2Values, setOption2Values] = useState("");
    const [baseSku, setBaseSku] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const handleBulkCreate = async () => {
        const values1 = option1Values.split(",").map(v => v.trim()).filter(Boolean);
        const values2 = option2Values ? option2Values.split(",").map(v => v.trim()).filter(Boolean) : [];

        if (values1.length === 0) {
            toast.error("Please enter at least one value for option 1");
            return;
        }

        setIsCreating(true);
        const result = await bulkCreateVariants(productId, {
            option1Name,
            option1Values: values1,
            option2Name: option2Name || undefined,
            option2Values: values2.length > 0 ? values2 : undefined,
            basePrice: basePrice / 100, // Convert from minor units
            baseSku: baseSku || undefined,
        });

        setIsCreating(false);

        if (result.success) {
            toast.success(`Created ${result.count} variants`);
            setShowBulkCreate(false);
            window.location.reload(); // Reload to show new variants
        } else {
            toast.error(result.error || "Failed to create variants");
        }
    };

    const handleDeleteVariant = async (variantId: string) => {
        if (!confirm("Delete this variant?")) return;

        const result = await deleteVariant(variantId);
        if (result.success) {
            toast.success("Variant deleted");
            window.location.reload();
        } else {
            toast.error(result.error || "Failed to delete");
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Product Variants ({variants.length})</CardTitle>
                <Button size="sm" onClick={() => setShowBulkCreate(!showBulkCreate)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {showBulkCreate ? "Cancel" : "Bulk Create"}
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {showBulkCreate && (
                    <div className="p-4 border rounded-lg space-y-4 bg-muted/50">
                        <div className="grid gmd-cols-2 gap-4">
                            <div>
                                <Label>Option 1 Name (e.g., Size)</Label>
                                <Input value={option1Name} onChange={(e) => setOption1Name(e.target.value)} />
                            </div>
                            <div>
                                <Label>Option 1 Values (comma-separated)</Label>
                                <Input
                                    value={option1Values}
                                    onChange={(e) => setOption1Values(e.target.value)}
                                    placeholder="S, M, L, XL"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Option 2 Name (optional)</Label>
                                <Input
                                    value={option2Name}
                                    onChange={(e) => setOption2Name(e.target.value)}
                                    placeholder="Color"
                                />
                            </div>
                            <div>
                                <Label>Option 2 Values</Label>
                                <Input
                                    value={option2Values}
                                    onChange={(e) => setOption2Values(e.target.value)}
                                    placeholder="Red, Blue, Green"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Base SKU (optional)</Label>
                            <Input
                                value={baseSku}
                                onChange={(e) => setBaseSku(e.target.value)}
                                placeholder="PRODUCT"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                SKUs will be generated as: {baseSku || "PRODUCT"}-{option1Values.split(",")[0]?.trim()}
                            </p>
                        </div>

                        <Button onClick={handleBulkCreate} disabled={isCreating}>
                            {isCreating ? "Creating..." : "Create Variants"}
                        </Button>
                    </div>
                )}

                {variants.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                        No variants yet. Click "Bulk Create" to generate variants from options.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {variants.map((variant) => (
                            <div key={variant.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium">{variant.name}</p>
                                        {!variant.is_active && <Badge variant="secondary">Inactive</Badge>}
                                        {variant.inventory_count <= 0 && <Badge variant="destructive">Out of Stock</Badge>}
                                    </div>
                                    {variant.sku && <p className="text-sm text-muted-foreground">SKU: {variant.sku}</p>}
                                    <p className="text-sm">
                                        ₵{(variant.price_minor / 100).toFixed(2)} • Stock: {variant.inventory_count}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleDeleteVariant(variant.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
