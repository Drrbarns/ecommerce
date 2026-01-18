
import { supabase } from "@/lib/supabase";
import { Product, Collection } from "@/types";

export async function getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .neq('status', 'archived')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }

    return data as Product[];
}

export async function getFeaturedProducts(): Promise<Product[]> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .neq('status', 'archived')
        .order('created_at', { ascending: false })
        .limit(4);

    if (error) {
        console.error('Error fetching featured products:', error);
        return [];
    }

    return data as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .neq('status', 'archived')
        .single();

    if (error) {
        console.error(`Error fetching product ${slug}:`, error);
        return null;
    }

    return data as Product;
}

export async function getCollections(): Promise<Collection[]> {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }

    // Map database fields to Collection interface
    return (data || []).map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description || '',
        image: cat.banner_image || cat.icon_url || '/placeholder-category.jpg', // Fallback image
        productCount: cat.products?.[0]?.count
    }));
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

    if (error) {
        // console.error(`Error fetching category ${slug}:`, error);
        return null;
    }

    return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description || '',
        image: data.banner_image || data.icon_url || '/placeholder-category.jpg',
    } as Collection;
}

export async function getProductsByCollection(slug: string): Promise<Product[]> {
    // Products have a 'category' field which typically stores the collection slug
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', slug)
        .neq('status', 'archived');

    if (error) {
        console.error('Error fetching products by collection:', error);
        return [];
    }

    return data as Product[];
}
