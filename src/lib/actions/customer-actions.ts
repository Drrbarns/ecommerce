"use server";

import { createClient } from '@supabase/supabase-js';

// Use untyped client for new tables not in the type definitions yet
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Get all customers
 */
export async function getCustomers(options?: {
    search?: string;
    limit?: number;
    offset?: number;
}) {
    let query = supabase
        .from('customers')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

    if (options?.search) {
        query = query.or(`email.ilike.%${options.search}%,first_name.ilike.%${options.search}%,last_name.ilike.%${options.search}%`);
    }

    if (options?.limit) {
        query = query.limit(options.limit);
    }

    if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching customers:', error);
        return { customers: [], count: 0 };
    }

    return { customers: data || [], count: count || 0 };
}

/**
 * Get customer by ID with order history
 */
export async function getCustomer(customerId: string) {
    const { data: customer, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

    if (error) {
        console.error('Error fetching customer:', error);
        return null;
    }

    // Get order history
    const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(10);

    return {
        ...customer,
        orders: orders || [],
    };
}

/**
 * Update customer notes
 */
export async function updateCustomerNotes(customerId: string, notes: string) {
    const { error } = await supabase
        .from('customers')
        .update({ notes, updated_at: new Date().toISOString() })
        .eq('id', customerId);

    if (error) {
        console.error('Error updating customer notes:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Add tag to customer
 */
export async function addCustomerTag(customerId: string, tag: string) {
    const { data: customer } = await supabase
        .from('customers')
        .select('tags')
        .eq('id', customerId)
        .single();

    const currentTags = (customer as { tags?: string[] } | null)?.tags || [];
    if (currentTags.includes(tag)) {
        return { success: true };
    }

    const { error } = await supabase
        .from('customers')
        .update({
            tags: [...currentTags, tag],
            updated_at: new Date().toISOString()
        })
        .eq('id', customerId);

    if (error) {
        console.error('Error adding customer tag:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Get newsletter subscribers
 */
export async function getNewsletterSubscribers(options?: {
    isSubscribed?: boolean;
    limit?: number;
    offset?: number;
}) {
    let query = supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

    if (options?.isSubscribed !== undefined) {
        query = query.eq('is_subscribed', options.isSubscribed);
    }

    if (options?.limit) {
        query = query.limit(options.limit);
    }

    if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching subscribers:', error);
        return { subscribers: [], count: 0 };
    }

    return { subscribers: data || [], count: count || 0 };
}

/**
 * Subscribe to newsletter (public action)
 */
export async function subscribeNewsletter(email: string, source: string = 'website') {
    const { error } = await supabase
        .from('newsletter_subscribers')
        .upsert({
            email: email.toLowerCase(),
            is_subscribed: true,
            source,
            unsubscribed_at: null,
        }, {
            onConflict: 'email',
        });

    if (error) {
        console.error('Error subscribing to newsletter:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Unsubscribe from newsletter
 */
export async function unsubscribeNewsletter(email: string) {
    const { error } = await supabase
        .from('newsletter_subscribers')
        .update({
            is_subscribed: false,
            unsubscribed_at: new Date().toISOString(),
        })
        .eq('email', email.toLowerCase());

    if (error) {
        console.error('Error unsubscribing from newsletter:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
