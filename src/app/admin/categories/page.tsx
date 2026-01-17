import { getCategories } from "@/lib/actions/category-actions";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Plus, Edit } from "lucide-react";

export default async function CategoriesPage() {
    const { categories } = await getCategories();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
                    <p className="text-muted-foreground">Organize your products into categories</p>
                </div>
                <Button asChild>
                    <Link href="/admin/categories/new">
                        <Plus className="h-4 w-4 mr-2" />
                        New Category
                    </Link>
                </Button>
            </div>

            {/* Categories Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categories.length === 0 ? (
                    <Card className="col-span-full">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No categories yet</p>
                            <Button asChild className="mt-4">
                                <Link href="/admin/categories/new">Create First Category</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    categories.map((category: any) => (
                        <Card key={category.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="flex items-center gap-2">
                                            {category.icon_url && (
                                                <img src={category.icon_url} alt="" className="w-6 h-6" />
                                            )}
                                            {category.name}
                                        </CardTitle>
                                        {category.slug && (
                                            <p className="text-sm text-muted-foreground mt-1">/{category.slug}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-1">
                                        {category.featured && (
                                            <Badge variant="default">Featured</Badge>
                                        )}
                                        {!category.is_active && (
                                            <Badge variant="secondary">Inactive</Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {category.banner_image && (
                                    <img
                                        src={category.banner_image}
                                        alt={category.name}
                                        className="w-full h-32 object-cover rounded-lg mb-3"
                                    />
                                )}
                                {category.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                        {category.description}
                                    </p>
                                )}
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        {category.product_count || 0} products
                                    </p>
                                    <Button size="sm" variant="outline" asChild>
                                        <Link href={`/admin/categories/${category.id}`}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* SEO Summary */}
            {categories.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>SEO Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-2xl font-bold">
                                    {categories.filter((c: any) => c.seo_title).length}
                                </p>
                                <p className="text-sm text-muted-foreground">With SEO Title</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {categories.filter((c: any) => c.seo_description).length}
                                </p>
                                <p className="text-sm text-muted-foreground">With SEO Description</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {categories.filter((c: any) => c.featured).length}
                                </p>
                                <p className="text-sm text-muted-foreground">Featured</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {categories.filter((c: any) => c.is_active).length}
                                </p>
                                <p className="text-sm text-muted-foreground">Active</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
