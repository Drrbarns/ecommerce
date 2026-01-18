"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SingleImageUpload } from "@/components/admin/single-image-upload";
import { toast } from "sonner";
import { Save, Loader2, Eye } from "lucide-react";
import { updateCMSContent, CMSContent, HeroContent } from "@/lib/actions/cms-actions";

interface HeroEditorProps {
    section: CMSContent;
}

export function HeroEditor({ section }: HeroEditorProps) {
    const router = useRouter();
    const content = section.content as unknown as HeroContent;
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState<HeroContent>({
        variant: content.variant || "split",
        title: content.title || "",
        subtitle: content.subtitle || "",
        badge: content.badge || "",
        primaryButtonText: content.primaryButtonText || "Shop Now",
        primaryButtonLink: content.primaryButtonLink || "/shop",
        secondaryButtonText: content.secondaryButtonText || "",
        secondaryButtonLink: content.secondaryButtonLink || "",
        backgroundImage: content.backgroundImage || "",
        overlayOpacity: content.overlayOpacity ?? 0.5,
        backgroundColor: content.backgroundColor || "#0B1220",
        cardBackgroundColor: content.cardBackgroundColor || "#18181b",
        textColor: content.textColor || "#FFFFFF",
        subtitleColor: content.subtitleColor || "#a1a1aa",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await updateCMSContent(section.section_key, formData as unknown as Record<string, unknown>);

        setIsLoading(false);

        if (result.success) {
            toast.success("Hero section updated!");
            router.refresh();
        } else {
            toast.error(result.error || "Failed to update");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Left Column - Text Content */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Design Style</CardTitle>
                            <CardDescription>
                                Choose the layout for your hero section.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="variant">Layout Variant</Label>
                                <Select
                                    value={formData.variant || "split"}
                                    onValueChange={(v: any) => setFormData({ ...formData, variant: v })}
                                >
                                    <SelectTrigger id="variant">
                                        <SelectValue placeholder="Select a design variant" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="split">Split (Classic)</SelectItem>
                                        <SelectItem value="centered">Centered (Modern)</SelectItem>
                                        <SelectItem value="minimal">Minimal (Clean)</SelectItem>
                                        <SelectItem value="fullscreen">Fullscreen (Impact)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Hero Text</CardTitle>
                            <CardDescription>
                                Main headline and supporting text.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="badge">Badge Text (Optional)</Label>
                                <Input
                                    id="badge"
                                    value={formData.badge}
                                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                                    placeholder="e.g., New Collection, Sale, etc."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="title">Main Headline *</Label>
                                <Textarea
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Discover Premium Quality Products"
                                    rows={2}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subtitle">Subtitle / Description</Label>
                                <Textarea
                                    id="subtitle"
                                    value={formData.subtitle}
                                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                    placeholder="Shop the latest collection..."
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Call to Action Buttons</CardTitle>
                            <CardDescription>
                                Configure hero buttons.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="primaryButtonText">Primary Button Text</Label>
                                    <Input
                                        id="primaryButtonText"
                                        value={formData.primaryButtonText}
                                        onChange={(e) => setFormData({ ...formData, primaryButtonText: e.target.value })}
                                        placeholder="Shop Now"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="primaryButtonLink">Primary Button Link</Label>
                                    <Input
                                        id="primaryButtonLink"
                                        value={formData.primaryButtonLink}
                                        onChange={(e) => setFormData({ ...formData, primaryButtonLink: e.target.value })}
                                        placeholder="/shop"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="secondaryButtonText">Secondary Button Text</Label>
                                    <Input
                                        id="secondaryButtonText"
                                        value={formData.secondaryButtonText}
                                        onChange={(e) => setFormData({ ...formData, secondaryButtonText: e.target.value })}
                                        placeholder="Learn More (optional)"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="secondaryButtonLink">Secondary Button Link</Label>
                                    <Input
                                        id="secondaryButtonLink"
                                        value={formData.secondaryButtonLink}
                                        onChange={(e) => setFormData({ ...formData, secondaryButtonLink: e.target.value })}
                                        placeholder="/about"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Image & Preview */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Background Image</CardTitle>
                            <CardDescription>
                                Upload a hero background image (1920x1080 recommended).
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <SingleImageUpload
                                folder="cms/hero"
                                currentImage={formData.backgroundImage}
                                onImageChange={(url) => setFormData({ ...formData, backgroundImage: url || "" })}
                            />

                            <div className="space-y-2">
                                <Label>Overlay Darkness: {Math.round((formData.overlayOpacity || 0) * 100)}%</Label>
                                <Slider
                                    value={[formData.overlayOpacity || 0]}
                                    onValueChange={(v) => setFormData({ ...formData, overlayOpacity: v[0] })}
                                    min={0}
                                    max={1}
                                    step={0.05}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Controls how dark the overlay appears over the background image.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Background Colors */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Background Colors</CardTitle>
                            <CardDescription>
                                Customize the hero section colors.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="backgroundColor">Section Background</Label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        id="backgroundColor"
                                        value={formData.backgroundColor || "#0B1220"}
                                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                                        className="w-12 h-10 rounded border cursor-pointer"
                                    />
                                    <Input
                                        value={formData.backgroundColor || "#0B1220"}
                                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                                        placeholder="#0B1220"
                                        className="flex-1 font-mono"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    The outer background color of the hero section.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cardBackgroundColor">Card Background</Label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        id="cardBackgroundColor"
                                        value={formData.cardBackgroundColor || "#18181b"}
                                        onChange={(e) => setFormData({ ...formData, cardBackgroundColor: e.target.value })}
                                        className="w-12 h-10 rounded border cursor-pointer"
                                    />
                                    <Input
                                        value={formData.cardBackgroundColor || "#18181b"}
                                        onChange={(e) => setFormData({ ...formData, cardBackgroundColor: e.target.value })}
                                        placeholder="#18181b"
                                        className="flex-1 font-mono"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    The main hero container/card background color.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Text Colors */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Text Colors</CardTitle>
                            <CardDescription>
                                Customize the hero text colors.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="textColor">Headline Color</Label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        id="textColor"
                                        value={formData.textColor || "#FFFFFF"}
                                        onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                                        className="w-12 h-10 rounded border cursor-pointer"
                                    />
                                    <Input
                                        value={formData.textColor || "#FFFFFF"}
                                        onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                                        placeholder="#FFFFFF"
                                        className="flex-1 font-mono"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subtitleColor">Subtitle Color</Label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        id="subtitleColor"
                                        value={formData.subtitleColor || "#a1a1aa"}
                                        onChange={(e) => setFormData({ ...formData, subtitleColor: e.target.value })}
                                        className="w-12 h-10 rounded border cursor-pointer"
                                    />
                                    <Input
                                        value={formData.subtitleColor || "#a1a1aa"}
                                        onChange={(e) => setFormData({ ...formData, subtitleColor: e.target.value })}
                                        placeholder="#a1a1aa"
                                        className="flex-1 font-mono"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Live Preview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                Preview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div
                                className="relative rounded-lg overflow-hidden aspect-video"
                                style={{
                                    backgroundImage: formData.backgroundImage
                                        ? `url(${formData.backgroundImage})`
                                        : 'linear-gradient(135deg, #0F766E 0%, #065f46 100%)',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                }}
                            >
                                <div
                                    className="absolute inset-0 flex flex-col justify-center px-6"
                                    style={{
                                        backgroundColor: `rgba(0,0,0,${formData.overlayOpacity || 0})`,
                                    }}
                                >
                                    {formData.badge && (
                                        <span className="inline-block text-xs bg-white/20 text-white px-2 py-1 rounded mb-2 w-fit">
                                            {formData.badge}
                                        </span>
                                    )}
                                    <h2 className="text-white font-bold text-lg md:text-xl line-clamp-2">
                                        {formData.title || "Your Headline Here"}
                                    </h2>
                                    <p className="text-white/80 text-xs mt-1 line-clamp-2">
                                        {formData.subtitle || "Your subtitle here..."}
                                    </p>
                                    <div className="flex gap-2 mt-3">
                                        <span className="text-xs bg-white text-black px-3 py-1 rounded">
                                            {formData.primaryButtonText || "Button"}
                                        </span>
                                        {formData.secondaryButtonText && (
                                            <span className="text-xs border border-white text-white px-3 py-1 rounded">
                                                {formData.secondaryButtonText}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Button type="submit" disabled={isLoading} size="lg">
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                    </>
                ) : (
                    <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Hero Section
                    </>
                )}
            </Button>
        </form>
    );
}
