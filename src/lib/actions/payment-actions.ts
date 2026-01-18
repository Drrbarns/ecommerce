"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

// Use untyped client for payment tables that may have extra columns
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface PaymentProviderSettings {
    provider: string;
    display_name: string;
    is_enabled: boolean;
    is_primary: boolean;
    is_test_mode: boolean;
    supported_currencies: string[];
    credentials: Record<string, string>;
}

/**
 * Get all payment providers
 */
export async function getPaymentProviders() {
    const { data, error } = await supabase
        .from('payment_providers')
        .select('*')
        .order('priority', { ascending: true });

    if (error) {
        console.error('Error fetching payment providers:', error);
        return [];
    }

    return data || [];
}

/**
 * Get a single payment provider by name
 */
export async function getPaymentProvider(provider: string) {
    const { data, error } = await supabase
        .from('payment_providers')
        .select('*')
        .eq('provider', provider)
        .single();

    if (error) {
        console.error('Error fetching payment provider:', error);
        return null;
    }

    return data;
}

/**
 * Update payment provider credentials
 */
export async function updatePaymentProviderCredentials(
    provider: string,
    credentials: Record<string, string>
) {
    const { error } = await supabase
        .from('payment_providers')
        .update({
            credentials,
            updated_at: new Date().toISOString()
        })
        .eq('provider', provider);

    if (error) {
        console.error('Error updating credentials:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/payments');
    return { success: true };
}

/**
 * Toggle payment provider enabled status
 */
export async function togglePaymentProvider(provider: string, isEnabled: boolean) {
    const { error } = await supabase
        .from('payment_providers')
        .update({
            is_enabled: isEnabled,
            updated_at: new Date().toISOString()
        })
        .eq('provider', provider);

    if (error) {
        console.error('Error toggling provider:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/payments');
    return { success: true };
}

/**
 * Set a provider as primary
 */
export async function setPrimaryProvider(provider: string) {
    // First, unset all as primary
    await supabase
        .from('payment_providers')
        .update({ is_primary: false })
        .neq('provider', provider);

    // Then set the selected one as primary
    const { error } = await supabase
        .from('payment_providers')
        .update({
            is_primary: true,
            is_enabled: true, // Also enable it
            updated_at: new Date().toISOString()
        })
        .eq('provider', provider);

    if (error) {
        console.error('Error setting primary provider:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/payments');
    return { success: true };
}

/**
 * Toggle test mode for a provider
 */
export async function toggleTestMode(provider: string, isTestMode: boolean) {
    const { error } = await supabase
        .from('payment_providers')
        .update({
            is_test_mode: isTestMode,
            updated_at: new Date().toISOString()
        })
        .eq('provider', provider);

    if (error) {
        console.error('Error toggling test mode:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/payments');
    return { success: true };
}

/**
 * Initialize payment providers if they don't exist
 */
export async function initializePaymentProviders() {
    const defaultProviders = [
        {
            provider: 'moolre',
            display_name: 'Moolre (Mobile Money)',
            is_enabled: false,
            is_primary: false,
            is_test_mode: true,
            supported_currencies: ['GHS'],
            priority: 1,
            credentials: {
                api_user: '',
                api_pubkey: '',
                account_number: ''
            }
        },
        {
            provider: 'paystack',
            display_name: 'Paystack',
            is_enabled: false,
            is_primary: false,
            is_test_mode: true,
            supported_currencies: ['GHS', 'NGN', 'USD'],
            priority: 2,
            credentials: {
                public_key: '',
                secret_key: ''
            }
        },
        {
            provider: 'flutterwave',
            display_name: 'Flutterwave',
            is_enabled: false,
            is_primary: false,
            is_test_mode: true,
            supported_currencies: ['GHS', 'NGN', 'USD', 'KES'],
            priority: 3,
            credentials: {
                public_key: '',
                secret_key: ''
            }
        }
    ];

    for (const providerData of defaultProviders) {
        // Check if provider exists
        const { data: existing } = await supabase
            .from('payment_providers')
            .select('id')
            .eq('provider', providerData.provider)
            .single();

        if (!existing) {
            await supabase.from('payment_providers').insert(providerData);
        }
    }

    revalidatePath('/admin/payments');
    return { success: true };
}
