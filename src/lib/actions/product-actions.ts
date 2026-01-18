"use server";

import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { toMinorUnits } from '@/lib/money';
import { revalidatePath } from 'next/cache';

// Use untyped client for products table which has schema changes
const supabaseUntyped = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Validation schemas
const ProductSchema = z.object({
    name: z.string().min(2, 'Product name is required'),
    slug: z.string().min(2, 'Slug is required'),
    sku: z.string().optional(),
    description: z.string().optional(),
    price: z.number().positive('Price must be positive'),
    compareAtPrice: z.number().positive().optional(),
    cost: z.number().positive().optional(),
    image: z.string().optional(),
    images: z.array(z.string()).optional(),
    category: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    brandId: z.string().uuid().optional(),
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
    isNew: z.boolean().default(false),
    isSale: z.boolean().default(false),
    isFeatured: z.boolean().default(false),
    isActive: z.boolean().default(true),
    inventoryCount: z.number().int().min(0).default(0),
    lowStockThreshold: z.number().int().min(0).default(5),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
});

export type CreateProductInput = z.input<typeof ProductSchema>;

/**
 * Create a new product
 */
export async function createProduct(input: CreateProductInput) {
    const validated = ProductSchema.safeParse(input);
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message };
    }

    const data = validated.data;
    const priceMinor = toMinorUnits(data.price);
    const compareAtPriceMinor = data.compareAtPrice ? toMinorUnits(data.compareAtPrice) : null;
    const costMinor = data.cost ? toMinorUnits(data.cost) : null;

    const { data: productData, error } = await supabaseUntyped
        .from('products')
        .insert({
            name: data.name,
            slug: data.slug,
            sku: data.sku,
            description: data.description,
            price: data.price,
            price_minor: priceMinor,
            compare_at_price_minor: compareAtPriceMinor,
            cost_minor: costMinor,
            image: data.image,
            category: data.category,
            category_id: data.categoryId,
            brand_id: data.brandId,
            status: data.status,
            is_new: data.isNew,
            is_sale: data.isSale,
            is_featured: data.isFeatured,
            is_active: data.isActive,
            inventory_count: data.inventoryCount,
            low_stock_threshold: data.lowStockThreshold,
            seo_title: data.seoTitle,
            seo_description: data.seoDescription,
        })
        .select()
        .single();

    const product = productData as { id: string } | null;

    if (error || !product) {
        console.error('Error creating product:', error);
        return { success: false, error: error?.message || 'Failed to create product' };
    }

    // Save gallery images to product_images table
    if (data.images && data.images.length > 0) {
        const imageInserts = data.images.map((url, index) => ({
            product_id: product.id,
            url,
            position: index,
            is_primary: index === 0,
        }));

        await supabaseUntyped.from('product_images').insert(imageInserts);
    }

    revalidatePath('/admin/products');
    revalidatePath('/shop');

    return { success: true, productId: product.id };
}

export async function updateProduct(productId: string, input: Partial<CreateProductInput>) {
    const updateData: Record<string, unknown> = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.slug !== undefined) updateData.slug = input.slug;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.price !== undefined) {
        updateData.price = input.price;
        updateData.price_minor = toMinorUnits(input.price);
    }
    if (input.image !== undefined) updateData.image = input.image;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.categoryId !== undefined) updateData.category_id = input.categoryId;
    if (input.brandId !== undefined) updateData.brand_id = input.brandId;
    if (input.isNew !== undefined) updateData.is_new = input.isNew;
    if (input.isSale !== undefined) updateData.is_sale = input.isSale;
    if (input.isFeatured !== undefined) updateData.is_featured = input.isFeatured;
    if (input.isActive !== undefined) updateData.is_active = input.isActive;
    if (input.inventoryCount !== undefined) updateData.inventory_count = input.inventoryCount;

    // New fields
    if (input.sku !== undefined) updateData.sku = input.sku;
    if (input.cost !== undefined) updateData.cost_minor = toMinorUnits(input.cost);
    if (input.compareAtPrice !== undefined) updateData.compare_at_price_minor = toMinorUnits(input.compareAtPrice);
    if (input.lowStockThreshold !== undefined) updateData.low_stock_threshold = input.lowStockThreshold;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.seoTitle !== undefined) updateData.seo_title = input.seoTitle;
    if (input.seoDescription !== undefined) updateData.seo_description = input.seoDescription;
    if (input.images !== undefined) updateData.images = input.images;

    updateData.updated_at = new Date().toISOString();

    const { error } = await supabaseUntyped
        .from('products')
        .update(updateData)
        .eq('id', productId);

    if (error) {
        console.error('Error updating product:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/products');
    revalidatePath('/shop');
    if (input.slug) {
        revalidatePath(`/products/${input.slug}`);
    }

    return { success: true };
}

