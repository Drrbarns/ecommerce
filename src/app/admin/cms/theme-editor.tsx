"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Save, Loader2, RotateCcw, Palette } from "lucide-react";
import { updateTheme, resetThemeToDefaults, CMSTheme } from "@/lib/actions/cms-actions";

interface ThemeEditorProps {
    theme: CMSTheme;
}

interface ColorInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    description?: string;
}

function ColorInput({ label, value, onChange, description }: ColorInputProps) {
    return (
        <div className="space-y-2">
            <Label className="flex items-center gap-2">
                <div
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: value }}
                />
                {label}
            </Label>
            <div className="flex gap-2">
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-12 h-10 rounded border cursor-pointer"
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md text-sm font-mono"
                    placeholder="#000000"
                />
            </div>
            {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
            )}
        </div>
    );
}

export function ThemeEditor({ theme }: ThemeEditorProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const [colors, setColors] = useState({
        primary_color: theme.primary_color,
        primary_foreground: theme.primary_foreground,
        secondary_color: theme.secondary_color,
        secondary_foreground: theme.secondary_foreground,
        accent_color: theme.accent_color,
        accent_foreground: theme.accent_foreground,
        background_color: theme.background_color,
        foreground_color: theme.foreground_color,
        card_color: theme.card_color,
        card_foreground: theme.card_foreground,
        muted_color: theme.muted_color,
        muted_foreground: theme.muted_foreground,
        border_color: theme.border_color,
        ring_color: theme.ring_color,
        destructive_color: theme.destructive_color,
        destructive_foreground: theme.destructive_foreground,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await updateTheme(theme.id, colors);

        setIsLoading(false);

        if (result.success) {
            toast.success("Theme colors updated!");
            router.refresh();
        } else {
            toast.error(result.error || "Failed to update theme");
        }
    };

    const handleReset = async () => {
        if (!confirm("Are you sure you want to reset to default colors?")) return;

        setIsResetting(true);
        const result = await resetThemeToDefaults(theme.id);
        setIsResetting(false);

        if (result.success) {
            toast.success("Theme reset to defaults!");
            router.refresh();
        } else {
            toast.error(result.error || "Failed to reset theme");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" />
                    <span className="text-sm text-muted-foreground">
                        Customize your store&apos;s color scheme
                    </span>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={isResetting}
                >
                    {isResetting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                        <RotateCcw className="h-4 w-4 mr-2" />
                    )}
                    Reset to Defaults
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Primary Colors */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Primary Colors</CardTitle>
                        <CardDescription>
                            Main brand color for buttons, links, and accents.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ColorInput
                            label="Primary"
                            value={colors.primary_color}
                            onChange={(v) => setColors({ ...colors, primary_color: v })}
                            description="Main brand color"
                        />
                        <ColorInput
                            label="Primary Foreground"
                            value={colors.primary_foreground}
                            onChange={(v) => setColors({ ...colors, primary_foreground: v })}
                            description="Text on primary backgrounds"
                        />
                    </CardContent>
                </Card>

                {/* Secondary Colors */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Secondary Colors</CardTitle>
                        <CardDescription>
                            Secondary UI elements and backgrounds.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ColorInput
                            label="Secondary"
                            value={colors.secondary_color}
                            onChange={(v) => setColors({ ...colors, secondary_color: v })}
                        />
                        <ColorInput
                            label="Secondary Foreground"
                            value={colors.secondary_foreground}
                            onChange={(v) => setColors({ ...colors, secondary_foreground: v })}
                        />
                    </CardContent>
                </Card>

                {/* Accent Colors */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Accent Colors</CardTitle>
                        <CardDescription>
                            Highlights and special elements.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ColorInput
                            label="Accent"
                            value={colors.accent_color}
                            onChange={(v) => setColors({ ...colors, accent_color: v })}
                        />
                        <ColorInput
                            label="Accent Foreground"
                            value={colors.accent_foreground}
                            onChange={(v) => setColors({ ...colors, accent_foreground: v })}
                        />
                    </CardContent>
                </Card>

                {/* Background Colors */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Background</CardTitle>
                        <CardDescription>
                            Page and text colors.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ColorInput
                            label="Background"
                            value={colors.background_color}
                            onChange={(v) => setColors({ ...colors, background_color: v })}
                            description="Main page background"
                        />
                        <ColorInput
                            label="Foreground"
                            value={colors.foreground_color}
                            onChange={(v) => setColors({ ...colors, foreground_color: v })}
                            description="Main text color"
                        />
                    </CardContent>
                </Card>

                {/* Card Colors */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Cards</CardTitle>
                        <CardDescription>
                            Card components and containers.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ColorInput
                            label="Card Background"
                            value={colors.card_color}
                            onChange={(v) => setColors({ ...colors, card_color: v })}
                        />
                        <ColorInput
                            label="Card Foreground"
                            value={colors.card_foreground}
                            onChange={(v) => setColors({ ...colors, card_foreground: v })}
                        />
                    </CardContent>
                </Card>

                {/* Muted & Border */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Muted & Borders</CardTitle>
                        <CardDescription>
                            Subtle backgrounds and borders.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ColorInput
                            label="Muted"
                            value={colors.muted_color}
                            onChange={(v) => setColors({ ...colors, muted_color: v })}
                        />
                        <ColorInput
                            label="Muted Foreground"
                            value={colors.muted_foreground}
                            onChange={(v) => setColors({ ...colors, muted_foreground: v })}
                        />
                        <ColorInput
                            label="Border"
                            value={colors.border_color}
                            onChange={(v) => setColors({ ...colors, border_color: v })}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Preview */}
            <Card>
                <CardHeader>
                    <CardTitle>Live Preview</CardTitle>
                    <CardDescription>
                        See how your color changes will look.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                        className="p-6 rounded-lg border"
                        style={{
                            backgroundColor: colors.background_color,
                            borderColor: colors.border_color,
                        }}
                    >
                        <div className="flex gap-4 flex-wrap">
                            {/* Primary Button */}
                            <button
                                type="button"
                                className="px-4 py-2 rounded-md font-medium"
                                style={{
                                    backgroundColor: colors.primary_color,
                                    color: colors.primary_foreground,
                                }}
                            >
                                Primary Button
                            </button>

                            {/* Secondary Button */}
                            <button
                                type="button"
                                className="px-4 py-2 rounded-md font-medium"
                                style={{
                                    backgroundColor: colors.secondary_color,
                                    color: colors.secondary_foreground,
                                }}
                            >
                                Secondary
                            </button>

                            {/* Accent */}
                            <button
                                type="button"
                                className="px-4 py-2 rounded-md font-medium"
                                style={{
                                    backgroundColor: colors.accent_color,
                                    color: colors.accent_foreground,
                                }}
                            >
                                Accent
                            </button>

                            {/* Destructive */}
                            <button
                                type="button"
                                className="px-4 py-2 rounded-md font-medium"
                                style={{
                                    backgroundColor: colors.destructive_color,
                                    color: colors.destructive_foreground,
                                }}
                            >
                                Destructive
                            </button>
                        </div>

                        <div className="mt-4 space-y-2">
                            <p style={{ color: colors.foreground_color }}>
                                This is regular text on the background.
                            </p>
                            <p style={{ color: colors.muted_foreground }}>
                                This is muted/secondary text.
                            </p>
                            <a
                                href="#"
                                style={{ color: colors.primary_color }}
                                onClick={(e) => e.preventDefault()}
                            >
                                This is a link
                            </a>
                        </div>

                        <div
                            className="mt-4 p-4 rounded-md"
                            style={{
                                backgroundColor: colors.card_color,
                                borderColor: colors.border_color,
                                border: '1px solid',
                            }}
                        >
                            <p style={{ color: colors.card_foreground }}>
                                This is a card component.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Button type="submit" disabled={isLoading} size="lg">
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                    </>
                ) : (
                    <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Theme Colors
                    </>
                )}
            </Button>
        </form>
    );
}
