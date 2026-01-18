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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Save, Loader2, Eye, Plus, Trash2, GripVertical } from "lucide-react";
import { updateCMSContent, CMSContent, HeroContent, HeroSlideContent } from "@/lib/actions/cms-actions";
import { v4 as uuidv4 } from "uuid";

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
        slides: content.slides || [],
        autoPlay: content.autoPlay ?? true,
        autoPlayInterval: content.autoPlayInterval || 6000,
    });

    const isPremium = formData.variant === "premium";

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

    const addSlide = () => {
        const newSlide: HeroSlideContent = {
            id: uuidv4(),
            title: "New Slide Title",
            subtitle: "New slide description goes here.",
            badge: "New",
            buttonText: "Shop Now",
            buttonLink: "/shop",
            image: "",
            overlayOpacity: 0.4
        };
        setFormData({ ...formData, slides: [...(formData.slides || []), newSlide] });
    };

    const removeSlide = (id: string) => {
        setFormData({ ...formData, slides: (formData.slides || []).filter(s => s.id !== id) });
    };

    const updateSlide = (id: string, updates: Partial<HeroSlideContent>) => {
        setFormData({
            ...formData,
            slides: (formData.slides || []).map(s => s.id === id ? { ...s, ...updates } : s)
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Left Column - Configuration */}
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
                                        <SelectItem value="premium">Premium Slider (Carousel)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {isPremium ? (
                        <>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="space-y-1">
                                        <CardTitle>Slider Configuration</CardTitle>
                                        <CardDescription>Manage your slides and autoplay settings.</CardDescription>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={addSlide}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Slide
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="autoplay"
                                                checked={formData.autoPlay}
                                                onCheckedChange={(checked) => setFormData({ ...formData, autoPlay: checked })}
                                            />
                                            <Label htmlFor="autoplay">Auto Play</Label>
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <Label htmlFor="interval" className="text-xs">Interval (ms)</Label>
                                            <Input
                                                id="interval"
                                                type="number"
                                                value={formData.autoPlayInterval}
                                                onChange={(e) => setFormData({ ...formData, autoPlayInterval: parseInt(e.target.value) || 5000 })}
                                                step={500}
                                                min={2000}
                                            />
                                        </div>
                                    </div>

                                    <Accordion type="single" collapsible className="w-full">
                                        {(formData.slides || []).map((slide, index) => (
                                            <AccordionItem key={slide.id} value={slide.id}>
                                                <AccordionTrigger className="hover:no-underline">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-sm">Slide {index + 1}: {slide.title.substring(0, 20)}...</span>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="space-y-4 p-4 border rounded-md mt-2 bg-muted/20">
                                                    <SingleImageUpload
                                                        folder="cms/hero"
                                                        currentImage={slide.image}
                                                        onImageChange={(url) => updateSlide(slide.id, { image: url || "" })}
                                                    />

                                                    <div className="grid gap-2">
                                                        <Label>Badge (Optional)</Label>
                                                        <Input
                                                            value={slide.badge || ""}
                                                            onChange={(e) => updateSlide(slide.id, { badge: e.target.value })}
                                                            placeholder="e.g. New Arrival"
                                                        />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label>Title</Label>
                                                        <Textarea
                                                            value={slide.title}
                                                            onChange={(e) => updateSlide(slide.id, { title: e.target.value })}
                                                            placeholder="Main Headline"
                                                            rows={2}
                                                        />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label>Subtitle</Label>
                                                        <Textarea
                                                            value={slide.subtitle}
                                                            onChange={(e) => updateSlide(slide.id, { subtitle: e.target.value })}
                                                            placeholder="Supporting text..."
                                                            rows={3}
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label>Button Text</Label>
                                                            <Input
                                                                value={slide.buttonText}
                                                                onChange={(e) => updateSlide(slide.id, { buttonText: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Button Link</Label>
                                                            <Input
                                                                value={slide.buttonLink}
                                                                onChange={(e) => updateSlide(slide.id, { buttonLink: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label>Secondary Text</Label>
                                                            <Input
                                                                value={slide.secondaryButtonText || ""}
                                                                onChange={(e) => updateSlide(slide.id, { secondaryButtonText: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Secondary Link</Label>
                                                            <Input
                                                                value={slide.secondaryButtonLink || ""}
                                                                onChange={(e) => updateSlide(slide.id, { secondaryButtonLink: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2 pt-2 border-t">
                                                        <Label>Overlay Opacity: {Math.round((slide.overlayOpacity || 0) * 100)}%</Label>
                                                        <Slider
                                                            value={[slide.overlayOpacity || 0]}
                                                            onValueChange={(v) => updateSlide(slide.id, { overlayOpacity: v[0] })}
                                                            min={0}
                                                            max={1}
                                                            step={0.05}
                                                        />
                                                    </div>

                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        className="w-full mt-2"
                                                        onClick={() => removeSlide(slide.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Remove Slide
                                                    </Button>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        // Standard Single Hero Editor
                        <>
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
                        </>
                    )}
                </div>

                {/* Right Column - Image & Preview */}
                <div className="space-y-6">
                    {!isPremium && (
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
                    )}

                    {/* Colors - Only relevant if not full custom per slide, but we keep them for wrapper/global settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Global Colors</CardTitle>
                            <CardDescription>
                                Customize default colors (may be overridden by slide specific designs).
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
                            </div>
                        </CardContent>
                    </Card>

                    {/* Live Preview - Only for single mode for now, or simple placeholder for slider */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                Preview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div
                                className="relative rounded-lg overflow-hidden aspect-video bg-black"
                                style={{
                                    backgroundImage: !isPremium && formData.backgroundImage
                                        ? `url(${formData.backgroundImage})`
                                        : undefined,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                }}
                            >
                                {isPremium ? (
                                    <div className="absolute inset-0 flex items-center justify-center text-white/50">
                                        <p className="text-sm">Slider with {(formData.slides?.length || 0)} slides</p>
                                    </div>
                                ) : (
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
                                    </div>
                                )}
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
