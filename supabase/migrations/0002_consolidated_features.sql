-- SOURCE: 011_product_enhancements.sql

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



-- SOURCE: 012_order_enhancements.sql

-- Migration 012: Order Enhancements
-- Adds shipping tracking, refund tracking, order timeline, and tags

-- Add shipping tracking fields
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_carrier TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_url TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

-- Add refund tracking fields
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refunded_minor INTEGER DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refund_reason TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;

-- Order timeline events table
CREATE TABLE IF NOT EXISTS public.order_timeline (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'status_change', 'note_added', 'refund', 'tracking_added', 'payment', 'webhook')),
  title TEXT NOT NULL,
  description TEXT,
  staff_id UUID REFERENCES public.staff_members(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'
);

-- Tags for order organization
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- RLS for order timeline
ALTER TABLE public.order_timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Timeline viewable with order access" ON public.order_timeline
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_timeline.order_id 
      AND (orders.customer_id = auth.uid() OR auth.role() = 'service_role')
    )
  );
CREATE POLICY "Timeline manageable by service role" ON public.order_timeline
  FOR ALL USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_order_timeline_order ON public.order_timeline(order_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_filter ON public.orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_tracking ON public.orders(tracking_number) WHERE tracking_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_tags ON public.orders USING GIN(tags);

-- Function to auto-create timeline entry on order creation
CREATE OR REPLACE FUNCTION create_order_timeline_entry()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.order_timeline (order_id, event_type, title, description)
  VALUES (NEW.id, 'created', 'Order Created', format('Order #%s created', substring(NEW.id::text, 1, 8)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new orders
DROP TRIGGER IF EXISTS trigger_create_order_timeline ON public.orders;
CREATE TRIGGER trigger_create_order_timeline
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION create_order_timeline_entry();



-- SOURCE: 013_media_library.sql

-- Migration 013: Media Library
-- Centralized media upload management system

CREATE TABLE IF NOT EXISTS public.media_uploads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  uploaded_by UUID REFERENCES public.staff_members(id) ON DELETE SET NULL,
  filename TEXT NOT NULL, -- Storage path
  original_filename TEXT NOT NULL, -- User's original filename
  url TEXT NOT NULL, -- Full public URL
  thumbnail_url TEXT, -- Optional thumbnail for images
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL, -- Bytes
  width INTEGER, -- For images
  height INTEGER, -- For images
  alt_text TEXT,
  caption TEXT,
  tags TEXT[] DEFAULT '{}',
  folder TEXT DEFAULT 'general' -- Organizational folder
);

-- RLS for media uploads
ALTER TABLE public.media_uploads ENABLE ROW LEVEL SECURITY;

-- Everyone can view media
CREATE POLICY "Media viewable by everyone" ON public.media_uploads 
  FOR SELECT USING (true);

-- Only service role can manage media
CREATE POLICY "Media manageable by service role" ON public.media_uploads 
  FOR ALL USING (auth.role() = 'service_role');

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_media_folder ON public.media_uploads(folder);
CREATE INDEX IF NOT EXISTS idx_media_mime_type ON public.media_uploads(mime_type);
CREATE INDEX IF NOT EXISTS idx_media_tags ON public.media_uploads USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_media_created ON public.media_uploads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON public.media_uploads(uploaded_by);

-- Function to generate friendly filename
CREATE OR REPLACE FUNCTION generate_media_filename(original_name TEXT)
RETURNS TEXT AS $$
DECLARE
  extension TEXT;
  base_name TEXT;
  timestamp_str TEXT;
BEGIN
  -- Extract extension
  extension := substring(original_name from '\.([^\.]+)$');
  
  -- Generate timestamp-based name
  timestamp_str := to_char(now(), 'YYYYMMDD_HH24MISS');
  
  -- Generate random suffix
  base_name := substring(md5(random()::text), 1, 8);
  
  RETURN format('%s_%s.%s', timestamp_str, base_name, extension);
END;
$$ LANGUAGE plpgsql;



-- SOURCE: 014_reports_cache.sql

-- Migration 014: Reports & Analytics Cache
-- Materialized views for performance and analytics dashboard

-- Daily sales summary (materialized for performance)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.sales_daily AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as order_count,
  SUM(total_minor) as revenue_minor,
  AVG(total_minor) as avg_order_value_minor,
  COUNT(DISTINCT customer_id) FILTER (WHERE customer_id IS NOT NULL) as unique_customers,
  SUM(subtotal_minor) as subtotal_minor,
  SUM(shipping_minor) as shipping_minor,
  SUM(discount_minor) as discount_minor,
  SUM(tax_minor) as tax_minor
FROM public.orders
WHERE status IN ('paid', 'processing', 'shipped', 'delivered')
  AND created_at >= CURRENT_DATE - INTERVAL '365 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_daily_date ON public.sales_daily(date);

-- Top products by revenue (materialized for dashboard)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.top_products AS
SELECT 
  p.id,
  p.name,
  p.slug,
  p.image,
  p.price_minor,
  COUNT(DISTINCT oi.order_id) as order_count,
  SUM(oi.quantity) as units_sold,
  SUM(oi.price_minor * oi.quantity) as revenue_minor
FROM public.products p
JOIN public.order_items oi ON p.id = oi.product_id
JOIN public.orders o ON oi.order_id = o.id
WHERE o.status IN ('paid', 'processing', 'shipped', 'delivered')
  AND o.created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY p.id, p.name, p.slug, p.image, p.price_minor
ORDER BY revenue_minor DESC
LIMIT 100;

-- Payment success rate tracking
CREATE MATERIALIZED VIEW IF NOT EXISTS public.payment_health AS
SELECT 
  DATE(created_at) as date,
  provider,
  COUNT(*) as total_intents,
  COUNT(*) FILTER (WHERE status = 'succeeded') as succeeded_count,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_count,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE status = 'succeeded') / NULLIF(COUNT(*), 0),
    2
  ) as success_rate
