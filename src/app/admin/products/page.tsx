import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getProducts } from "@/lib/api";

export default async function AdminProductsPage() {
    const products = await getProducts();

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                    <p className="text-muted-foreground">
                        Manage your product catalog.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/products/new">
                        <Plus className="mr-2 h-4 w-4" /> Add Product
                    </Link>
                </Button>
            </div>

            {/* Products Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Products ({products.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b text-left text-sm text-muted-foreground">
                                    <th className="pb-3 font-medium">Product</th>
                                    <th className="pb-3 font-medium">Category</th>
                                    <th className="pb-3 font-medium">Price</th>
                                    <th className="pb-3 font-medium">Status</th>
                                    <th className="pb-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id} className="border-b last:border-0">
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-secondary">
                                                    <Image
                                                        src={product.image}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{product.name}</p>
                                                    <p className="text-sm text-muted-foreground">{product.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className="text-sm">{product.category}</span>
                                        </td>
                                        <td className="py-4">
                                            <span className="font-medium">₵{product.price.toFixed(2)}</span>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex gap-1">
                                                {product.isNew && <Badge variant="secondary">New</Badge>}
                                                {product.isSale && <Badge variant="destructive">Sale</Badge>}
                                                {!product.isNew && !product.isSale && <Badge variant="outline">Active</Badge>}
                                            </div>
                                        </td>
                                        <td className="py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/admin/products/${product.id}`}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