/**
 * Delete a product
 */
export async function deleteProduct(productId: string) {
    // Soft delete: Archive the product instead of removing row to preserve order history
    const { error } = await supabaseUntyped
        .from('products')
        .update({
            status: 'archived',
            is_active: false,
            updated_at: new Date().toISOString()
        })
        .eq('id', productId);

    if (error) {
        console.error('Error deleting product:', error);
        return { success: false, error: error.message };
    }

    // Refresh analytics cache to update views like low_stock_items
    await supabaseUntyped.rpc('refresh_analytics_cache');

    revalidatePath('/admin/products');
    revalidatePath('/shop');

    return { success: true };
}

/**
 * Get all products for admin
 */
export async function getProductsAdmin(options?: {
    search?: string;
    categoryId?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
}) {
    let query = supabaseUntyped
        .from('products')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

    if (options?.search) {
        query = query.ilike('name', `%${options.search}%`);
    }

    if (options?.categoryId) {
        query = query.eq('category_id', options.categoryId);
    }

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
        console.error('Error fetching products:', error);
        return { products: [], count: 0 };
    }

    return { products: data || [], count: count || 0 };
}

/**
 * Get product by ID
 */
export async function getProductById(id: string) {
    const { data, error } = await supabaseUntyped
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching product:', error);
        return null;
    }

    return data;
}

/**
 * Bulk update products
 */
export async function bulkUpdateProducts(
    productIds: string[],
    updates: { isActive?: boolean; isFeatured?: boolean }
) {
    const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
    };

    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.isFeatured !== undefined) updateData.is_featured = updates.isFeatured;

    const { error } = await supabaseUntyped
        .from('products')
        .update(updateData)
        .in('id', productIds);

    if (error) {
        console.error('Error bulk updating products:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/products');
    revalidatePath('/shop');

    return { success: true };
}

/**
 * Update product SEO metadata
 */
export async function updateProductSEO(
    productId: string,
    seo: { seoTitle?: string; seoDescription?: string; ogImage?: string }
) {
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (seo.seoTitle !== undefined) updateData.seo_title = seo.seoTitle;
    if (seo.seoDescription !== undefined) updateData.seo_description = seo.seoDescription;
    if (seo.ogImage !== undefined) updateData.og_image = seo.ogImage;

    const { error } = await supabaseUntyped
        .from('products')
        .update(updateData)
        .eq('id', productId);

    if (error) {
        console.error('Error updating SEO:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/products');
    return { success: true };
}

/**
 * Update product status
 */
export async function updateProductStatus(
    productId: string,
    status: 'draft' | 'published' | 'archived'
) {
    const { error } = await supabaseUntyped
        .from('products')
        .update({
            status,
            updated_at: new Date().toISOString(),
        })
        .eq('id', productId);

    if (error) {
        console.error('Error updating status:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/products');
    revalidatePath('/shop');
    return { success: true };
}

/**
 * Adjust product stock (for products without variants)
 */
export async function adjustProductStock(
    productId: string,
    adjustment: number,
    reason: string,
    type: 'restock' | 'sale' | 'damage' | 'correction' | 'return'
) {
    // Get current inventory
    const { data: product } = await supabaseUntyped
        .from('products')
        .select('inventory_count')
        .eq('id', productId)
        .single();

    if (!product) {
        return { success: false, error: 'Product not found' };
    }

    const newInventory = product.inventory_count + adjustment;

    if (newInventory < 0) {
        return { success: false, error: 'Insufficient inventory' };
    }

    // Update inventory
    const { error: updateError } = await supabaseUntyped
        .from('products')
        .update({
            inventory_count: newInventory,
            updated_at: new Date().toISOString(),
        })
        .eq('id', productId);

    if (updateError) {
        console.error('Error updating inventory:', updateError);
        return { success: false, error: updateError.message };
    }

    // Log adjustment
    const { error: logError } = await supabaseUntyped
        .from('product_stock_adjustments')
        .insert({
            product_id: productId,
            adjustment_type: type,
            quantity_change: adjustment,
            reason,
            previous_quantity: product.inventory_count,
            new_quantity: newInventory,
        });

    if (logError) {
        console.error('Error logging adjustment:', logError);
    }

    revalidatePath('/admin/products');
    return { success: true, newInventory };
}

