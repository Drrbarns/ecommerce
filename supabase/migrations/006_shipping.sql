-- Migration 006: Shipping Zones and Rates

-- SHIPPING ZONES
CREATE TABLE IF NOT EXISTS public.shipping_zones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    countries TEXT[] DEFAULT ARRAY['GH'], -- ISO country codes
    regions TEXT[], -- State/region codes
    is_active BOOLEAN DEFAULT true
);

-- SHIPPING RATES
CREATE TABLE IF NOT EXISTS public.shipping_rates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    zone_id UUID NOT NULL REFERENCES public.shipping_zones(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., "Standard Shipping", "Express"
    description TEXT,
    price_minor INTEGER NOT NULL, -- Price in minor units
    min_order_minor INTEGER DEFAULT 0, -- Minimum order for this rate
    max_order_minor INTEGER, -- Maximum order (null = no limit)
    free_above_minor INTEGER, -- Free shipping above this amount
    estimated_days_min INTEGER,
    estimated_days_max INTEGER,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0
);

-- RLS
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shipping zones viewable by everyone" ON public.shipping_zones FOR SELECT USING (true);
CREATE POLICY "Shipping zones editable by service role" ON public.shipping_zones FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Shipping rates viewable by everyone" ON public.shipping_rates FOR SELECT USING (true);
CREATE POLICY "Shipping rates editable by service role" ON public.shipping_rates FOR ALL USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shipping_zones_countries ON public.shipping_zones USING GIN(countries);
CREATE INDEX IF NOT EXISTS idx_shipping_rates_zone ON public.shipping_rates(zone_id);

-- Insert default shipping zone for Ghana
INSERT INTO public.shipping_zones (name, countries, regions, is_active)
VALUES ('Ghana', ARRAY['GH'], NULL, true)
ON CONFLICT DO NOTHING;

-- Insert default shipping rates
DO $$
DECLARE
    zone_id UUID;
BEGIN
    SELECT id INTO zone_id FROM public.shipping_zones WHERE name = 'Ghana' LIMIT 1;
    IF zone_id IS NOT NULL THEN
        INSERT INTO public.shipping_rates (zone_id, name, description, price_minor, estimated_days_min, estimated_days_max, free_above_minor, sort_order)
        VALUES 
            (zone_id, 'Standard Shipping', 'Delivery within 3-5 business days', 2500, 3, 5, 50000, 1),
            (zone_id, 'Express Shipping', 'Delivery within 1-2 business days', 5000, 1, 2, NULL, 2)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
