"use server";

import { supabase } from "@/lib/supabase";
import { CartItem } from "@/store/cart-store";
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ShippingAddress {
    name: string;
    email: string;
    address: string;
    city: string;
    region: string;
    phone: string;
}

interface CreateOrderInput {
    items: CartItem[];
    shippingAddress: ShippingAddress;
    total: number;
}

export async function createOrder(input: CreateOrderInput) {
    const { items, shippingAddress, total } = input;

    // Create the order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            user_email: shippingAddress.email,
            status: 'pending',
            total: total,
            shipping_address: shippingAddress,
        })
        .select()
        .single();

    if (orderError) {
        console.error('Error creating order:', orderError);
        return { success: false, error: orderError.message };
    }

    // Create order items
    const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price,
        selected_variant: {
            size: item.selectedSize,
            color: item.selectedColor,
        },
    }));

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

    if (itemsError) {
        console.error('Error creating order items:', itemsError);
        // Ideally, we'd want to rollback the order here
        return { success: false, error: itemsError.message };
    }

    return { success: true, orderId: order.id };
}

export async function updateOrderStatus(orderId: string, status: string) {
    const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

    if (error) {
        console.error('Error updating order status:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// ============================================
// ADMIN ORDER MANAGEMENT FUNCTIONS
// ============================================

/**
 * Get orders for admin with filters and pagination
 */
export async function getOrdersAdmin(options?: {
    status?: string;
    search?: string; // email or order ID
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
}) {
    let query = supabaseAdmin
        .from('orders')
        .select('*, customer:customers(email, first_name, last_name), items:order_items(count)', { count: 'exact' })
        .order('created_at', { ascending: false });

    if (options?.status) {
        query = query.eq('status', options.status);
    }

    if (options?.search) {
        query = query.or(`user_email.ilike.%${options.search}%,id.ilike.%${options.search}%`);
    }

    if (options?.dateFrom) {
        query = query.gte('created_at', options.dateFrom.toISOString());
    }

    if (options?.dateTo) {
        query = query.lte('created_at', options.dateTo.toISOString());
    }

    if (options?.limit) {
        query = query.limit(options.limit);
    }

    if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching orders:', error);
        return { orders: [], count: 0 };
    }

    return { orders: data || [], count: count || 0 };
}

/**
 * Get order by ID with all related data
 */
export async function getOrderById(id: string) {
    const { data, error } = await supabaseAdmin
        .from('orders')
        .select(`
      *,
      customer:customers(*),
      items:order_items(*, product:products(name, image)),
      timeline:order_timeline(*, staff:staff_members(first_name, last_name)),
      payment_intent:payment_intents(*)
    `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching order:', error);
        return null;
    }

    return data;
}

/**
 * Add note to order timeline
 */
export async function addOrderNote(orderId: string, note: string, staffEmail?: string) {
    const { error } = await supabaseAdmin
        .from('order_timeline')
        .insert({
            order_id: orderId,
            event_type: 'note_added',
            title: 'Note Added',
            description: note,
            metadata: { staff_email: staffEmail },
        });

    if (error) {
        console.error('Error adding order note:', error);
        return { success: false, error: error.message };
    }

    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
}

/**
 * Update order shipping tracking
 */
export async function updateOrderTracking(
    orderId: string,
    carrier: string,
    trackingNumber: string,
    trackingUrl?: string
) {
    // Update order
    const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({
            shipping_carrier: carrier,
            tracking_number: trackingNumber,
            tracking_url: trackingUrl,
            shipped_at: new Date().toISOString(),
            status: 'shipped',
        })
        .eq('id', orderId);

    if (updateError) {
        console.error('Error updating tracking:', updateError);
        return { success: false, error: updateError.message };
    }

    // Add timeline event
    await supabaseAdmin.from('order_timeline').insert({
        order_id: orderId,
        event_type: 'tracking_added',
        title: 'Shipping Tracking Added',
        description: `Carrier: ${carrier}, Tracking#: ${trackingNumber}`,
        metadata: { carrier, tracking_number: trackingNumber, tracking_url: trackingUrl },
    });

    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
}

/**
 * Process refund for order
 */
export async function processRefund(orderId: string, amountMinor: number, reason: string) {
    // Get current order
    const { data: order } = await supabaseAdmin
        .from('orders')
        .select('refunded_minor, total_minor')
        .eq('id', orderId)
        .single();

    if (!order) {
        return { success: false, error: 'Order not found' };
    }

    const totalRefunded = (order.refunded_minor || 0) + amountMinor;

    if (totalRefunded > order.total_minor) {
        return { success: false, error: 'Refund amount exceeds order total' };
    }

    // Update order
    const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({
            refunded_minor: totalRefunded,
            refund_reason: reason,
            refunded_at: new Date().toISOString(),
        })
        .eq('id', orderId);

    if (updateError) {
        console.error('Error processing refund:', updateError);
        return { success: false, error: updateError.message };
    }

    // Add timeline event
    await supabaseAdmin.from('order_timeline').insert({
        order_id: orderId,
        event_type: 'refund',
        title: 'Refund Processed',
        description: `Refunded ₵${(amountMinor / 100).toFixed(2)}. Reason: ${reason}`,
        metadata: { amount_minor: amountMinor, reason },
    });

    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true, totalRefunded };
}

/**
 * Update order tags
 */
export async function updateOrderTags(orderId: string, tags: string[]) {
    const { error } = await supabaseAdmin
        .from('orders')
        .update({ tags })
        .eq('id', orderId);

    if (error) {
        console.error('Error updating tags:', error);
        return { success: false, error: error.message };
    }

    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
}

/**
 * Update order status with timeline logging
 */
export async function updateOrderStatusAdmin(
    orderId: string,
    newStatus: string,
    staffEmail?: string
) {
    // Get current status
    const { data: order } = await supabaseAdmin
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();

    if (!order) {
        return { success: false, error: 'Order not found' };
    }

    const oldStatus = order.status;

    // Update status
    const updateData: Record<string, unknown> = { status: newStatus };

    if (newStatus === 'shipped') {
        updateData.shipped_at = new Date().toISOString();
    }

    if (newStatus === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
    }

    const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

    if (updateError) {
        console.error('Error updating status:', updateError);
        return { success: false, error: updateError.message };
    }

    // Add timeline event
    await supabaseAdmin.from('order_timeline').insert({
        order_id: orderId,
        event_type: 'status_change',
        title: 'Status Changed',
        description: `Status changed from ${oldStatus} to ${newStatus}`,
        metadata: { old_status: oldStatus, new_status: newStatus, staff_email: staffEmail },
    });

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/admin/orders');
    return { success: true };
}

