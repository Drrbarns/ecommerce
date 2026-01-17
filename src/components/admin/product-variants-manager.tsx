"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, RefreshCw, Trash2, Edit2, Layers } from "lucide-react";
import { toast } from "sonner";
import {
    getProductVariants,
    bulkCreateVariants,
    updateVariant,
    deleteVariant,
    adjustVariantInventory
} from "@/lib/actions/variant-actions";
import { fromMinorUnits } from "@/lib/money";

interface ProductVariantsManagerProps {
    productId: string;
    productPrice: number;
    productSku?: string;
}

export function ProductVariantsManager({ productId, productPrice, productSku }: ProductVariantsManagerProps) {
    const [variants, setVariants] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    const loadVariants = async () => {
        setIsLoading(true);
        const result = await getProductVariants(productId);
        setVariants(result.variants);
        setIsLoading(false);
    };

    useEffect(() => {
        loadVariants();
    }, [productId]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Product Variants</CardTitle>
                    <CardDescription>
                        Manage size, color, and other variations.
                    </CardDescription>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={loadVariants} disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    </Button>
                    <BulkCreateDialog
                        productId={productId}
                        basePrice={productPrice}
                        baseSku={productSku}
                        onSuccess={loadVariants}
                    />
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : variants.length > 0 ? (
                    <VariantsTable
                        variants={variants}
                        onRefresh={loadVariants}
                    />
                ) : (
                    <div className="text-center py-12 border rounded-lg bg-muted/20">
                        <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No Variants Created</h3>
                        <p className="text-muted-foreground mb-4">
                            This product currently has no variations.
                        </p>
                        <BulkCreateDialog
                            productId={productId}
                            basePrice={productPrice}
                            baseSku={productSku}
                            onSuccess={loadVariants}
                            trigger={<Button>Create First Variant</Button>}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function VariantsTable({ variants, onRefresh }: { variants: any[], onRefresh: () => void }) {
    const [editingId, setEditingId] = useState<string | null>(null);

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Variant</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {variants.map((variant) => (
                    <VariantRow
                        key={variant.id}
                        variant={variant}
                        onRefresh={onRefresh}
                    />
                ))}
            </TableBody>
        </Table>
    );
}

function VariantRow({ variant, onRefresh }: { variant: any, onRefresh: () => void }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Quick Edit State
    const [sku, setSku] = useState(variant.sku || "");
    const [price, setPrice] = useState(String(fromMinorUnits(variant.price_minor)));
    const [inventory, setInventory] = useState(variant.inventory_count.toString());

    const handleSave = async () => {
        setIsSaving(true);
        const result = await updateVariant(variant.id, {
            sku,
            price: parseFloat(String(price)),
            // inventoryCount is managed via adjustment, but for quick edit we might want direct override
            // However, using adjustment is safer for audit logs.
            // Let's keep inventory read-only here and use the adjustment dialog.
        });
        setIsSaving(false);

        if (result.success) {
            toast.success("Variant updated");
            setIsEditing(false);
            onRefresh();
        } else {
            toast.error("Failed to update");
        }
    };

    const handleDelete = async () => {
        if (!confirm("Delete this variant?")) return;
        const result = await deleteVariant(variant.id);
        if (result.success) {
            toast.success("Variant deleted");
            onRefresh();
        }
    };

    return (
        <TableRow>
            <TableCell className="font-medium">
                <div className="flex flex-col">
                    <span>{variant.name}</span>
                    <span className="text-xs text-muted-foreground">
                        {variant.option_1_name}: {variant.option_1_value}
                        {variant.option_2_name && `, ${variant.option_2_name}: ${variant.option_2_value}`}
                    </span>
                </div>
            </TableCell>
            <TableCell>
                {isEditing ? (
                    <Input
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        className="h-8 w-32"
                    />
                ) : (
                    <span className="font-mono text-sm">{variant.sku || "-"}</span>
                )}
            </TableCell>
            <TableCell>
                {isEditing ? (
                    <Input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="h-8 w-24"
                    />
                ) : (
                    <span>₵{fromMinorUnits(variant.price_minor)}</span>
                )}
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <span className={variant.inventory_count <= 5 ? "text-red-600 font-bold" : ""}>
                        {variant.inventory_count}
                    </span>
                    <InventoryAdjustDialog
                        variantId={variant.id}
                        currentStock={variant.inventory_count}
                        onSuccess={onRefresh}
                    />
                </div>
            </TableCell>
            <TableCell>
                {variant.is_active ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                ) : (
                    <Badge variant="secondary">Inactive</Badge>
                )}
            </TableCell>
            <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                    {isEditing ? (
                        <>
                            <Button size="sm" onClick={handleSave} disabled={isSaving}>Save</Button>
                            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                                <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={handleDelete}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                </div>
            </TableCell>
        </TableRow>
    );
}

function BulkCreateDialog({ productId, basePrice, baseSku, onSuccess, trigger }: any) {
    const [open, setOpen] = useState(false);
    const [opt1Name, setOpt1Name] = useState("Size");
    const [opt1Values, setOpt1Values] = useState("");
    const [opt2Name, setOpt2Name] = useState("Color");
    const [opt2Values, setOpt2Values] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!opt1Name || !opt1Values) {
            toast.error("Option 1 is required");
            return;
        }

        setIsSubmitting(true);
        const values1 = opt1Values.split(',').map(s => s.trim()).filter(Boolean);
        const values2 = opt2Values.split(',').map(s => s.trim()).filter(Boolean);

        const result = await bulkCreateVariants(productId, {
            option1Name: opt1Name,
            option1Values: values1,
            option2Name: values2.length > 0 ? opt2Name : undefined,
            option2Values: values2.length > 0 ? values2 : undefined,
            basePrice: basePrice,
            baseSku: baseSku || undefined
        });

        setIsSubmitting(false);

        if (result.success) {
            toast.success(`Created ${result.count} variants`);
            setOpen(false);
            onSuccess();
        } else {
            toast.error(result.error || "Failed to create variants");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Generate Variants
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Generate Variants</DialogTitle>
                    <DialogDescription>
                        Bulk create variants by combining options (e.g. Size x Color).
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-4">
                        <h4 className="font-medium text-sm">Option 1 (e.g. Size)</h4>
                        <div className="grid grid-cols-3 gap-2">
                            <Input placeholder="Name (Size)" value={opt1Name} onChange={e => setOpt1Name(e.target.value)} />
                            <Input className="col-span-2" placeholder="Values (S, M, L)" value={opt1Values} onChange={e => setOpt1Values(e.target.value)} />
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <h4 className="font-medium text-sm">Option 2 (Optional, e.g. Color)</h4>
                        <div className="grid grid-cols-3 gap-2">
                            <Input placeholder="Name (Color)" value={opt2Name} onChange={e => setOpt2Name(e.target.value)} />
                            <Input className="col-span-2" placeholder="Values (Red, Blue)" value={opt2Values} onChange={e => setOpt2Values(e.target.value)} />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Generating..." : "Generate Combinations"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function InventoryAdjustDialog({ variantId, currentStock, onSuccess }: any) {
    const [open, setOpen] = useState(false);
    const [type, setType] = useState<string>("restock");
    const [quantity, setQuantity] = useState("1");
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        const qty = parseInt(quantity);
        if (isNaN(qty) || qty <= 0) {
            toast.error("Invalid quantity");
            return;
        }

        // Determine if this adjustment adds or removes stock
        const isAddition = type === 'restock' || type === 'return';
        const adjustmentAmount = isAddition ? qty : -qty;

        setIsSubmitting(true);
        const result = await adjustVariantInventory(
            variantId,
            adjustmentAmount,
            reason || type,
            type as 'restock' | 'sale' | 'damage' | 'correction' | 'return'
        );
        setIsSubmitting(false);

        if (result.success) {
            toast.success("Inventory updated");
            setOpen(false);
            onSuccess();
        } else {
            toast.error(result.error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Layers className="h-3 w-3" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Adjust Inventory</DialogTitle>
                    <DialogDescription>Current Stock: {currentStock}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Adjustment Type</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="restock">Restock (+)</SelectItem>
                                <SelectItem value="return">Customer Return (+)</SelectItem>
                                <SelectItem value="damage">Damage/Loss (-)</SelectItem>
                                <SelectItem value="correction">Correction (-)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Reason (Optional)</Label>
                        <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Shipment received" />
                    </div>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
                        Update Stock
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
