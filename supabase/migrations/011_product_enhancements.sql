-- Migration 011: Product Enhancements
-- Adds SEO fields, status workflow, and stock adjustment tracking

-- Add SEO fields to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS og_image TEXT;

-- Add status enum (draft, published, archived)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published' 
  CHECK (status IN ('draft', 'published', 'archived'));

-- Stock adjustments tracking
CREATE TABLE IF NOT EXISTS public.product_stock_adjustments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('restock', 'sale', 'damage', 'correction', 'return')),
  quantity_change INTEGER NOT NULL,
  reason TEXT,
  staff_id UUID REFERENCES public.staff_members(id) ON DELETE SET NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL
);

-- RLS for stock adjustments
ALTER TABLE public.product_stock_adjustments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Stock adjustments viewable by service role" ON public.product_stock_adjustments
  FOR SELECT USING (auth.role() = 'service_role');
CREATE POLICY "Stock adjustments manageable by service role" ON public.product_stock_adjustments
  FOR ALL USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status) WHERE status != 'archived';
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_product ON public.product_stock_adjustments(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_variant ON public.product_stock_adjustments(variant_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_created ON public.product_stock_adjustments(created_at DESC);
