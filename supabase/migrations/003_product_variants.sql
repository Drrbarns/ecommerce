-- Migration 003: Product Variants and Images
-- Proper variant/SKU support for products

-- PRODUCT VARIANTS (size/color combinations with separate inventory)
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sku TEXT UNIQUE,
    name TEXT, -- e.g., "Large / Black"
    price_minor INTEGER NOT NULL, -- Price in minor units (pesewas)
    compare_at_price_minor INTEGER,
    inventory_count INTEGER DEFAULT 0,
    option_1_name TEXT, -- e.g., "Size"
    option_1_value TEXT, -- e.g., "Large"
    option_2_name TEXT, -- e.g., "Color"
    option_2_value TEXT, -- e.g., "Black"
    option_3_name TEXT,
    option_3_value TEXT,
    is_active BOOLEAN DEFAULT true,
    weight_grams INTEGER,
    barcode TEXT
);

-- PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    url TEXT NOT NULL,
    alt_text TEXT,
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false
);

-- Add price_minor to products for minor unit support
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'price_minor') THEN
        ALTER TABLE public.products ADD COLUMN price_minor INTEGER;
        -- Migrate existing prices to minor units (multiply by 100)
        UPDATE public.products SET price_minor = CAST(price * 100 AS INTEGER) WHERE price_minor IS NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'compare_at_price_minor') THEN
        ALTER TABLE public.products ADD COLUMN compare_at_price_minor INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'is_featured') THEN
        ALTER TABLE public.products ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'is_active') THEN
        ALTER TABLE public.products ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'updated_at') THEN
        ALTER TABLE public.products ADD COLUMN updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
    END IF;
END $$;

-- RLS for variants
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Variants are viewable by everyone" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Variants are editable by service role" ON public.product_variants FOR ALL USING (auth.role() = 'service_role');

-- RLS for images
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Images are viewable by everyone" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Images are editable by service role" ON public.product_images FOR ALL USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON public.product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_images_product ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active) WHERE is_active = true;
