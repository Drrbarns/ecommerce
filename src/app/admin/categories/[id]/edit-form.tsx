"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { SingleImageUpload } from "@/components/admin/single-image-upload";
import { updateCategory } from "@/lib/actions/category-actions";

export function CategoryEditForm({ category }: { category: any }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        iconUrl: category.icon_url || "",
        bannerImage: category.banner_image || "",
        seoTitle: category.seo_title || "",
        seoDescription: category.seo_description || "",
        featured: category.featured || false,
        isActive: category.is_active,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const handleCheckboxChange = (id: string, checked: boolean) => {
        setFormData({ ...formData, [id]: checked });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await updateCategory(category.id, {
                name: formData.name,
                slug: formData.slug,
                description: formData.description,
                iconUrl: formData.iconUrl,
                bannerImage: formData.bannerImage,
                seoTitle: formData.seoTitle,
                seoDescription: formData.seoDescription,
                featured: formData.featured,
                isActive: formData.isActive,
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success("Category updated successfully!");
            router.push("/admin/categories");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to update category");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/categories">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Category</h1>
                    <p className="text-muted-foreground">Update category details and settings</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Category Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name *</Label>
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
                                    <p className="text-xs text-muted-foreground">
                                        URL: /shop/{formData.slug}
                                    </p>
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
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Icon Image</Label>
                                    <SingleImageUpload
                                        folder="categories"
                                        currentImage={formData.iconUrl}
                                        onImageChange={(url) => setFormData({ ...formData, iconUrl: url || "" })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Banner Image</Label>
                                    <SingleImageUpload
                                        folder="categories"
                                        currentImage={formData.bannerImage}
                                        onImageChange={(url) => setFormData({ ...formData, bannerImage: url || "" })}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>SEO</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="seoTitle">SEO Title</Label>
                                    <Input
                                        id="seoTitle"
                                        value={formData.seoTitle}
                                        onChange={handleChange}
                                        maxLength={70}
                                        placeholder="Custom title for search engines"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {formData.seoTitle.length}/70 characters
                                    </p>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="seoDescription">SEO Description</Label>
                                    <Textarea
                                        id="seoDescription"
                                        rows={3}
                                        value={formData.seoDescription}
                                        onChange={handleChange}
                                        maxLength={160}
                                        placeholder="Custom description for search engines"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {formData.seoDescription.length}/160 characters
                                    </p>
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
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="isActive"
                                        checked={formData.isActive}
                                        onCheckedChange={(checked) =>
                                            handleCheckboxChange("isActive", checked as boolean)
                                        }
                                    />
                                    <Label htmlFor="isActive">Active</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="featured"
                                        checked={formData.featured}
                                        onCheckedChange={(checked) =>
                                            handleCheckboxChange("featured", checked as boolean)
                                        }
                                    />
                                    <Label htmlFor="featured">Featured</Label>
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
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
