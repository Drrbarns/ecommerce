"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getModules() {
    const { data, error } = await supabase
        .from('store_modules')
        .select('*')
        .order('display_name');

    if (error) {
        console.error('Error fetching modules:', error);
        return [];
    }

    return data || [];
}

export async function toggleModule(key: string, isEnabled: boolean) {
    const { error } = await supabase
        .from('store_modules')
        .update({ is_enabled: isEnabled })
        .eq('module_key', key);

    if (error) {
        console.error('Error toggling module:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/modules');
    return { success: true };
}
