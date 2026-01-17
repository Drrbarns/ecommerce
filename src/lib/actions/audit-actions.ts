"use server";

import { createClient } from '@supabase/supabase-js';

// Use untyped client for new tables not in the type definitions yet
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface AuditLogEntry {
    staffEmail: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    changes?: Record<string, { old: unknown; new: unknown }>;
    metadata?: Record<string, unknown>;
}

/**
 * Log an audit entry
 */
export async function logAudit(entry: AuditLogEntry) {
    const { error } = await supabase
        .from('audit_logs')
        .insert({
            staff_email: entry.staffEmail,
            action: entry.action,
            resource_type: entry.resourceType,
            resource_id: entry.resourceId,
            changes: entry.changes,
            metadata: entry.metadata || {},
        });

    if (error) {
        console.error('Failed to log audit entry:', error);
    }
}

/**
 * Get audit logs
 */
export async function getAuditLogs(options?: {
    action?: string;
    resourceType?: string;
    resourceId?: string;
    staffEmail?: string;
    limit?: number;
    offset?: number;
}) {
    let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

    if (options?.action) {
        query = query.eq('action', options.action);
    }

    if (options?.resourceType) {
        query = query.eq('resource_type', options.resourceType);
    }

    if (options?.resourceId) {
        query = query.eq('resource_id', options.resourceId);
    }

    if (options?.staffEmail) {
        query = query.eq('staff_email', options.staffEmail);
    }

    if (options?.limit) {
        query = query.limit(options.limit);
    }

    if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching audit logs:', error);
        return { logs: [], count: 0 };
    }

    return { logs: data || [], count: count || 0 };
}

/**
 * Get staff members
 */
export async function getStaffMembers() {
    const { data, error } = await supabase
        .from('staff_members')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching staff members:', error);
        return [];
    }

    return data || [];
}

/**
 * Create staff member
 */
export async function createStaffMember(input: {
    email: string;
    firstName?: string;
    lastName?: string;
    role: 'owner' | 'admin' | 'staff';
}) {
    const { data, error } = await supabase
        .from('staff_members')
        .insert({
            email: input.email.toLowerCase(),
            first_name: input.firstName,
            last_name: input.lastName,
            role: input.role,
            is_active: true,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating staff member:', error);
        return { success: false, error: error.message };
    }

    await logAudit({
        staffEmail: 'system',
        action: 'staff.create',
        resourceType: 'staff',
        resourceId: (data as { id: string }).id,
        changes: { email: { old: null, new: input.email } },
    });

    return { success: true, staffId: (data as { id: string }).id };
}

/**
 * Update staff member
 */
export async function updateStaffMember(staffId: string, input: {
    role?: 'owner' | 'admin' | 'staff';
    isActive?: boolean;
}) {
    const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
    };

    if (input.role !== undefined) updateData.role = input.role;
    if (input.isActive !== undefined) updateData.is_active = input.isActive;

    const { error } = await supabase
        .from('staff_members')
        .update(updateData)
        .eq('id', staffId);

    if (error) {
        console.error('Error updating staff member:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Delete staff member
 */
export async function deleteStaffMember(staffId: string) {
    const { error } = await supabase
        .from('staff_members')
        .delete()
        .eq('id', staffId);

    if (error) {
        console.error('Error deleting staff member:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
