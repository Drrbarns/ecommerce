"use server";

import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { toMinorUnits, fromMinorUnits } from '@/lib/money';
import { revalidatePath } from 'next/cache';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Validation schemas
const ShippingZoneSchema = z.object({
    name: z.string().min(1, 'Zone name is required'),
    countries: z.array(z.string()).min(1, 'At least one country required'),
    regions: z.array(z.string()).optional(),
    isActive: z.boolean().default(true),
});

const ShippingRateSchema = z.object({
    zoneId: z.string().uuid('Invalid zone ID'),
    name: z.string().min(1, 'Rate name is required'),
    description: z.string().optional(),
    price: z.number().min(0, 'Price must be non-negative'),
    minOrder: z.number().min(0).default(0),
    maxOrder: z.number().optional(),
    freeAbove: z.number().optional(),
    estimatedDaysMin: z.number().int().min(1).optional(),
    estimatedDaysMax: z.number().int().min(1).optional(),
    isActive: z.boolean().default(true),
    sortOrder: z.number().int().default(0),
});

export type ShippingZoneInput = z.infer<typeof ShippingZoneSchema>;
export type ShippingRateInput = z.infer<typeof ShippingRateSchema>;

/**
 * Get all shipping zones
 */
export async function getShippingZones() {
    const { data, error } = await supabase
        .from('shipping_zones')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching shipping zones:', error);
        return { zones: [] };
    }

    return { zones: data || [] };
}

/**
 * Create shipping zone
 */
export async function createShippingZone(input: ShippingZoneInput) {
    const validated = ShippingZoneSchema.safeParse(input);
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message };
    }

    const { data, error } = await supabase
        .from('shipping_zones')
        .insert({
            name: validated.data.name,
            countries: validated.data.countries,
            regions: validated.data.regions || null,
            is_active: validated.data.isActive,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating shipping zone:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/shipping');
    return { success: true, zoneId: data.id };
}

/**
 * Update shipping zone
 */
export async function updateShippingZone(id: string, input: Partial<ShippingZoneInput>) {
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.countries !== undefined) updateData.countries = input.countries;
    if (input.regions !== undefined) updateData.regions = input.regions;
    if (input.isActive !== undefined) updateData.is_active = input.isActive;

    const { error } = await supabase
        .from('shipping_zones')
        .update(updateData)
        .eq('id', id);

    if (error) {
        console.error('Error updating shipping zone:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/shipping');
    return { success: true };
}

/**
 * Delete shipping zone
 */
export async function deleteShippingZone(id: string) {
    const { error } = await supabase
        .from('shipping_zones')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting shipping zone:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/shipping');
    return { success: true };
}

/**
 * Get shipping rates (optionally filtered by zone)
 */
export async function getShippingRates(zoneId?: string) {
    let query = supabase
        .from('shipping_rates')
        .select('*, zone:shipping_zones(*)')
        .order('zone_id')
        .order('sort_order');

    if (zoneId) {
        query = query.eq('zone_id', zoneId);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching shipping rates:', error);
        return { rates: [] };
    }

    return { rates: data || [] };
}

/**
 * Create shipping rate
 */
export async function createShippingRate(input: ShippingRateInput) {
    const validated = ShippingRateSchema.safeParse(input);
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message };
    }

    const data = validated.data;

    const { data: rate, error } = await supabase
        .from('shipping_rates')
        .insert({
            zone_id: data.zoneId,
            name: data.name,
            description: data.description,
            price_minor: toMinorUnits(data.price),
            min_order_minor: toMinorUnits(data.minOrder),
            max_order_minor: data.maxOrder ? toMinorUnits(data.maxOrder) : null,
            free_above_minor: data.freeAbove ? toMinorUnits(data.freeAbove) : null,
            estimated_days_min: data.estimatedDaysMin,
            estimated_days_max: data.estimatedDaysMax,
            is_active: data.isActive,
            sort_order: data.sortOrder,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating shipping rate:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/shipping');
    return { success: true, rateId: rate.id };
}

/**
 * Update shipping rate
 */
export async function updateShippingRate(id: string, input: Partial<ShippingRateInput>) {
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.price !== undefined) updateData.price_minor = toMinorUnits(input.price);
    if (input.minOrder !== undefined) updateData.min_order_minor = toMinorUnits(input.minOrder);
    if (input.maxOrder !== undefined) updateData.max_order_minor = input.maxOrder ? toMinorUnits(input.maxOrder) : null;
    if (input.freeAbove !== undefined) updateData.free_above_minor = input.freeAbove ? toMinorUnits(input.freeAbove) : null;
    if (input.estimatedDaysMin !== undefined) updateData.estimated_days_min = input.estimatedDaysMin;
    if (input.estimatedDaysMax !== undefined) updateData.estimated_days_max = input.estimatedDaysMax;
    if (input.isActive !== undefined) updateData.is_active = input.isActive;
    if (input.sortOrder !== undefined) updateData.sort_order = input.sortOrder;

    const { error } = await supabase
        .from('shipping_rates')
        .update(updateData)
        .eq('id', id);

    if (error) {
        console.error('Error updating shipping rate:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/shipping');
    return { success: true };
}

/**
 * Delete shipping rate
 */
export async function deleteShippingRate(id: string) {
    const { error } = await supabase
        .from('shipping_rates')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting shipping rate:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/shipping');
    return { success: true };
}

/**
 * Calculate shipping for cart
 */
export async function calculateShipping(cartMinor: number, country: string, region?: string) {
    // Find matching zone
    const { data: zones } = await supabase
        .from('shipping_zones')
        .select('id')
        .contains('countries', [country])
        .eq('is_active', true);

    if (!zones || zones.length === 0) {
        return { success: false, error: 'No shipping available for this location' };
    }

    const zoneIds = zones.map(z => z.id);

    // Get applicable rates
    let query = supabase
        .from('shipping_rates')
        .select('*')
        .in('zone_id', zoneIds)
        .eq('is_active', true)
        .lte('min_order_minor', cartMinor);

    // Filter by max order if specified
    query = query.or(`max_order_minor.is.null,max_order_minor.gte.${cartMinor}`);

    const { data: rates } = await query;

    if (!rates || rates.length === 0) {
        return { success: false, error: 'No shipping rates available for this cart value' };
    }

    // Calculate final costs (apply free shipping thresholds)
    const calculatedRates = rates.map(rate => {
        let cost = rate.price_minor;

        // Apply free shipping if threshold met
        if (rate.free_above_minor && cartMinor >= rate.free_above_minor) {
            cost = 0;
        }

        return {
            id: rate.id,
            name: rate.name,
            description: rate.description,
            costMinor: cost,
            cost: fromMinorUnits(cost),
            estimatedDays: rate.estimated_days_min && rate.estimated_days_max
                ? `${rate.estimated_days_min}-${rate.estimated_days_max} days`
                : null,
            isFree: cost === 0,
        };
    });

    // Sort by cost (cheapest first)
    calculatedRates.sort((a, b) => a.costMinor - b.costMinor);

    return {
        success: true,
        rates: calculatedRates,
        cheapest: calculatedRates[0],
    };
}
