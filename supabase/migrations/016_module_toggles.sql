-- Migration 016: Module Toggles
-- Feature flag system for optional platform modules

CREATE TABLE IF NOT EXISTS public.store_modules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Module identification
  module_key TEXT NOT NULL UNIQUE, -- e.g., 'reviews', 'newsletter', 'returns'
  display_name TEXT NOT NULL, -- Human-readable name
  description TEXT,
  
  -- Status
  is_enabled BOOLEAN DEFAULT false,
  requires_setup BOOLEAN DEFAULT false, -- Flag if module needs configuration
  
  -- Configuration
  config JSONB DEFAULT '{}', -- Module-specific settings
  
  -- Organization
  category TEXT CHECK (category IN ('core', 'sales', 'marketing', 'operations', 'integrations')),
  sort_order INTEGER DEFAULT 0,
  
  -- Access control
  min_required_role TEXT DEFAULT 'admin' CHECK (min_required_role IN ('staff', 'admin', 'owner'))
);

-- Insert default modules
INSERT INTO public.store_modules (module_key, display_name, description, is_enabled, category, sort_order) VALUES
  ('reviews', 'Product Reviews', 'Customer product ratings and reviews', true, 'sales', 1),
  ('newsletter', 'Newsletter Subscriptions', 'Email newsletter collection and management', true, 'marketing', 2),
  ('returns', 'Returns & RMA', 'Return merchandise authorization workflow', false, 'operations', 3),
  ('reports', 'Analytics & Reports', 'Advanced reporting and analytics dashboard', true, 'operations', 4),
  ('pos', 'Point of Sale', 'In-store POS system integration', false, 'sales', 5),
  ('blog', 'Blog & Content', 'Content marketing and blog posts', false, 'marketing', 6),
  ('loyalty', 'Loyalty Program', 'Customer rewards and points system', false, 'marketing', 7),
  ('wholesale', 'Wholesale Orders', 'B2B wholesale ordering portal', false, 'sales', 8),
  ('gift_cards', 'Gift Cards', 'Digital gift card sales and redemption', false, 'sales', 9),
  ('subscriptions', 'Recurring Orders', 'Subscription and recurring payment support', false, 'sales', 10)
ON CONFLICT (module_key) DO NOTHING;

-- RLS policies
ALTER TABLE public.store_modules ENABLE ROW LEVEL SECURITY;

-- Everyone can view module status (determines UI visibility)
CREATE POLICY "Modules viewable by everyone" ON public.store_modules 
  FOR SELECT USING (true);

-- Only service role can modify modules
CREATE POLICY "Modules editable by service role" ON public.store_modules 
  FOR ALL USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_modules_enabled ON public.store_modules(is_enabled) WHERE is_enabled = true;
CREATE INDEX IF NOT EXISTS idx_modules_category ON public.store_modules(category, sort_order);

-- Function to check if module is enabled
CREATE OR REPLACE FUNCTION is_module_enabled(p_module_key TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  enabled BOOLEAN;
BEGIN
  SELECT is_enabled INTO enabled 
  FROM public.store_modules 
  WHERE module_key = p_module_key;
  
  RETURN COALESCE(enabled, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get enabl ed modules
CREATE OR REPLACE FUNCTION get_enabled_modules()
RETURNS TABLE(module_key TEXT, display_name TEXT, category TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT sm.module_key, sm.display_name, sm.category
  FROM public.store_modules sm
  WHERE sm.is_enabled = true
  ORDER BY sm.sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