FROM public.payment_intents
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at), provider
ORDER BY date DESC, provider;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_health_date_provider ON public.payment_health(date, provider);

-- Fulfillment status counts (refreshed frequently)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.fulfillment_summary AS
SELECT 
  COUNT(*) FILTER (WHERE status = 'paid') as unfulfilled,
  COUNT(*) FILTER (WHERE status = 'processing') as processing,
  COUNT(*) FILTER (WHERE status = 'shipped') as shipped,
  COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
  COUNT(*) FILTER (WHERE refunded_minor > 0) as refunded
FROM public.orders
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days';

-- Low stock items view
CREATE MATERIALIZED VIEW IF NOT EXISTS public.low_stock_items AS
SELECT 
  p.id as product_id,
  p.name as product_name,
  p.image,
  pv.id as variant_id,
  pv.name as variant_name,
  pv.sku,
  COALESCE(pv.inventory_count, p.inventory_count) as current_stock,
  5 as threshold -- TODO: Make configurable via store_settings
FROM public.products p
LEFT JOIN public.product_variants pv ON p.id = pv.product_id
WHERE p.is_active = true
  AND (
    (pv.id IS NOT NULL AND pv.inventory_count <= 5)
    OR (pv.id IS NULL AND p.inventory_count <= 5)
  )
ORDER BY COALESCE(pv.inventory_count, p.inventory_count) ASC;

-- Function to refresh all analytics materialized views
CREATE OR REPLACE FUNCTION refresh_analytics_cache()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.sales_daily;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.top_products;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.payment_health;
  REFRESH MATERIALIZED VIEW public.fulfillment_summary; -- No concurrent (no unique index)
  REFRESH MATERIALIZED VIEW public.low_stock_items;
  
  -- Log the refresh
  RAISE NOTICE 'Analytics cache refreshed at %', now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on refresh function
GRANT EXECUTE ON FUNCTION refresh_analytics_cache() TO service_role;



