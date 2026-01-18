"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Save, Loader2, LayoutDashboard, Zap, Sparkles, Crown, Minus } from "lucide-react";
import { updateCMSContent, CMSContent } from "@/lib/actions/cms-actions";
import { cn } from "@/lib/utils";

interface HomepageEditorProps {
    section: CMSContent;
}

const layoutOptions = [
    {
        id: "premium",
        name: "Premium",
        description: "Stunning mobile-first design with hero slider, testimonials, and trust badges. Best for modern e-commerce.",
        icon: Crown,
        iconColor: "text-amber-500",
        recommended: true
    },
    {
        id: "minimal",
        name: "Minimal",
        description: "Ultra-clean, content-focused design with simple typography. Perfect for curated boutiques.",
        icon: Minus,
        iconColor: "text-zinc-500"
    },
    {
        id: "classic",
        name: "The Classic",
        description: "Standard, balanced e-commerce layout with clear sections. Perfect for general stores.",
        icon: LayoutDashboard,
        iconColor: "text-muted-foreground"
    },
    {
        id: "modern",
        name: "The Modern",
        description: "Bold, high-impact design with marquees and dynamic grids. Best for streetwear & lifestyle.",
        icon: Zap,
        iconColor: "text-yellow-500"
    },
    {
        id: "luxury",
        name: "The Atelier",
        description: "Minimal, editorial, whitespace-heavy. Focus on storytelling and curated essentials.",
        icon: Sparkles,
        iconColor: "text-purple-500"
    }
];

export function HomepageEditor({ section }: HomepageEditorProps) {
    const router = useRouter();
    const content = section.content as any;
    const [isLoading, setIsLoading] = useState(false);
    const [layout, setLayout] = useState<string>(content.layout || "premium");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await updateCMSContent(section.section_key, {
            ...content,
            layout: layout
        });

        setIsLoading(false);

        if (result.success) {
            toast.success("Homepage layout updated!");
            router.refresh();
        } else {
            toast.error(result.error || "Failed to update");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Homepage Design System</CardTitle>
                    <CardDescription>
                        Select the overall structure and feel of your homepage. Each layout has unique product card designs.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={layout}
                        onValueChange={setLayout}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
                    >
                        {layoutOptions.map((option) => {
                            const Icon = option.icon;
                            return (
                                <div key={option.id}>
                                    <RadioGroupItem value={option.id} id={option.id} className="peer sr-only" />
                                    <Label
                                        htmlFor={option.id}
                                        className={cn(
                                            "flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-full transition-all relative",
                                            layout === option.id && "border-primary bg-primary/5"
                                        )}
                                    >
                                        {option.recommended && (
                                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                                Recommended
                                            </span>
                                        )}
                                        <Icon className={cn("mb-3 h-8 w-8", option.iconColor)} />
                                        <div className="space-y-1 text-center">
                                            <h3 className="font-bold text-base">{option.name}</h3>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                {option.description}
                                            </p>
                                        </div>
                                    </Label>
                                </div>
                            );
                        })}
                    </RadioGroup>
                </CardContent>
            </Card>

            <Button type="submit" disabled={isLoading} size="lg">
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Swapping Design...
                    </>
                ) : (
                    <>
                        <Save className="mr-2 h-4 w-4" />
                        Apply Layout
                    </>
                )}
            </Button>
        </form>
    );
}
