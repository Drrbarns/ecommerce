"use server";

import { createClient } from "@supabase/supabase-js";

// Use untyped client/service role for fetching brands
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface Brand {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    is_active: boolean;
}

export async function getBrands() {
    const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name');

    if (error) {
        console.error('Error fetching brands:', error);
        return { brands: [] };
    }

    return { brands: data as Brand[] };
}
