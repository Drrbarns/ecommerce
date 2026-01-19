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
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "@/components/admin/image-upload";
import { createProduct } from "@/lib/actions/product-actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Category } from "@/lib/actions/category-actions";

interface ProductNewFormProps {
    categories: Category[];
}

export function ProductNewForm({ categories }: ProductNewFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        price: "",
        images: [] as string[],
        categoryId: "",
        sku: "",
        cost: "",
        isNew: false,
        isSale: false,
        isFeatured: false,
        inventoryCount: "0",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });

        // Auto-generate slug from name
        if (id === "name" && !formData.slug) {
            const slug = value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
            setFormData((prev) => ({ ...prev, slug }));
        }
    };

    const handleImagesChange = (images: string[]) => {
        setFormData({ ...formData, images });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.price) {
            toast.error("Please fill in required fields (Name & Price)");
            return;
        }

        if (formData.images.length === 0) {
            toast.error("Please upload at least one product image");
            return;
        }

        setIsLoading(true);

        try {
            // Find category name for legacy support or convenience
            const selectedCategory = categories.find(c => c.id === formData.categoryId);

            const result = await createProduct({
                name: formData.name,
                slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                sku: formData.sku,
                description: formData.description,
                price: parseFloat(formData.price),
                cost: formData.cost ? parseFloat(formData.cost) : undefined,
                image: formData.images[0], // Cover photo
                images: formData.images,
                categoryId: formData.categoryId || undefined,
                category: selectedCategory?.name || "",
                isNew: formData.isNew,
                isSale: formData.isSale,
                isFeatured: formData.isFeatured,
                inventoryCount: parseInt(formData.inventoryCount) || 0,
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success("Product created successfully! You can now add variants and additional details.");
            if (result.productId) {
                router.push(`/admin/products/${result.productId}`);
            } else {
                router.push(`/admin/products`);
            }
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to create product");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/products">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
                    <p className="text-muted-foreground">
                        Create a new product with images and details.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Product Information */}
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
                                        placeholder="e.g. Premium Leather Bag"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input
                                        id="slug"
                                        placeholder="premium-leather-bag"
                                        value={formData.slug}
                                        onChange={handleChange}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Auto-generated from name
                                    </p>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Describe the product..."
                                        rows={5}
                                        value={formData.description}
                                        onChange={handleChange}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Media Upload */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Product Images *</CardTitle>
                                <CardDescription>
                                    Upload product photos. The first image will be the cover photo.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ImageUpload
                                    onImagesChange={handleImagesChange}
                                    maxImages={5}
                                    currentImages={formData.images}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Pricing */}
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
                                        placeholder="0.00"
                                        value={formData.price}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="cost">Cost Price (₵)</Label>
                                    <Input
                                        id="cost"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.cost}
                                        onChange={handleChange}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Inventory */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Inventory</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="sku">SKU</Label>
                                    <Input
                                        id="sku"
                                        placeholder="e.g. BAG-001"
                                        value={formData.sku}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="inventoryCount">Stock Quantity</Label>
                                    <Input
                                        id="inventoryCount"
                                        type="number"
                                        min="0"
                                        value={formData.inventoryCount}
                                        onChange={handleChange}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Organization */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Organization</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        value={formData.categoryId}
                                        onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                            {categories.length === 0 && (
                                                <SelectItem value="none" disabled>No categories found</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="isNew"
                                        checked={formData.isNew}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, isNew: checked as boolean })
                                        }
                                    />
                                    <Label htmlFor="isNew" className="font-normal">Mark as New</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="isSale"
                                        checked={formData.isSale}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, isSale: checked as boolean })
                                        }
                                    />
                                    <Label htmlFor="isSale" className="font-normal">On Sale</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="isFeatured"
                                        checked={formData.isFeatured}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, isFeatured: checked as boolean })
                                        }
                                    />
                                    <Label htmlFor="isFeatured" className="font-normal">Featured Product</Label>
                                </div>
                            </CardContent>
                        </Card>

                        <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Product...
                                </>
                            ) : (
                                "Create Product"
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
