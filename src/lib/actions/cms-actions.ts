"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

// Create untyped Supabase client for CMS tables (not in type definitions yet)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ================== CMS CONTENT ==================

export interface CMSContent {
    id: string;
    section_key: string;
    section_name: string;
    content: Record<string, unknown>;
    is_active: boolean;
    updated_at: string;
}

export interface HeroContent {
    title: string;
    subtitle: string;
    badge?: string;
    primaryButtonText: string;
    primaryButtonLink: string;
    secondaryButtonText?: string;
    secondaryButtonLink?: string;
    backgroundImage?: string;
    overlayOpacity?: number;
    backgroundColor?: string;      // Section background color
    cardBackgroundColor?: string;  // Hero card/container background
    textColor?: string;            // Main headline color
    subtitleColor?: string;        // Subtitle text color
}

export interface FooterContent {
    companyName: string;
    tagline: string;
    copyrightText: string;
    socialLinks: {
        facebook?: string;
        instagram?: string;
        twitter?: string;
        tiktok?: string;
        whatsapp?: string;
    };
    quickLinks: Array<{ label: string; href: string }>;
    customerService: Array<{ label: string; href: string }>;
    contactInfo: {
        email?: string;
        phone?: string;
        address?: string;
    };
}

export interface FeaturesContent {
    title: string;
    subtitle: string;
    features: Array<{
        icon: string;
        title: string;
        description: string;
    }>;
}

export interface PromoBannerContent {
    enabled: boolean;
    text: string;
    link?: string;
    backgroundColor: string;
    textColor: string;
}

/**
 * Get all CMS content sections
 */
export async function getAllCMSContent() {
    const { data, error } = await supabase
        .from("cms_content")
        .select("*")
        .order("section_name");

    if (error) {
        console.error("Error fetching CMS content:", error);
        return [];
    }

    return data as CMSContent[];
}

/**
 * Get a specific content section by key
 */
export async function getCMSContent<T>(sectionKey: string): Promise<T | null> {
    const { data, error } = await supabase
        .from("cms_content")
        .select("content")
        .eq("section_key", sectionKey)
        .eq("is_active", true)
        .single();

    if (error) {
        console.error(`Error fetching CMS content for ${sectionKey}:`, error);
        return null;
    }

    return (data as { content: T } | null)?.content ?? null;
}

/**
 * Update a content section
 */
export async function updateCMSContent(
    sectionKey: string,
    content: Record<string, unknown>
) {
    const { error } = await supabase
        .from("cms_content")
        .update({
            content,
            updated_at: new Date().toISOString(),
        })
        .eq("section_key", sectionKey);

    if (error) {
        console.error("Error updating CMS content:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/admin/cms");

    return { success: true };
}

/**
 * Toggle content section active status
 */
export async function toggleCMSContentActive(sectionKey: string, isActive: boolean) {
    const { error } = await supabase
        .from("cms_content")
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq("section_key", sectionKey);

    if (error) {
        console.error("Error toggling CMS content:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/admin/cms");

    return { success: true };
}

// ================== CMS THEME ==================

export interface CMSTheme {
    id: string;
    theme_name: string;
    is_active: boolean;
    primary_color: string;
    primary_foreground: string;
    secondary_color: string;
    secondary_foreground: string;
    accent_color: string;
    accent_foreground: string;
    background_color: string;
    foreground_color: string;
    card_color: string;
    card_foreground: string;
    muted_color: string;
    muted_foreground: string;
    border_color: string;
    ring_color: string;
    destructive_color: string;
    destructive_foreground: string;
}

/**
 * Get active theme
 */
export async function getActiveTheme(): Promise<CMSTheme | null> {
    const { data, error } = await supabase
        .from("cms_theme")
        .select("*")
        .eq("is_active", true)
        .single();

    if (error) {
        console.error("Error fetching theme:", error);
        return null;
    }

    return data as CMSTheme;
}

/**
 * Update theme colors
 */
export async function updateTheme(themeId: string, colors: Partial<CMSTheme>) {
    const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
    };

    // Map incoming colors to database columns
    if (colors.primary_color !== undefined) updateData.primary_color = colors.primary_color;
    if (colors.primary_foreground !== undefined) updateData.primary_foreground = colors.primary_foreground;
    if (colors.secondary_color !== undefined) updateData.secondary_color = colors.secondary_color;
    if (colors.secondary_foreground !== undefined) updateData.secondary_foreground = colors.secondary_foreground;
    if (colors.accent_color !== undefined) updateData.accent_color = colors.accent_color;
    if (colors.accent_foreground !== undefined) updateData.accent_foreground = colors.accent_foreground;
    if (colors.background_color !== undefined) updateData.background_color = colors.background_color;
    if (colors.foreground_color !== undefined) updateData.foreground_color = colors.foreground_color;
    if (colors.card_color !== undefined) updateData.card_color = colors.card_color;
    if (colors.card_foreground !== undefined) updateData.card_foreground = colors.card_foreground;
    if (colors.muted_color !== undefined) updateData.muted_color = colors.muted_color;
    if (colors.muted_foreground !== undefined) updateData.muted_foreground = colors.muted_foreground;
    if (colors.border_color !== undefined) updateData.border_color = colors.border_color;
    if (colors.ring_color !== undefined) updateData.ring_color = colors.ring_color;
    if (colors.destructive_color !== undefined) updateData.destructive_color = colors.destructive_color;
    if (colors.destructive_foreground !== undefined) updateData.destructive_foreground = colors.destructive_foreground;

    const { error } = await supabase
        .from("cms_theme")
        .update(updateData)
        .eq("id", themeId);

    if (error) {
        console.error("Error updating theme:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/admin/cms");

    return { success: true };
}

/**
 * Reset theme to defaults
 */
export async function resetThemeToDefaults(themeId: string) {
    const defaultTheme = {
        primary_color: "#1B4D3E", // Deep Emerald
        primary_foreground: "#FFFFFF",
        secondary_color: "#F4F4F5", // Zinc 100
        secondary_foreground: "#18181B",
        accent_color: "#D97706", // Amber 600
        accent_foreground: "#FFFFFF",
        background_color: "#FFFFFF",
        foreground_color: "#1C1917", // Stone 950
        card_color: "#FFFFFF",
        card_foreground: "#1C1917",
        muted_color: "#E7E5E4", // Stone 200
        muted_foreground: "#78716C", // Stone 500
        border_color: "#E7E5E4",
        ring_color: "#1B4D3E",
        destructive_color: "#EF4444",
        destructive_foreground: "#FFFFFF",
        updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
        .from("cms_theme")
        .update(defaultTheme)
        .eq("id", themeId);

    if (error) {
        console.error("Error resetting theme:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/admin/cms");

    return { success: true };
}
