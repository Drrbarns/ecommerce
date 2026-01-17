"use server";

import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// Use untyped client for new tables not in the type definitions yet
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Store Settings Schema
const StoreSettingsSchema = z.object({
    name: z.string().min(1).optional(),
    tagline: z.string().optional(),
    description: z.string().optional(),
    logo: z.string().url().optional().nullable(),
    favicon: z.string().url().optional().nullable(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    address: z.object({
        line1: z.string().optional(),
        line2: z.string().optional(),
        city: z.string().optional(),
        region: z.string().optional(),
        country: z.string().optional(),
        postal: z.string().optional(),
    }).optional(),
    socialLinks: z.object({
        facebook: z.string().optional(),
        instagram: z.string().optional(),
        twitter: z.string().optional(),
        tiktok: z.string().optional(),
    }).optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    seoImage: z.string().url().optional().nullable(),
    guestCheckoutEnabled: z.boolean().optional(),
    taxRate: z.number().min(0).max(10000).optional(), // Basis points
    taxIncluded: z.boolean().optional(),
    orderNotificationEmail: z.string().email().optional(),
    lowStockThreshold: z.number().int().min(0).optional(),
    googleAnalyticsId: z.string().optional(),
    facebookPixelId: z.string().optional(),
});

export type UpdateStoreSettingsInput = z.infer<typeof StoreSettingsSchema>;

/**
 * Get store settings
 */
export async function getStoreSettings() {
    const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .single();

    if (error) {
        console.error('Error fetching store settings:', error);
        return null;
    }

    return data;
}

/**
 * Update store settings
 */
export async function updateStoreSettings(input: UpdateStoreSettingsInput) {
    const validated = StoreSettingsSchema.safeParse(input);
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message };
    }

    const data = validated.data;
    const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.tagline !== undefined) updateData.tagline = data.tagline;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.logo !== undefined) updateData.logo = data.logo;
    if (data.favicon !== undefined) updateData.favicon = data.favicon;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.whatsapp !== undefined) updateData.whatsapp = data.whatsapp;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.socialLinks !== undefined) updateData.social_links = data.socialLinks;
    if (data.seoTitle !== undefined) updateData.seo_title = data.seoTitle;
    if (data.seoDescription !== undefined) updateData.seo_description = data.seoDescription;
    if (data.seoImage !== undefined) updateData.seo_image = data.seoImage;
    if (data.guestCheckoutEnabled !== undefined) updateData.guest_checkout_enabled = data.guestCheckoutEnabled;
    if (data.taxRate !== undefined) updateData.tax_rate = data.taxRate;
    if (data.taxIncluded !== undefined) updateData.tax_included = data.taxIncluded;
    if (data.orderNotificationEmail !== undefined) updateData.order_notification_email = data.orderNotificationEmail;
    if (data.lowStockThreshold !== undefined) updateData.low_stock_threshold = data.lowStockThreshold;
    if (data.googleAnalyticsId !== undefined) updateData.google_analytics_id = data.googleAnalyticsId;
    if (data.facebookPixelId !== undefined) updateData.facebook_pixel_id = data.facebookPixelId;

    // Update the single store settings row
    const { error } = await supabase
        .from('store_settings')
        .update(updateData)
        .not('id', 'is', null); // Update all rows (should be only one)

    if (error) {
        console.error('Error updating store settings:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/settings');

    return { success: true };
}

/**
 * Get shipping zones and rates
 */
export async function getShippingZones() {
    const { data, error } = await supabase
        .from('shipping_zones')
        .select(`
            *,
            shipping_rates (*)
        `)
        .order('name');

    if (error) {
        console.error('Error fetching shipping zones:', error);
        return [];
    }

    return data || [];
}

/**
 * Update shipping rate
 */
export async function updateShippingRate(rateId: string, input: {
    name?: string;
    description?: string;
    priceMinor?: number;
    freeAboveMinor?: number | null;
    isActive?: boolean;
}) {
    const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.priceMinor !== undefined) updateData.price_minor = input.priceMinor;
    if (input.freeAboveMinor !== undefined) updateData.free_above_minor = input.freeAboveMinor;
    if (input.isActive !== undefined) updateData.is_active = input.isActive;

    const { error } = await supabase
        .from('shipping_rates')
        .update(updateData)
        .eq('id', rateId);

    if (error) {
        console.error('Error updating shipping rate:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/shipping');

    return { success: true };
}

/**
 * Get payment providers
 */
export async function getPaymentProviders() {
    const { data, error } = await supabase
        .from('payment_providers')
        .select('*')
        .order('priority');

    if (error) {
        console.error('Error fetching payment providers:', error);
        return [];
    }

    return data || [];
}

/**
 * Update payment provider
 */
export async function updatePaymentProvider(provider: string, input: {
    isEnabled?: boolean;
    isPrimary?: boolean;
    isTestMode?: boolean;
}) {
    const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
    };

    if (input.isEnabled !== undefined) updateData.is_enabled = input.isEnabled;
    if (input.isPrimary !== undefined) {
        updateData.is_primary = input.isPrimary;
        // If setting as primary, unset others
        if (input.isPrimary) {
            await supabase
                .from('payment_providers')
                .update({ is_primary: false })
                .neq('provider', provider);
        }
    }
    if (input.isTestMode !== undefined) updateData.is_test_mode = input.isTestMode;

    const { error } = await supabase
        .from('payment_providers')
        .update(updateData)
        .eq('provider', provider);

    if (error) {
        console.error('Error updating payment provider:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/settings');

    return { success: true };
}
