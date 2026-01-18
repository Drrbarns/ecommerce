"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";
import { updateCMSContent, CMSContent } from "@/lib/actions/cms-actions";
import { SingleImageUpload } from "@/components/admin/single-image-upload";

interface SectionEditorProps {
    section: CMSContent;
    onSave?: () => void;
}

export function SectionEditor({ section, onSave }: SectionEditorProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<Record<string, unknown>>(section.content);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await updateCMSContent(section.section_key, formData);

        setIsLoading(false);

        if (result.success) {
            toast.success(`${section.section_name} updated!`);
            router.refresh();
            onSave?.();
        } else {
            toast.error(result.error || "Failed to update");
        }
    };

    const updateField = (key: string, value: unknown) => {
        setFormData({ ...formData, [key]: value });
    };

    // Render different inputs based on key/value type
    const renderField = (key: string, value: unknown) => {
        // Skip complex nested objects for now
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            return null;
        }

        const label = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
        const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);

        if (typeof value === 'boolean') {
            return (
                <div key={key} className="flex items-center justify-between py-2">
                    <Label htmlFor={key}>{capitalizedLabel}</Label>
                    <Switch
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) => updateField(key, checked)}
                    />
                </div>
            );
        }

        if (typeof value === 'number') {
            return (
                <div key={key} className="space-y-2">
                    <Label htmlFor={key}>{capitalizedLabel}</Label>
                    <Input
                        id={key}
                        type="number"
                        value={value}
                        onChange={(e) => updateField(key, parseFloat(e.target.value) || 0)}
                    />
                </div>
            );
        }

        if (typeof value === 'string') {
            // Variant selector
            if (key === 'variant') {
                return (
                    <div key={key} className="space-y-2 col-span-2">
                        <Label htmlFor={key}>{capitalizedLabel}</Label>
                        <Select value={(value as string) || "split"} onValueChange={(v) => updateField(key, v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a design variant" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="split">Split (Classic)</SelectItem>
                                <SelectItem value="centered">Centered (Modern)</SelectItem>
                                <SelectItem value="minimal">Minimal (Clean)</SelectItem>
                                <SelectItem value="fullscreen">Fullscreen (Impact)</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Choose the layout style for this section.
                        </p>
                    </div>
                );
            }

            // Long text = textarea
            if (value.length > 100 || key.includes('content') || key.includes('description')) {
                return (
                    <div key={key} className="space-y-2">
                        <Label htmlFor={key}>{capitalizedLabel}</Label>
                        <Textarea
                            id={key}
                            value={value}
                            onChange={(e) => updateField(key, e.target.value)}
                            rows={3}
                        />
                    </div>
                );
            }

            // Color picker for color fields
            if (key.includes('color') || key.includes('Color')) {
                return (
                    <div key={key} className="space-y-2">
                        <Label htmlFor={key}>{capitalizedLabel}</Label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={value || '#000000'}
                                onChange={(e) => updateField(key, e.target.value)}
                                className="w-12 h-10 rounded border cursor-pointer"
                            />
                            <Input
                                id={key}
                                value={value}
                                onChange={(e) => updateField(key, e.target.value)}
                                className="flex-1"
                            />
                        </div>
                    </div>
                );
            }

            // Image upload (replaces URL input)
            if (key.includes('image') || key.includes('Image')) {
                return (
                    <div key={key} className="space-y-2 col-span-2">
                        <SingleImageUpload
                            label={capitalizedLabel}
                            currentImage={value || ""}
                            folder="cms"
                            onImageChange={(url) => updateField(key, url || "")}
                        />
                        <p className="text-xs text-muted-foreground">
                            Leave empty to use the background color instead.
                        </p>
                    </div>
                );
            }

            // Regular input
            return (
                <div key={key} className="space-y-2">
                    <Label htmlFor={key}>{capitalizedLabel}</Label>
                    <Input
                        id={key}
                        value={value}
                        onChange={(e) => updateField(key, e.target.value)}
                    />
                </div>
            );
        }

        return null;
    };

    const fields = Object.entries(formData);
    const simpleFields = fields.filter(([_, v]) => typeof v !== 'object' || v === null);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                {simpleFields.map(([key, value]) => renderField(key, value))}
            </div>

            {/* Note about complex fields */}
            {fields.length !== simpleFields.length && (
                <p className="text-sm text-muted-foreground">
                    Note: Some complex fields (like arrays or nested objects) cannot be edited here directly.
                    Use the specialized editors for those.
                </p>
            )}

            <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                    </>
                ) : (
                    <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                    </>
                )}
            </Button>
        </form>
    );
}
