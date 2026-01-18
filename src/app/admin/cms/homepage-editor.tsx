"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Save, Loader2, LayoutDashboard, Zap, Sparkles } from "lucide-react";
import { updateCMSContent, CMSContent } from "@/lib/actions/cms-actions";
import { cn } from "@/lib/utils";

interface HomepageEditorProps {
    section: CMSContent;
}

export function HomepageEditor({ section }: HomepageEditorProps) {
    const router = useRouter();
    const content = section.content as any;
    const [isLoading, setIsLoading] = useState(false);
    const [layout, setLayout] = useState<string>(content.layout || "classic");

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
                        Select the overall structure and feel of your homepage.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={layout}
                        onValueChange={setLayout}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {/* Classic Option */}
                        <div>
                            <RadioGroupItem value="classic" id="classic" className="peer sr-only" />
                            <Label
                                htmlFor="classic"
                                className={cn(
                                    "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-full transition-all",
                                    layout === "classic" && "border-primary bg-primary/5"
                                )}
                            >
                                <LayoutDashboard className="mb-3 h-10 w-10 text-muted-foreground group-hover:text-primary" />
                                <div className="space-y-1 text-center">
                                    <h3 className="font-bold text-lg">The Classic</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Standard, balanced e-commerce layout with clear sections. Perfect for general stores.
                                    </p>
                                </div>
                            </Label>
                        </div>

                        {/* Modern Option */}
                        <div>
                            <RadioGroupItem value="modern" id="modern" className="peer sr-only" />
                            <Label
                                htmlFor="modern"
                                className={cn(
                                    "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-full transition-all",
                                    layout === "modern" && "border-primary bg-primary/5"
                                )}
                            >
                                <Zap className="mb-3 h-10 w-10 text-yellow-500" />
                                <div className="space-y-1 text-center">
                                    <h3 className="font-bold text-lg">The Modern</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Bold, high-impact design with marquees and dynamic grids. Best for streetwear & lifestyle.
                                    </p>
                                </div>
                            </Label>
                        </div>

                        {/* Luxury Option */}
                        <div>
                            <RadioGroupItem value="luxury" id="luxury" className="peer sr-only" />
                            <Label
                                htmlFor="luxury"
                                className={cn(
                                    "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-full transition-all",
                                    layout === "luxury" && "border-primary bg-primary/5"
                                )}
                            >
                                <Sparkles className="mb-3 h-10 w-10 text-purple-500" />
                                <div className="space-y-1 text-center">
                                    <h3 className="font-bold text-lg">The Atelier</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Minimal, editorial, whitespace-heavy. Focus on storytelling and curated essentials.
                                    </p>
                                </div>
                            </Label>
                        </div>
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
