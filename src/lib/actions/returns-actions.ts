"use server";

import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Validation schemas
const ReturnRequestSchema = z.object({
    orderId: z.string().uuid(),
    reason: z.string().min(10, 'Please provide a detailed reason'),
    items: z.array(z.object({
        productId: z.string().uuid(),
        variantId: z.string().uuid().optional(),
        quantity: z.number().int().positive(),
        reason: z.string(),
    })).min(1, 'At least one item required'),
    customerNotes: z.string().optional(),
});

export type ReturnRequestInput = z.infer<typeof ReturnRequestSchema>;

/**
 * Create return request (customer-facing)
 */
export async function createReturnRequest(input: ReturnRequestInput) {
    const validated = ReturnRequestSchema.safeParse(input);
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message };
    }

    const data = validated.data;

    // Get order to extract customer_id
    const { data: order } = await supabase
        .from('orders')
        .select('customer_id, user_email')
        .eq('id', data.orderId)
        .single();

    if (!order) {
        return { success: false, error: 'Order not found' };
    }

    const { data: returnRequest, error } = await supabase
        .from('return_requests')
        .insert({
            order_id: data.orderId,
            customer_id: order.customer_id,
            reason: data.reason,
            items: data.items,
            customer_notes: data.customerNotes,
            status: 'pending',
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating return request:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/orders');
    return { success: true, returnId: returnRequest.id };
}

/**
 * Get all return requests with filters
 */
export async function getReturnRequests(filters?: {
    status?: string;
    customerId?: string;
    orderId?: string;
    limit?: number;
    offset?: number;
}) {
    let query = supabase
        .from('return_requests')
        .select('*, order:orders(id, user_email), customer:customers(email, first_name, last_name)', { count: 'exact' })
        .order('created_at', { ascending: false });

    if (filters?.status) {
        query = query.eq('status', filters.status);
    }

    if (filters?.customerId) {
        query = query.eq('customer_id', filters.customerId);
    }

    if (filters?.orderId) {
        query = query.eq('order_id', filters.orderId);
    }

    if (filters?.limit) {
        query = query.limit(filters.limit);
    }

    if (filters?.offset) {
        query = query.range(filters?.offset || 0, (filters?.offset || 0) + (filters?.limit || 20) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching return requests:', error);
        return { returns: [], count: 0 };
    }

    return { returns: data || [], count: count || 0 };
}

/**
 * Get return request by ID
 */
export async function getReturnRequestById(id: string) {
    const { data, error } = await supabase
        .from('return_requests')
        .select('*, order:orders(*), customer:customers(*)')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching return request:', error);
        return null;
    }

    return data;
}

/**
 * Update return status (admin action)
 */
export async function updateReturnStatus(
    id: string,
    status: 'pending' | 'approved' | 'rejected' | 'received' | 'refunded' | 'cancelled',
    staffNotes?: string
) {
    const updateData: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
    };

    if (staffNotes) {
        updateData.staff_notes = staffNotes;
    }

    if (status === 'approved') {
        updateData.approved_at = new Date().toISOString();
        // TODO: Set approved_by to current staff_id when auth context is available
    }

    const { error } = await supabase
        .from('return_requests')
        .update(updateData)
        .eq('id', id);

    if (error) {
        console.error('Error updating return status:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/orders');
    return { success: true };
}

/**
 * Approve return and initiate refund
 */
export async function approveReturn(id: string, refundMethod: 'original_payment' | 'store_credit' | 'exchange') {
    // Get return request
    const { data: returnRequest } = await supabase
        .from('return_requests')
        .select('*, order:orders(*)')
        .eq('id', id)
        .single();

    if (!returnRequest) {
        return { success: false, error: 'Return request not found' };
    }

    if (returnRequest.status !== 'pending') {
        return { success: false, error: 'Return request already processed' };
    }

    // Calculate refund amount (simplified - just use order total)
    // In production, calculate based on returned items
    const refundAmount = returnRequest.order.total_minor;

    const { error } = await supabase
        .from('return_requests')
        .update({
            status: 'approved',
            refund_method: refundMethod,
            refund_amount_minor: refundAmount,
            approved_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('id', id);

    if (error) {
        console.error('Error approving return:', error);
        return { success: false, error: error.message };
    }

    // TODO: Trigger actual refund process via payment gateway

    revalidatePath('/admin/orders');
    return { success: true, refundAmount };
}

/**
 * Mark return as received and inspected
 */
export async function markReturnReceived(id: string, inspectionNotes?: string, shouldRestock = true) {
    const updateData: Record<string, unknown> = {
        status: 'received',
        received_at: new Date().toISOString(),
        inspection_notes: inspectionNotes,
        updated_at: new Date().toISOString(),
    };

    if (shouldRestock) {
        updateData.restocked_at = new Date().toISOString();
        // TODO: Automatically restock items via inventory adjustment
    }

    const { error } = await supabase
        .from('return_requests')
        .update(updateData)
        .eq('id', id);

    if (error) {
        console.error('Error marking return received:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/orders');
    return { success: true };
}

/**
 * Reject return request
 */
export async function rejectReturn(id: string, rejectedReason: string) {
    const { error } = await supabase
        .from('return_requests')
        .update({
            status: 'rejected',
            rejected_reason: rejectedReason,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id);

    if (error) {
        console.error('Error rejecting return:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/orders');
    return { success: true };
}
