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
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { updateProduct, deleteProduct } from "@/lib/actions/product-actions";
import { ImageUpload } from "@/components/admin/image-upload";
import { ProductVariantsManager } from "@/components/admin/product-variants-manager";
import { fromMinorUnits } from "@/lib/money";

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    price_minor: number;
    image: string | null;
    images: string[] | null;
    category: string | null;
    is_new: boolean;
    is_sale: boolean;
    is_active: boolean;
    inventory_count: number;
    // New fields
    sku: string | null;
    cost_minor: number | null;
    compare_at_price_minor: number | null;
    low_stock_threshold: number | null;
    status: 'draft' | 'published' | 'archived';
    seo_title: string | null;
    seo_description: string | null;
}

export function EditProductForm({ product }: { product: Product }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Initial state mapped from DB
    const [formData, setFormData] = useState({
        name: product.name,
        slug: product.slug,
        description: product.description || "",
        price: product.price.toString(),
        // Handle image: prioritize images array, fallback to single image
        images: product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []),
        category: product.category || "",
        isNew: product.is_new,
        isSale: product.is_sale,
        isActive: product.is_active,
        inventoryCount: product.inventory_count.toString(),

        // New fields
        sku: product.sku || "",
        cost: product.cost_minor ? fromMinorUnits(product.cost_minor) : "",
        compareAtPrice: product.compare_at_price_minor ? fromMinorUnits(product.compare_at_price_minor) : "",
        lowStockThreshold: product.low_stock_threshold?.toString() || "5",
        status: product.status || 'published',
        seoTitle: product.seo_title || "",
        seoDescription: product.seo_description || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const handleCheckboxChange = (id: string, checked: boolean) => {
        setFormData({ ...formData, [id]: checked });
    };

    const handleImagesChange = (newImages: string[]) => {
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await updateProduct(product.id, {
                name: formData.name,
                slug: formData.slug,
                description: formData.description,
                price: parseFloat(formData.price),
                image: formData.images[0] || undefined, // Cover image
                images: formData.images, // Full gallery
                category: formData.category,
                isNew: formData.isNew,
                isSale: formData.isSale,
                isActive: formData.isActive,
                inventoryCount: parseInt(formData.inventoryCount) || 0,

                // New fields
                sku: formData.sku,
                cost: formData.cost ? parseFloat(String(formData.cost)) : undefined,
                compareAtPrice: formData.compareAtPrice ? parseFloat(String(formData.compareAtPrice)) : undefined,
                lowStockThreshold: parseInt(String(formData.lowStockThreshold)) || 5,
                status: formData.status as any,
                seoTitle: formData.seoTitle,
                seoDescription: formData.seoDescription,
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success("Product updated successfully!");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to update product");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
            return;
        }

        setIsDeleting(true);
        try {
            const result = await deleteProduct(product.id);
            if (!result.success) throw new Error(result.error);

            toast.success("Product deleted");
            router.push("/admin/products");
        } catch (error: any) {
            toast.error(error.message);
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/products">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
                        <p className="text-muted-foreground">
                            Manage product details and inventory.
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <a href={`/products/${product.slug}`} target="_blank" rel="noreferrer">View Live</a>
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                        Delete Product
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Product Information</CardTitle>
                                <CardDescription>
                                    Basic details about the product.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Product Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input
                                        id="slug"
                                        value={formData.slug}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        rows={4}
                                        value={formData.description}
                                        onChange={handleChange}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Media</CardTitle>
                                <CardDescription>
                                    Product images (Cover image is first).
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ImageUpload
                                    onImagesChange={handleImagesChange}
                                    currentImages={formData.images}
                                    maxImages={10}
                                />
                            </CardContent>
                        </Card>

                        {/* Inventory & Logistics (Pricing moved below) */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Inventory & Logistics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="sku">SKU</Label>
                                        <Input
                                            id="sku"
                                            value={formData.sku}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="inventoryCount">Stock Count (Global)</Label>
                                        <Input
                                            id="inventoryCount"
                                            type="number"
                                            value={formData.inventoryCount}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                                        <Input
                                            id="lowStockThreshold"
                                            type="number"
                                            value={formData.lowStockThreshold}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Variants Manager */}
                        <ProductVariantsManager
                            productId={product.id}
                            productPrice={parseFloat(formData.price) || 0}
                            productSku={formData.sku}
                        />

                        {/* SEO */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Search Engine Optimization</CardTitle>
                                <CardDescription>
                                    Improve visibility on search engines.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="seoTitle">Meta Title</Label>
                                    <Input
                                        id="seoTitle"
                                        value={formData.seoTitle}
                                        onChange={handleChange}
                                        placeholder={formData.name}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="seoDescription">Meta Description</Label>
                                    <Textarea
                                        id="seoDescription"
                                        value={formData.seoDescription}
                                        onChange={handleChange}
                                        placeholder={formData.description.slice(0, 160)}
                                    />
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
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Product Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(val) => setFormData({ ...formData, status: val as any })}
                                    >
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
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="isActive"
                                        checked={formData.isActive}
                                        onCheckedChange={(checked) => handleCheckboxChange("isActive", checked as boolean)}
                                    />
                                    <Label htmlFor="isActive">Active (Storefront)</Label>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Pricing</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="price">Price (₵) *</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="compareAtPrice">Compare At Price (₵)</Label>
                                    <Input
                                        id="compareAtPrice"
                                        type="number"
                                        step="0.01"
                                        value={formData.compareAtPrice}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="cost">Cost per Item (₵)</Label>
                                    <Input
                                        id="cost"
                                        type="number"
                                        step="0.01"
                                        value={formData.cost}
                                        onChange={handleChange}
                                    />
                                    <p className="text-xs text-muted-foreground">For profit calculation</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Organization</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="category">Category *</Label>
                                    <Input
                                        id="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="isNew"
                                        checked={formData.isNew}
                                        onCheckedChange={(checked) => handleCheckboxChange("isNew", checked as boolean)}
                                    />
                                    <Label htmlFor="isNew" className="font-normal">Mark as New</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="isSale"
                                        checked={formData.isSale}
                                        onCheckedChange={(checked) => handleCheckboxChange("isSale", checked as boolean)}
                                    />
                                    <Label htmlFor="isSale" className="font-normal">On Sale</Label>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="sticky top-6">
                            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving Changes...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
