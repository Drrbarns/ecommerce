"use server";

import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// Use untyped client for new tables not in the type definitions yet
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Coupon Schema
const CouponSchema = z.object({
    code: z.string().min(3).max(20).transform(s => s.toUpperCase()),
    description: z.string().optional(),
    discountType: z.enum(['percentage', 'fixed']),
    discountValue: z.number().int().positive(),
    minOrderMinor: z.number().int().min(0).default(0),
    maxDiscountMinor: z.number().int().positive().optional(),
    usageLimit: z.number().int().positive().optional(),
    usageLimitPerCustomer: z.number().int().positive().default(1),
    startsAt: z.string().datetime().optional(),
    expiresAt: z.string().datetime().optional(),
    isActive: z.boolean().default(true),
    appliesTo: z.enum(['all', 'products', 'categories']).default('all'),
    productIds: z.array(z.string().uuid()).optional(),
    categoryIds: z.array(z.string().uuid()).optional(),
    firstOrderOnly: z.boolean().default(false),
    freeShipping: z.boolean().default(false),
});

export type CreateCouponInput = z.infer<typeof CouponSchema>;

/**
 * Create a coupon
 */
export async function createCoupon(input: CreateCouponInput) {
    const validated = CouponSchema.safeParse(input);
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message };
    }

    const data = validated.data;

    // Check if code already exists
    const { data: existing } = await supabase
        .from('coupons')
        .select('id')
        .eq('code', data.code)
        .single();

    if (existing) {
        return { success: false, error: 'Coupon code already exists' };
    }

    const { data: coupon, error } = await supabase
        .from('coupons')
        .insert({
            code: data.code,
            description: data.description,
            discount_type: data.discountType,
            discount_value: data.discountValue,
            min_order_minor: data.minOrderMinor,
            max_discount_minor: data.maxDiscountMinor,
            usage_limit: data.usageLimit,
            usage_limit_per_customer: data.usageLimitPerCustomer,
            starts_at: data.startsAt || new Date().toISOString(),
            expires_at: data.expiresAt,
            is_active: data.isActive,
            applies_to: data.appliesTo,
            product_ids: data.productIds,
            category_ids: data.categoryIds,
            first_order_only: data.firstOrderOnly,
            free_shipping: data.freeShipping,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating coupon:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/coupons');

    return { success: true, couponId: (coupon as { id: string }).id };
}

/**
 * Update a coupon
 */
export async function updateCoupon(couponId: string, input: Partial<CreateCouponInput>) {
    const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
    };

    if (input.description !== undefined) updateData.description = input.description;
    if (input.discountType !== undefined) updateData.discount_type = input.discountType;
    if (input.discountValue !== undefined) updateData.discount_value = input.discountValue;
    if (input.minOrderMinor !== undefined) updateData.min_order_minor = input.minOrderMinor;
    if (input.maxDiscountMinor !== undefined) updateData.max_discount_minor = input.maxDiscountMinor;
    if (input.usageLimit !== undefined) updateData.usage_limit = input.usageLimit;
    if (input.usageLimitPerCustomer !== undefined) updateData.usage_limit_per_customer = input.usageLimitPerCustomer;
    if (input.startsAt !== undefined) updateData.starts_at = input.startsAt;
    if (input.expiresAt !== undefined) updateData.expires_at = input.expiresAt;
    if (input.isActive !== undefined) updateData.is_active = input.isActive;
    if (input.freeShipping !== undefined) updateData.free_shipping = input.freeShipping;

    const { error } = await supabase
        .from('coupons')
        .update(updateData)
        .eq('id', couponId);

    if (error) {
        console.error('Error updating coupon:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/coupons');

    return { success: true };
}

/**
 * Delete a coupon
 */
export async function deleteCoupon(couponId: string) {
    const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', couponId);

    if (error) {
        console.error('Error deleting coupon:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/coupons');

    return { success: true };
}

/**
 * Get all coupons
 */
export async function getCoupons(options?: {
    isActive?: boolean;
    limit?: number;
    offset?: number;
}) {
    let query = supabase
        .from('coupons')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

    if (options?.isActive !== undefined) {
        query = query.eq('is_active', options.isActive);
    }

    if (options?.limit) {
        query = query.limit(options.limit);
    }

    if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching coupons:', error);
        return { coupons: [], count: 0 };
    }

    return { coupons: data || [], count: count || 0 };
}

/**
 * Get coupon by ID
 */
export async function getCouponById(id: string) {
    const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching coupon:', error);
        return null;
    }

    return data;
}

/**
 * Validate a coupon code (for checkout)
 */
export async function validateCoupon(code: string, subtotalMinor: number, customerEmail?: string) {
    const { data, error } = await supabase
        .rpc('validate_coupon', {
            p_code: code.toUpperCase(),
            p_order_subtotal_minor: subtotalMinor,
            p_customer_email: customerEmail,
        });

    if (error) {
        console.error('Error validating coupon:', error);
        return { valid: false, error: 'Failed to validate coupon' };
    }

    if (!data || data.length === 0) {
        return { valid: false, error: 'Invalid coupon code' };
    }

    const result = data[0];

    if (!result.valid) {
        return { valid: false, error: result.error_message || 'Invalid coupon' };
    }

    // Calculate discount
    let discountMinor = 0;
    if (result.discount_type === 'percentage') {
        discountMinor = Math.round((subtotalMinor * result.discount_value) / 100);
        if (result.max_discount_minor && discountMinor > result.max_discount_minor) {
            discountMinor = result.max_discount_minor;
        }
    } else {
        discountMinor = result.discount_value;
    }

    return {
        valid: true,
        couponId: result.coupon_id,
        discountType: result.discount_type,
        discountValue: result.discount_value,
        discountMinor,
        freeShipping: result.free_shipping,
    };
}