-- SOURCE: 015_returns_rma.sql

-- Migration 015: Returns & RMA
-- Return merchandise authorization system

CREATE TABLE IF NOT EXISTS public.return_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- References
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  
  -- Status workflow
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'received', 'refunded', 'cancelled')),
  
  -- Return details
  reason TEXT NOT NULL, -- Customer-provided reason
  items JSONB NOT NULL, -- [{product_id, variant_id, quantity, reason}]
  
  -- Refund details
  refund_method TEXT CHECK (refund_method IN ('original_payment', 'store_credit', 'exchange')),
  refund_amount_minor INTEGER,
  
  -- Notes
  customer_notes TEXT,
  staff_notes TEXT, -- Internal notes
  
  -- Approval tracking
  approved_by UUID REFERENCES public.staff_members(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejected_reason TEXT,
  
  -- Logistics
  return_tracking_number TEXT,
  received_at TIMESTAMPTZ,
  
  -- QC check
  inspection_notes TEXT,
  restocked_at TIMESTAMPTZ
);

-- RLS policies
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;

-- Customers can view their own return requests
CREATE POLICY "Customers can view own returns" ON public.return_requests 
  FOR SELECT USING (
    customer_id = auth.uid() 
    OR auth.role() = 'service_role'
  );

-- Customers can create return requests for their orders
CREATE POLICY "Customers can create returns" ON public.return_requests 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_id 
      AND orders.customer_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

-- Only service role can update/delete
CREATE POLICY "Service role manages returns" ON public.return_requests 
  FOR ALL USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_returns_order ON public.return_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_customer ON public.return_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_returns_status ON public.return_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_returns_created ON public.return_requests(created_at DESC);

-- Function to validate return request
CREATE OR REPLACE FUNCTION validate_return_request()
RETURNS TRIGGER AS $$
DECLARE
  order_record RECORD;
  days_since_order INTEGER;
BEGIN
  -- Get order details
  SELECT * INTO order_record FROM public.orders WHERE id = NEW.order_id;
  
  -- Calculate days since order
  days_since_order := EXTRACT(DAY FROM (now() - order_record.created_at));
  
  -- Check if order exists
  IF order_record IS NULL THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  
  -- Check if order is eligible for returns (paid/delivered)
  IF order_record.status NOT IN ('paid', 'shipped', 'delivered') THEN
    RAISE EXCEPTION 'Order status % is not eligible for returns', order_record.status;
  END IF;
  
  -- Check return window (30 days - make configurable later)
  IF days_since_order > 30 THEN
    RAISE EXCEPTION 'Return window has expired (% days since order)', days_since_order;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for return validation
DROP TRIGGER IF EXISTS trigger_validate_return ON public.return_requests;
CREATE TRIGGER trigger_validate_return
  BEFORE INSERT ON public.return_requests
  FOR EACH ROW
  EXECUTE FUNCTION validate_return_request();



-- SOURCE: 016_module_toggles.sql

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



-- SOURCE: 017_seo_enhancements.sql

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



-- SOURCE: 018_module_features.sql

-- =============================================
-- MODULE FEATURES TABLES (CLEAN INSTALL)
-- Blog, Reviews, Newsletter, Gift Cards, Loyalty, POS
-- =============================================

-- First, drop all indexes that might exist
DROP INDEX IF EXISTS idx_blog_posts_slug;
DROP INDEX IF EXISTS idx_blog_posts_status;
DROP INDEX IF EXISTS idx_reviews_product;
DROP INDEX IF EXISTS idx_reviews_status;
DROP INDEX IF EXISTS idx_newsletter_email;
DROP INDEX IF EXISTS idx_newsletter_active;
DROP INDEX IF EXISTS idx_gift_cards_code;
DROP INDEX IF EXISTS idx_gift_cards_status;
DROP INDEX IF EXISTS idx_loyalty_customer;
DROP INDEX IF EXISTS idx_loyalty_tx_customer;
DROP INDEX IF EXISTS idx_pos_sessions_staff;
DROP INDEX IF EXISTS idx_pos_sessions_status;

