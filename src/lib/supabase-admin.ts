import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

/**
 * Admin Supabase client with service role key
 * ONLY use in server-side code (Server Actions, API routes)
 * NEVER expose to client
 */

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not set - admin operations will fail');
}

export const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

/**
 * Check if we have admin capabilities
 */
export function hasAdminAccess(): boolean {
    return !!process.env.SUPABASE_SERVICE_ROLE_KEY;
}
