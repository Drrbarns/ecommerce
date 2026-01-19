-- Fix missing columns on products table (Safe to run multiple times)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cost_minor INTEGER;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku TEXT UNIQUE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS compare_at_price_minor INTEGER;

-- Create 'products' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for storage.objects (products bucket)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public Read Products" ON storage.objects;
    CREATE POLICY "Public Read Products" ON storage.objects FOR SELECT USING ( bucket_id = 'products' );
    
    DROP POLICY IF EXISTS "Auth Full Access Products" ON storage.objects;
    CREATE POLICY "Auth Full Access Products" ON storage.objects FOR ALL 
    USING ( bucket_id = 'products' AND auth.role() IN ('authenticated', 'service_role') )
    WITH CHECK ( bucket_id = 'products' AND auth.role() IN ('authenticated', 'service_role') );
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;
