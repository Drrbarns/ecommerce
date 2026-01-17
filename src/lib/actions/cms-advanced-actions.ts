"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

// Create untyped Supabase client for CMS tables
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ================== ADVANCED SETTINGS ==================

export interface AdvancedSettings {
    id: string;

    // Custom CSS & Scripts
    custom_css: string;
    custom_head_scripts: string;
    custom_body_scripts: string;

    // Analytics & Tracking
    google_analytics_id: string;
    google_tag_manager_id: string;
    facebook_pixel_id: string;
    tiktok_pixel_id: string;
    hotjar_id: string;

    // SEO & Meta
    google_site_verification: string;
    bing_site_verification: string;
    default_robots_meta: string;

    // Maintenance Mode
    maintenance_mode: boolean;
    maintenance_message: string;
    maintenance_allowed_ips: string[];

    // Cookie Consent
    cookie_consent_enabled: boolean;
    cookie_consent_message: string;
    cookie_policy_url: string;

    // Social Proof & Trust
    show_stock_warning: boolean;
    low_stock_threshold: number;
    show_sold_count: boolean;

    // Performance
    lazy_load_images: boolean;
    enable_image_optimization: boolean;

    // Chat & Support
    tawk_to_id: string;
    crisp_website_id: string;
    intercom_app_id: string;
    whatsapp_number: string;
    whatsapp_message: string;

    // Third-party Integrations
    mailchimp_api_key: string;
    mailchimp_list_id: string;
    sendgrid_api_key: string;
    recaptcha_site_key: string;
    recaptcha_secret_key: string;
}

const DEFAULT_SETTINGS_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Get advanced settings
 */
export async function getAdvancedSettings(): Promise<AdvancedSettings | null> {
    const { data, error } = await supabase
        .from("cms_advanced_settings")
        .select("*")
        .eq("id", DEFAULT_SETTINGS_ID)
        .single();

    if (error) {
        console.error("Error fetching advanced settings:", error);
        return null;
    }

    return data as AdvancedSettings;
}

/**
 * Update advanced settings
 */
export async function updateAdvancedSettings(settings: Partial<AdvancedSettings>) {
    const updateData: Record<string, unknown> = {
        ...settings,
        updated_at: new Date().toISOString(),
    };

    // Remove id from update
    delete updateData.id;

    const { error } = await supabase
        .from("cms_advanced_settings")
        .update(updateData)
        .eq("id", DEFAULT_SETTINGS_ID);

    if (error) {
        console.error("Error updating advanced settings:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/admin/cms");

    return { success: true };
}

/**
 * Update specific section of advanced settings
 */
export async function updateAdvancedSettingsSection(
    section: string,
    data: Record<string, unknown>
) {
    const { error } = await supabase
        .from("cms_advanced_settings")
        .update({
            ...data,
            updated_at: new Date().toISOString(),
        })
        .eq("id", DEFAULT_SETTINGS_ID);

    if (error) {
        console.error(`Error updating ${section} settings:`, error);
        return { success: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/admin/cms");

    return { success: true };
}

/**
 * Toggle maintenance mode
 */
export async function toggleMaintenanceMode(enabled: boolean) {
    return updateAdvancedSettingsSection("maintenance", {
        maintenance_mode: enabled,
    });
}

/**
 * Get public settings (safe to expose to frontend)
 */
export async function getPublicAdvancedSettings() {
    const settings = await getAdvancedSettings();

    if (!settings) return null;

    // Only return non-sensitive settings
    return {
        google_analytics_id: settings.google_analytics_id,
        google_tag_manager_id: settings.google_tag_manager_id,
        facebook_pixel_id: settings.facebook_pixel_id,
        tiktok_pixel_id: settings.tiktok_pixel_id,
        hotjar_id: settings.hotjar_id,
        custom_css: settings.custom_css,
        custom_head_scripts: settings.custom_head_scripts,
        custom_body_scripts: settings.custom_body_scripts,
        cookie_consent_enabled: settings.cookie_consent_enabled,
        cookie_consent_message: settings.cookie_consent_message,
        cookie_policy_url: settings.cookie_policy_url,
        show_stock_warning: settings.show_stock_warning,
        low_stock_threshold: settings.low_stock_threshold,
        show_sold_count: settings.show_sold_count,
        tawk_to_id: settings.tawk_to_id,
        crisp_website_id: settings.crisp_website_id,
        intercom_app_id: settings.intercom_app_id,
        whatsapp_number: settings.whatsapp_number,
        whatsapp_message: settings.whatsapp_message,
        maintenance_mode: settings.maintenance_mode,
        maintenance_message: settings.maintenance_message,
        recaptcha_site_key: settings.recaptcha_site_key,
    };
}
