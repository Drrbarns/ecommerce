"use server";

import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { toMinorUnits } from '@/lib/money';
import { revalidatePath } from 'next/cache';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Validation schemas
const VariantSchema = z.object({
    productId: z.string().uuid(),
    sku: z.string().optional(),
    name: z.string().optional(),
    price: z.number().positive(),
    compareAtPrice: z.number().positive().optional(),
    inventoryCount: z.number().int().min(0).default(0),
    option1Name: z.string().optional(),
    option1Value: z.string().optional(),
    option2Name: z.string().optional(),
    option2Value: z.string().optional(),
    option3Name: z.string().optional(),
    option3Value: z.string().optional(),
    isActive: z.boolean().default(true),
    weightGrams: z.number().int().optional(),
    barcode: z.string().optional(),
});

export type VariantInput = z.infer<typeof VariantSchema>;

/**
 * Get all variants for a product
 */
export async function getProductVariants(productId: string) {
    const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching variants:', error);
        return { variants: [] };
    }

    return { variants: data || [] };
}

/**
 * Get variant by ID
 */
export async function getVariantById(id: string) {
    const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching variant:', error);
        return null;
    }

    return data;
}

/**
 * Create variant
 */
export async function createVariant(input: VariantInput) {
    const validated = VariantSchema.safeParse(input);
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message };
    }

    const data = validated.data;

    const { data: variant, error } = await supabase
        .from('product_variants')
        .insert({
            product_id: data.productId,
            sku: data.sku,
            name: data.name,
            price_minor: toMinorUnits(data.price),
            compare_at_price_minor: data.compareAtPrice ? toMinorUnits(data.compareAtPrice) : null,
            inventory_count: data.inventoryCount,
            option_1_name: data.option1Name,
            option_1_value: data.option1Value,
            option_2_name: data.option2Name,
            option_2_value: data.option2Value,
            option_3_name: data.option3Name,
            option_3_value: data.option3Value,
            is_active: data.isActive,
            weight_grams: data.weightGrams,
            barcode: data.barcode,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating variant:', error);
        return { success: false, error: error.message };
    }

    revalidatePath(`/admin/products/${data.productId}`);
    revalidatePath('/shop');
    return { success: true, variantId: variant.id };
}

/**
 * Update variant
 */
export async function updateVariant(id: string, input: Partial<VariantInput>) {
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (input.sku !== undefined) updateData.sku = input.sku;
    if (input.name !== undefined) updateData.name = input.name;
    if (input.price !== undefined) updateData.price_minor = toMinorUnits(input.price);
    if (input.compareAtPrice !== undefined) updateData.compare_at_price_minor = input.compareAtPrice ? toMinorUnits(input.compareAtPrice) : null;
    if (input.inventoryCount !== undefined) updateData.inventory_count = input.inventoryCount;
    if (input.option1Name !== undefined) updateData.option_1_name = input.option1Name;
    if (input.option1Value !== undefined) updateData.option_1_value = input.option1Value;
    if (input.option2Name !== undefined) updateData.option_2_name = input.option2Name;
    if (input.option2Value !== undefined) updateData.option2Value = input.option2Value;
    if (input.option3Name !== undefined) updateData.option_3_name = input.option3Name;
    if (input.option3Value !== undefined) updateData.option_3_value = input.option3Value;
    if (input.isActive !== undefined) updateData.is_active = input.isActive;
    if (input.weightGrams !== undefined) updateData.weight_grams = input.weightGrams;
    if (input.barcode !== undefined) updateData.barcode = input.barcode;

    const { error } = await supabase
        .from('product_variants')
        .update(updateData)
        .eq('id', id);

    if (error) {
        console.error('Error updating variant:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/products');
    revalidatePath('/shop');
    return { success: true };
}

/**
 * Delete variant
 */
export async function deleteVariant(id: string) {
    const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting variant:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/products');
    revalidatePath('/shop');
    return { success: true };
}

/**
 * Bulk create variants from option combinations
 */
export async function bulkCreateVariants(
    productId: string,
    options: {
        option1Name: string;
        option1Values: string[];
        option2Name?: string;
        option2Values?: string[];
        basePrice: number;
        baseSku?: string;
    }
) {
    const variants: Array<Record<string, unknown>> = [];

    // Generate all combinations
    if (options.option2Name && options.option2Values && options.option2Values.length > 0) {
        // Two-option variants
        for (const val1 of options.option1Values) {
            for (const val2 of options.option2Values) {
                const name = `${val1} / ${val2}`;
                const sku = options.baseSku ? `${options.baseSku}-${val1}-${val2}`.toUpperCase() : undefined;

                variants.push({
                    product_id: productId,
                    name,
                    sku,
                    price_minor: toMinorUnits(options.basePrice),
                    inventory_count: 0,
                    option_1_name: options.option1Name,
                    option_1_value: val1,
                    option_2_name: options.option2Name,
                    option_2_value: val2,
                    is_active: true,
                });
            }
        }
    } else {
        // Single-option variants
        for (const val1 of options.option1Values) {
            const name = val1;
            const sku = options.baseSku ? `${options.baseSku}-${val1}`.toUpperCase() : undefined;

            variants.push({
                product_id: productId,
                name,
                sku,
                price_minor: toMinorUnits(options.basePrice),
                inventory_count: 0,
                option_1_name: options.option1Name,
                option_1_value: val1,
                is_active: true,
            });
        }
    }

    const { data, error } = await supabase
        .from('product_variants')
        .insert(variants)
        .select();

    if (error) {
        console.error('Error bulk creating variants:', error);
        return { success: false, error: error.message };
    }

    revalidatePath(`/admin/products/${productId}`);
    revalidatePath('/shop');
    return { success: true, count: data.length, variantIds: data.map(v => v.id) };
}

/**
 * Adjust variant inventory
 */
export async function adjustVariantInventory(
    variantId: string,
    adjustment: number,
    reason: string,
    type: 'restock' | 'sale' | 'damage' | 'correction' | 'return'
) {
    // Get current inventory
    const { data: variant } = await supabase
        .from('product_variants')
        .select('inventory_count, product_id')
        .eq('id', variantId)
        .single();

    if (!variant) {
        return { success: false, error: 'Variant not found' };
    }

    const newInventory = variant.inventory_count + adjustment;

    if (newInventory < 0) {
        return { success: false, error: 'Insufficient inventory' };
    }

    // Update inventory
    const { error: updateError } = await supabase
        .from('product_variants')
        .update({
            inventory_count: newInventory,
            updated_at: new Date().toISOString(),
        })
        .eq('id', variantId);

    if (updateError) {
        console.error('Error updating inventory:', updateError);
        return { success: false, error: updateError.message };
    }

    // Log adjustment
    const { error: logError } = await supabase
        .from('product_stock_adjustments')
        .insert({
            product_id: variant.product_id,
            variant_id: variantId,
            adjustment_type: type,
            quantity_change: adjustment,
            reason,
            previous_quantity: variant.inventory_count,
            new_quantity: newInventory,
        });

    if (logError) {
        console.error('Error logging adjustment:', logError);
        // Don't fail the adjustment if logging fails
    }

    revalidatePath('/admin/products');
    return { success: true, newInventory };
}
