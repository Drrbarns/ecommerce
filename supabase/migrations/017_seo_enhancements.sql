-- Migration 017: SEO Enhancements
-- SEO metadata for categories, products, and pages

-- Category SEO fields
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS icon_url TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS banner_image TEXT;

-- Homepage sections meta
ALTER TABLE public.homepage_sections ADD COLUMN IF NOT EXISTS seo_keywords TEXT[];
ALTER TABLE public.homepage_sections ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE public.homepage_sections ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Product meta tags table (flexible key-value for custom meta)
CREATE TABLE IF NOT EXISTS public.product_meta_tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  meta_key TEXT NOT NULL,
  meta_value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(product_id, meta_key)
);

-- RLS for product meta
ALTER TABLE public.product_meta_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Product meta viewable by everyone" ON public.product_meta_tags 
  FOR SELECT USING (true);
CREATE POLICY "Product meta manageable by service role" ON public.product_meta_tags 
  FOR ALL USING (auth.role() = 'service_role');

-- Indexes for SEO queries
CREATE INDEX IF NOT EXISTS idx_product_meta_product ON public.product_meta_tags(product_id);
CREATE INDEX IF NOT EXISTS idx_product_meta_key ON public.product_meta_tags(meta_key);
CREATE INDEX IF NOT EXISTS idx_categories_featured ON public.categories(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_homepage_published ON public.homepage_sections(published_at) WHERE is_active = true;

-- Sitemap generation helper view
CREATE OR REPLACE VIEW public.sitemap_urls AS
SELECT 
  'product' as type,
  slug as url_slug,
  updated_at as last_modified,
  'weekly' as change_freq,
  0.8 as priority
FROM public.products
WHERE status = 'published' AND is_active = true

UNION ALL

SELECT 
  'category' as type,
  slug as url_slug,
  updated_at as last_modified,
  'weekly' as change_freq,
  0.7 as priority
FROM public.categories
WHERE is_active = true

UNION ALL

SELECT 
  'page' as type,
  slug as url_slug,
  updated_at as last_modified,
  'monthly' as change_freq,
  0.5 as priority
FROM public.pages
WHERE is_published = true;

-- Function to validate SEO fields
CREATE OR REPLACE FUNCTION validate_seo_length()
RETURNS TRIGGER AS $$
BEGIN
  -- Check SEO title length (optimal 50-60 chars)
  IF NEW.seo_title IS NOT NULL AND length(NEW.seo_title) > 70 THEN
    RAISE WARNING 'SEO title exceeds recommended length of 70 characters (current: %)', length(NEW.seo_title);
  END IF;
  
  -- Check SEO description length (optimal 150-160 chars)
  IF NEW.seo_description IS NOT NULL AND length(NEW.seo_description) > 160 THEN
    RAISE WARNING 'SEO description exceeds recommended length of 160 characters (current: %)', length(NEW.seo_description);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for SEO validation
DROP TRIGGER IF EXISTS trigger_validate_product_seo ON public.products;
CREATE TRIGGER trigger_validate_product_seo
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW
  WHEN (NEW.seo_title IS NOT NULL OR NEW.seo_description IS NOT NULL)
  EXECUTE FUNCTION validate_seo_length();

DROP TRIGGER IF EXISTS trigger_validate_category_seo ON public.categories;
CREATE TRIGGER trigger_validate_category_seo
  BEFORE INSERT OR UPDATE ON public.categories
  FOR EACH ROW
  WHEN (NEW.seo_title IS NOT NULL OR NEW.seo_description IS NOT NULL)
  EXECUTE FUNCTION validate_seo_length();
