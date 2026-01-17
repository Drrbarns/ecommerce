
import { supabase } from "@/lib/supabase";
import { Product, Collection } from "@/types";

export async function getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
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
        .single();

    if (error) {
        console.error(`Error fetching product ${slug}:`, error);
        return null;
    }

    return data as Product;
}

export async function getCollections(): Promise<Collection[]> {
    const { data, error } = await supabase
        .from('collections')
        .select('*');

    if (error) {
        console.error('Error fetching collections:', error);
        return [];
    }

    return data as Collection[];
}
