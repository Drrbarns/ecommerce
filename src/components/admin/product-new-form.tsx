"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Check } from "lucide-react";
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
import { Brand } from "@/lib/actions/brand-actions";
import { bulkCreateVariants } from "@/lib/actions/variant-actions";
import { Separator } from "@/components/ui/separator";

interface ProductNewFormProps {
    categories: Category[];
    brands: Brand[];
}

export function ProductNewForm({ categories, brands }: ProductNewFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        price: "",
        cost: "",
        compareAtPrice: "",
        images: [] as string[],
        categoryId: "",
        brandId: "",
        sku: "",
        isNew: false,
        isSale: false,
        isFeatured: false,
        isActive: true,
        status: "published",
        inventoryCount: "0",
        lowStockThreshold: "5",
        seoTitle: "",
        seoDescription: "",
    });

    const [enableVariants, setEnableVariants] = useState(false);
    const [variantOptions, setVariantOptions] = useState({
        opt1Name: "Size",
        opt1Values: "S, M, L",
        opt2Name: "Color",
        opt2Values: "",
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

    const handleCheckboxChange = (id: string, checked: boolean) => {
        setFormData({ ...formData, [id]: checked });
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
            // Find category name for legacy support
            const selectedCategory = categories.find(c => c.id === formData.categoryId);

            const result = await createProduct({
                name: formData.name,
                slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                sku: formData.sku,
                description: formData.description,
                price: parseFloat(formData.price),
                cost: formData.cost ? parseFloat(formData.cost) : undefined,
                compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
                image: formData.images[0], // Cover photo
                images: formData.images,
                categoryId: formData.categoryId || undefined,
                category: selectedCategory?.name || "",
                brandId: formData.brandId || undefined,
                status: formData.status as any,
                isNew: formData.isNew,
                isSale: formData.isSale,
                isFeatured: formData.isFeatured,
                isActive: formData.isActive,
                inventoryCount: parseInt(formData.inventoryCount) || 0,
                lowStockThreshold: parseInt(formData.lowStockThreshold) || 5,
                seoTitle: formData.seoTitle,
                seoDescription: formData.seoDescription,
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            // Create variants if enabled
            if (enableVariants && result.productId) {
                const values1 = variantOptions.opt1Values.split(',').map(s => s.trim()).filter(Boolean);
                const values2 = variantOptions.opt2Values.split(',').map(s => s.trim()).filter(Boolean);

                if (values1.length > 0) {
                    await bulkCreateVariants(result.productId, {
                        option1Name: variantOptions.opt1Name,
                        option1Values: values1,
                        option2Name: values2.length > 0 ? variantOptions.opt2Name : undefined,
                        option2Values: values2.length > 0 ? values2 : undefined,
                        basePrice: parseFloat(formData.price),
                        baseSku: formData.sku || undefined
                    });
                }
            }

            toast.success("Product created successfully!");
            router.push(`/admin/products`);
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
                    {/* Main Content (Left Column) */}
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
                                    maxImages={10}
                                    currentImages={formData.images}
                                />
                            </CardContent>
                        </Card>

                        {/* Inventory & Logistics */}
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
                                    <div className="grid gap-2">
                                        <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                                        <Input
                                            id="lowStockThreshold"
                                            type="number"
                                            min="0"
                                            value={formData.lowStockThreshold}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Variants Configuration */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Product Variants</CardTitle>
                                <CardDescription>
                                    Manage size, color, and other variations.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="enableVariants"
                                        checked={enableVariants}
                                        onCheckedChange={(checked) => setEnableVariants(checked as boolean)}
                                    />
                                    <Label htmlFor="enableVariants" className="font-normal">
                                        This product has variants (Size, Color, etc.)
                                    </Label>
                                </div>

                                {enableVariants && (
                                    <div className="space-y-4 pt-2 animate-in slide-in-from-top-2 fade-in duration-200">
                                        <Separator />

                                        <div className="space-y-3">
                                            <Label className="text-xs font-semibold uppercase text-muted-foreground">Option 1</Label>
                                            <div className="grid gap-2">
                                                <Label htmlFor="opt1Name">Name</Label>
                                                <Input
                                                    id="opt1Name"
                                                    value={variantOptions.opt1Name}
                                                    onChange={(e) => setVariantOptions({ ...variantOptions, opt1Name: e.target.value })}
                                                    placeholder="e.g. Size"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="opt1Values">Values</Label>
                                                <Input
                                                    id="opt1Values"
                                                    value={variantOptions.opt1Values}
                                                    onChange={(e) => setVariantOptions({ ...variantOptions, opt1Values: e.target.value })}
                                                    placeholder="Separate with commas: S, M, L"
                                                />
                                                <p className="text-xs text-muted-foreground">Comma-separated values</p>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="space-y-3">
                                            <Label className="text-xs font-semibold uppercase text-muted-foreground">Option 2 (Optional)</Label>
                                            <div className="grid gap-2">
                                                <Label htmlFor="opt2Name">Name</Label>
                                                <Input
                                                    id="opt2Name"
                                                    value={variantOptions.opt2Name}
                                                    onChange={(e) => setVariantOptions({ ...variantOptions, opt2Name: e.target.value })}
                                                    placeholder="e.g. Color"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="opt2Values">Values</Label>
                                                <Input
                                                    id="opt2Values"
                                                    value={variantOptions.opt2Values}
                                                    onChange={(e) => setVariantOptions({ ...variantOptions, opt2Values: e.target.value })}
                                                    placeholder="e.g. Red, Blue"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* SEO Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Search Engine Optimization</CardTitle>
                                <CardDescription>
                                    Optimize your product for search engines.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="seoTitle">Page Title</Label>
                                    <Input
                                        id="seoTitle"
                                        placeholder={formData.name || "Product Title"}
                                        value={formData.seoTitle}
                                        onChange={handleChange}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Defaults to product name if left blank.
                                    </p>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="seoDescription">Meta Description</Label>
                                    <Textarea
                                        id="seoDescription"
                                        placeholder={formData.description?.slice(0, 160) || "Product description..."}
                                        value={formData.seoDescription}
                                        onChange={handleChange}
                                        rows={3}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Defaults to product description if left blank.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar (Right Column) */}
                    <div className="space-y-6">
                        {/* Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Product Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(val) => setFormData({ ...formData, status: val })}
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
                                    <Label htmlFor="isActive" className="font-normal">Active (Storefront)</Label>
                                </div>
                            </CardContent>
                        </Card>

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
                                    <Label htmlFor="compareAtPrice">Compare At Price (₵)</Label>
                                    <Input
                                        id="compareAtPrice"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.compareAtPrice}
                                        onChange={handleChange}
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
                                    <p className="text-xs text-muted-foreground">For profit calculation</p>
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
                                <div className="grid gap-2">
                                    <Label htmlFor="brandId">Brand</Label>
                                    <Select
                                        value={formData.brandId}
                                        onValueChange={(val) => setFormData({ ...formData, brandId: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a brand" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {brands && brands.map((b) => (
                                                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                            ))}
                                            {(!brands || brands.length === 0) && (
                                                <SelectItem value="none" disabled>No brands found</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
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
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="isFeatured"
                                        checked={formData.isFeatured}
                                        onCheckedChange={(checked) => handleCheckboxChange("isFeatured", checked as boolean)}
                                    />
                                    <Label htmlFor="isFeatured" className="font-normal">Featured Product</Label>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="sticky top-6">
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
                </div>
            </form>
        </div>
    );
}
