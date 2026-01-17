"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SingleImageUpload } from "@/components/admin/single-image-upload";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";
import { updateStoreSettings } from "@/lib/actions/settings-actions";

interface BrandingSettingsProps {
    settings: {
        name: string;
        tagline: string | null;
        description: string | null;
        logo: string | null;
        favicon: string | null;
        seo_title: string | null;
        seo_description: string | null;
        seo_image: string | null;
    };
}

export function BrandingSettings({ settings }: BrandingSettingsProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: settings.name || "Moolre",
        tagline: settings.tagline || "",
        description: settings.description || "",
        logo: settings.logo || "",
        favicon: settings.favicon || "",
        seoTitle: settings.seo_title || "",
        seoDescription: settings.seo_description || "",
        seoImage: settings.seo_image || "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await updateStoreSettings({
            name: formData.name,
            tagline: formData.tagline || undefined,
            description: formData.description || undefined,
            logo: formData.logo || null,
            favicon: formData.favicon || null,
            seoTitle: formData.seoTitle || undefined,
            seoDescription: formData.seoDescription || undefined,
            seoImage: formData.seoImage || null,
        });

        setIsLoading(false);

        if (result.success) {
            toast.success("Branding settings saved!");
            router.refresh();
        } else {
            toast.error(result.error || "Failed to save settings");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Store Identity */}
            <Card>
                <CardHeader>
                    <CardTitle>Store Identity</CardTitle>
                    <CardDescription>
                        Your store name and branding.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Store Name *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="My Awesome Store"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="tagline">Tagline</Label>
                        <Input
                            id="tagline"
                            value={formData.tagline}
                            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                            placeholder="Your catchy store tagline"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Briefly describe your store..."
                            rows={3}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Logo & Favicon */}
            <Card>
                <CardHeader>
                    <CardTitle>Logo & Favicon</CardTitle>
                    <CardDescription>
                        Upload your store logo and favicon.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Logo</Label>
                            <p className="text-xs text-muted-foreground">
                                Recommended: 200x60px, PNG or SVG
                            </p>
                            <SingleImageUpload
                                folder="branding"
                                currentImage={formData.logo}
                                onImageChange={(url) => setFormData({ ...formData, logo: url || "" })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Favicon</Label>
                            <p className="text-xs text-muted-foreground">
                                Recommended: 32x32px or 512x512px, PNG or ICO
                            </p>
                            <SingleImageUpload
                                folder="branding"
                                currentImage={formData.favicon}
                                onImageChange={(url) => setFormData({ ...formData, favicon: url || "" })}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* SEO Defaults */}
            <Card>
                <CardHeader>
                    <CardTitle>SEO Defaults</CardTitle>
                    <CardDescription>
                        Default meta tags for your store (used when pages don&apos;t have their own).
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="seoTitle">Meta Title</Label>
                        <Input
                            id="seoTitle"
                            value={formData.seoTitle}
                            onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                            placeholder="My Store | Best Products in Ghana"
                            maxLength={70}
                        />
                        <p className="text-xs text-muted-foreground">
                            {formData.seoTitle.length}/70 characters
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="seoDescription">Meta Description</Label>
                        <Textarea
                            id="seoDescription"
                            value={formData.seoDescription}
                            onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                            placeholder="Discover amazing products at great prices..."
                            rows={3}
                            maxLength={160}
                        />
                        <p className="text-xs text-muted-foreground">
                            {formData.seoDescription.length}/160 characters
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label>Default Social Share Image</Label>
                        <p className="text-xs text-muted-foreground">
                            Shown when sharing on social media (1200x630 recommended)
                        </p>
                        <SingleImageUpload
                            folder="branding"
                            currentImage={formData.seoImage}
                            onImageChange={(url) => setFormData({ ...formData, seoImage: url || "" })}
                        />
                    </div>
                </CardContent>
            </Card>

            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                    </>
                ) : (
                    <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Branding Settings
                    </>
                )}
            </Button>
        </form>
    );
}
