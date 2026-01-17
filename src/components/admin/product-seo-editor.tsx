"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SingleImageUpload } from "@/components/admin/single-image-upload";
import { updateProductSEO } from "@/lib/actions/product-actions";
import { toast } from "sonner";
import { Save } from "lucide-react";

interface ProductSEOEditorProps {
    productId: string;
    initialData?: {
        seoTitle?: string;
        seoDescription?: string;
        ogImage?: string;
    };
}

export function ProductSEOEditor({ productId, initialData }: ProductSEOEditorProps) {
    const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || "");
    const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || "");
    const [ogImage, setOgImage] = useState(initialData?.ogImage || "");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        const result = await updateProductSEO(productId, {
            seoTitle: seoTitle || undefined,
            seoDescription: seoDescription || undefined,
            ogImage: ogImage || undefined,
        });

        setIsSaving(false);

        if (result.success) {
            toast.success("SEO updated");
        } else {
            toast.error(result.error || "Failed to update SEO");
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Search Engine Optimization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label>SEO Title</Label>
                    <Input
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        placeholder="Custom title for search engines"
                        maxLength={70}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        {seoTitle.length}/70 characters {seoTitle.length > 60 && "(⚠️ Recommended: 50-60)"}
                    </p>
                </div>

                <div>
                    <Label>SEO Description</Label>
                    <Textarea
                        value={seoDescription}
                        onChange={(e) => setSeoDescription(e.target.value)}
                        placeholder="Custom description for search engines"
                        maxLength={160}
                        rows={3}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        {seoDescription.length}/160 characters {seoDescription.length > 155 && "(⚠️ Recommended: 150-155)"}
                    </p>
                </div>

                <div>
                    <Label>Open Graph Image</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                        Image shown when sharing on social media (1200x630 recommended)
                    </p>
                    <SingleImageUpload
                        folder="seo"
                        currentImage={ogImage}
                        onImageChange={(url) => setOgImage(url || "")}
                    />
                </div>

                <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving..." : "Save SEO"}
                </Button>
            </CardContent>
        </Card>
    );
}
