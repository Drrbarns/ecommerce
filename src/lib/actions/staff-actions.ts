"use server";

import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Validation schemas
const StaffMemberSchema = z.object({
    email: z.string().email('Valid email required'),
    firstName: z.string().min(1, 'First name required'),
    lastName: z.string().min(1, 'Last name required'),
    role: z.enum(['owner', 'admin', 'staff']),
    permissions: z.record(z.string(), z.boolean()).optional(),
    isActive: z.boolean().default(true),
});

export type StaffMemberInput = z.infer<typeof StaffMemberSchema>;

/**
 * Get all staff members
 */
export async function getStaffMembers() {
    const { data, error } = await supabase
        .from('staff_members')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching staff:', error);
        return { staff: [] };
    }

    return { staff: data || [] };
}

/**
 * Get staff member by ID
 */
export async function getStaffMemberById(id: string) {
    const { data, error } = await supabase
        .from('staff_members')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching staff member:', error);
        return null;
    }

    return data;
}

/**
 * Create staff member
 */
export async function createStaffMember(input: StaffMemberInput) {
    const validated = StaffMemberSchema.safeParse(input);
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message };
    }

    const data = validated.data;

    // Check if email already exists
    const { data: existing } = await supabase
        .from('staff_members')
        .select('id')
        .eq('email', data.email)
        .single();

    if (existing) {
        return { success: false, error: 'Email already in use' };
    }

    const { data: staff, error } = await supabase
        .from('staff_members')
        .insert({
            email: data.email,
            first_name: data.firstName,
            last_name: data.lastName,
            role: data.role,
            permissions: data.permissions || {},
            is_active: data.isActive,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating staff member:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/staff');
    return { success: true, staffId: staff.id };
}

/**
 * Update staff member
 */
export async function updateStaffMember(id: string, input: Partial<StaffMemberInput>) {
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (input.email !== undefined) updateData.email = input.email;
    if (input.firstName !== undefined) updateData.first_name = input.firstName;
    if (input.lastName !== undefined) updateData.last_name = input.lastName;
    if (input.role !== undefined) updateData.role = input.role;
    if (input.permissions !== undefined) updateData.permissions = input.permissions;
    if (input.isActive !== undefined) updateData.is_active = input.isActive;

    const { error } = await supabase
        .from('staff_members')
        .update(updateData)
        .eq('id', id);

    if (error) {
        console.error('Error updating staff member:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/staff');
    return { success: true };
}

/**
 * Delete staff member
 */
export async function deleteStaffMember(id: string) {
    const { error } = await supabase
        .from('staff_members')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting staff member:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/staff');
    return { success: true };
}

/**
 * Update staff permissions
 */
export async function updateStaffPermissions(id: string, permissions: Record<string, boolean>) {
    const { error } = await supabase
        .from('staff_members')
        .update({
            permissions,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id);

    if (error) {
        console.error('Error updating permissions:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/staff');
    return { success: true };
}

/**
 * Get staff activity from audit log
 */
export async function getStaffActivity(staffId?: string, limit = 50) {
    let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (staffId) {
        query = query.eq('staff_id', staffId);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching staff activity:', error);
        return { activities: [] };
    }

    return { activities: data || [] };
}

/**
 * Update last login timestamp
 */
export async function updateLastLogin(staffId: string) {
    const { error } = await supabase
        .from('staff_members')
        .update({
            last_login: new Date().toISOString(),
        })
        .eq('id', staffId);

    if (error) {
        console.error('Error updating last login:', error);
    }
}
