-- Migration 009: Staff Members and Audit Logs

-- STAFF MEMBERS (admin users)
CREATE TABLE IF NOT EXISTS public.staff_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'admin', 'staff')),
    permissions JSONB DEFAULT '{}', -- Granular permissions
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    avatar TEXT
);

-- AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    staff_id UUID REFERENCES public.staff_members(id) ON DELETE SET NULL,
    staff_email TEXT, -- Denormalized for history
    action TEXT NOT NULL, -- e.g., 'product.create', 'order.update', 'settings.update'
    resource_type TEXT NOT NULL, -- e.g., 'product', 'order', 'customer'
    resource_id UUID,
    changes JSONB, -- { field: { old: x, new: y } }
    metadata JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT
);

-- RLS
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Staff can see themselves, admins/owners can see all
CREATE POLICY "Staff can view own profile" ON public.staff_members
    FOR SELECT USING (
        user_id = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM public.staff_members sm 
            WHERE sm.user_id = auth.uid() AND sm.role IN ('owner', 'admin')
        )
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Staff editable by admins" ON public.staff_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.staff_members sm 
            WHERE sm.user_id = auth.uid() AND sm.role IN ('owner', 'admin')
        )
        OR auth.role() = 'service_role'
    );

-- Audit logs: admins can read, service role can write
CREATE POLICY "Audit logs readable by admins" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.staff_members sm 
            WHERE sm.user_id = auth.uid() AND sm.role IN ('owner', 'admin')
        )
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Audit logs writable by service role" ON public.audit_logs
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_staff_user ON public.staff_members(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_email ON public.staff_members(email);
CREATE INDEX IF NOT EXISTS idx_audit_staff ON public.audit_logs(staff_id);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON public.audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);

-- Function to log audit
CREATE OR REPLACE FUNCTION log_audit(
    p_staff_email TEXT,
    p_action TEXT,
    p_resource_type TEXT,
    p_resource_id UUID DEFAULT NULL,
    p_changes JSONB DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_staff_id UUID;
    v_log_id UUID;
BEGIN
    SELECT id INTO v_staff_id FROM public.staff_members WHERE email = p_staff_email LIMIT 1;
    
    INSERT INTO public.audit_logs (staff_id, staff_email, action, resource_type, resource_id, changes, metadata)
    VALUES (v_staff_id, p_staff_email, p_action, p_resource_type, p_resource_id, p_changes, p_metadata)
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