-- Drop existing tables if they exist (in correct order for foreign keys)
DROP TABLE IF EXISTS loyalty_transactions CASCADE;
DROP TABLE IF EXISTS customer_loyalty CASCADE;
DROP TABLE IF EXISTS pos_sessions CASCADE;
DROP TABLE IF EXISTS gift_cards CASCADE;
DROP TABLE IF EXISTS newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS product_reviews CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;

-- 1. BLOG POSTS
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image TEXT,
    author_email TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);

-- 2. PRODUCT REVIEWS
CREATE TABLE product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_product ON product_reviews(product_id);
CREATE INDEX idx_reviews_status ON product_reviews(status);

-- 3. NEWSLETTER SUBSCRIBERS
CREATE TABLE newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    source TEXT DEFAULT 'website',
    is_active BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_active ON newsletter_subscribers(is_active);

-- 4. GIFT CARDS
CREATE TABLE gift_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    initial_balance_minor INTEGER NOT NULL,
    current_balance_minor INTEGER NOT NULL,
    recipient_email TEXT,
    sender_name TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'depleted', 'expired', 'cancelled')),
    expires_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gift_cards_code ON gift_cards(code);
CREATE INDEX idx_gift_cards_status ON gift_cards(status);

-- 5. CUSTOMER LOYALTY
CREATE TABLE customer_loyalty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
    points_balance INTEGER DEFAULT 0,
    lifetime_points INTEGER DEFAULT 0,
    tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_loyalty_customer ON customer_loyalty(customer_id);

-- 6. LOYALTY TRANSACTIONS
CREATE TABLE loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    reason TEXT NOT NULL,
    balance_after INTEGER NOT NULL,
    order_id UUID REFERENCES orders(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_loyalty_tx_customer ON loyalty_transactions(customer_id);

-- 7. POS SESSIONS
CREATE TABLE pos_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    starting_cash_minor INTEGER DEFAULT 0,
    closing_cash_minor INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pos_sessions_staff ON pos_sessions(staff_email);
CREATE INDEX idx_pos_sessions_status ON pos_sessions(status);

-- Enable RLS on all tables
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_loyalty ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Service role full access to blog_posts" ON blog_posts FOR ALL USING (TRUE);
CREATE POLICY "Public read published blog posts" ON blog_posts FOR SELECT USING (status = 'published');

CREATE POLICY "Service role full access to product_reviews" ON product_reviews FOR ALL USING (TRUE);
CREATE POLICY "Public read approved reviews" ON product_reviews FOR SELECT USING (status = 'approved');

CREATE POLICY "Service role full access to newsletter" ON newsletter_subscribers FOR ALL USING (TRUE);
CREATE POLICY "Service role full access to gift_cards" ON gift_cards FOR ALL USING (TRUE);
CREATE POLICY "Service role full access to loyalty" ON customer_loyalty FOR ALL USING (TRUE);
CREATE POLICY "Service role full access to loyalty_tx" ON loyalty_transactions FOR ALL USING (TRUE);
CREATE POLICY "Service role full access to pos" ON pos_sessions FOR ALL USING (TRUE);

-- Function to get product rating summary
CREATE OR REPLACE FUNCTION get_product_rating(p_product_id UUID)
RETURNS TABLE(average_rating NUMERIC, review_count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROUND(AVG(rating)::NUMERIC, 1) as average_rating,
        COUNT(*) as review_count
    FROM product_reviews
    WHERE product_id = p_product_id
    AND status = 'approved';
END;
$$ LANGUAGE plpgsql;

-- Function to calculate loyalty points from order
CREATE OR REPLACE FUNCTION calculate_order_points(order_total_minor INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- 1 point per 1 GHS spent (100 minor units)
    RETURN FLOOR(order_total_minor / 100);
END;
$$ LANGUAGE plpgsql;

SELECT 'Module feature tables created successfully!' as status;



