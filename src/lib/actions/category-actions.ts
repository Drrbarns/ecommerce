"use server";

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    product_count?: number;
    parent_id?: string;
    sort_order?: number;
    is_active?: boolean;
}

/**
 * Get all categories with product count
 */
export async function getCategories() {
    const { data, error } = await supabase
        .from('categories')
        .select('*, products(count)')
        .order('name');

    if (error) {
        console.error('Error fetching categories:', error);
        return { categories: [] };
    }

    return {
        categories: (data || []).map(cat => ({
            ...cat,
            product_count: cat.products?.[0]?.count || 0,
        })),
    };
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: string) {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching category:', error);
        return null;
    }

    return data;
}

/**
 * Create category
 */
export async function createCategory(input: {
    name: string;
    slug: string;
    description?: string;
    iconUrl?: string;
    bannerImage?: string;
    featured?: boolean;
    isActive?: boolean;
    seoTitle?: string;
    seoDescription?: string;
}) {
    const { data, error } = await supabase
        .from('categories')
        .insert({
            name: input.name,
            slug: input.slug,
            description: input.description,
            icon_url: input.iconUrl,
            banner_image: input.bannerImage,
            featured: input.featured || false,
            is_active: input.isActive !== false,
            seo_title: input.seoTitle,
            seo_description: input.seoDescription,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating category:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/categories');
    return { success: true, categoryId: data.id };
}

/**
 * Update category
 */
export async function updateCategory(id: string, input: Partial<{
    name: string;
    slug: string;
    description: string;
    iconUrl: string;
    bannerImage: string;
    featured: boolean;
    isActive: boolean;
    seoTitle: string;
    seoDescription: string;
}>) {
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.slug !== undefined) updateData.slug = input.slug;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.iconUrl !== undefined) updateData.icon_url = input.iconUrl;
    if (input.bannerImage !== undefined) updateData.banner_image = input.bannerImage;
    if (input.featured !== undefined) updateData.featured = input.featured;
    if (input.isActive !== undefined) updateData.is_active = input.isActive;
    if (input.seoTitle !== undefined) updateData.seo_title = input.seoTitle;
    if (input.seoDescription !== undefined) updateData.seo_description = input.seoDescription;

    const { error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id);

    if (error) {
        console.error('Error updating category:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/categories');
    return { success: true };
}

/**
 * Delete category
 */
export async function deleteCategory(id: string) {
    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting category:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/categories');
    return { success: true };
}
