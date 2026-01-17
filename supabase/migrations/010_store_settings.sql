-- Migration 010: Store Settings and CMS

-- STORE SETTINGS (single vendor)
CREATE TABLE IF NOT EXISTS public.store_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Basic Info
    name TEXT NOT NULL DEFAULT 'Moolre',
    tagline TEXT,
    description TEXT,
    logo TEXT,
    favicon TEXT,
    
    -- Contact
    email TEXT,
    phone TEXT,
    whatsapp TEXT,
    address JSONB, -- { line1, line2, city, region, country, postal }
    
    -- Social Media
    social_links JSONB DEFAULT '{}', -- { facebook, instagram, twitter, tiktok }
    
    -- SEO Defaults
    seo_title TEXT,
    seo_description TEXT,
    seo_image TEXT,
    
    -- Currency & Region
    currency TEXT DEFAULT 'GHS',
    currency_symbol TEXT DEFAULT '₵',
    country TEXT DEFAULT 'GH',
    timezone TEXT DEFAULT 'Africa/Accra',
    
    -- Checkout Settings
    guest_checkout_enabled BOOLEAN DEFAULT true,
    tax_rate INTEGER DEFAULT 0, -- Percentage * 100 (e.g., 1250 = 12.5%)
    tax_included BOOLEAN DEFAULT true,
    
    -- Shipping
    default_shipping_zone_id UUID REFERENCES public.shipping_zones(id),
    
    -- Analytics
    google_analytics_id TEXT,
    facebook_pixel_id TEXT,
    
    -- Notifications
    order_notification_email TEXT,
    low_stock_threshold INTEGER DEFAULT 5
);

-- PAGES (policies, about, etc.)
CREATE TABLE IF NOT EXISTS public.pages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content TEXT, -- Markdown or HTML
    seo_title TEXT,
    seo_description TEXT,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ
);

-- HOMEPAGE SECTIONS (for featured content)
CREATE TABLE IF NOT EXISTS public.homepage_sections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    section_type TEXT NOT NULL, -- 'hero', 'featured_products', 'featured_collections', 'banner'
    title TEXT,
    subtitle TEXT,
    cta_text TEXT,
    cta_link TEXT,
    image TEXT,
    content JSONB DEFAULT '{}', -- Flexible content
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0
);

-- NEWSLETTER SUBSCRIBERS
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    email TEXT NOT NULL UNIQUE,
    is_subscribed BOOLEAN DEFAULT true,
    source TEXT DEFAULT 'website',
    unsubscribed_at TIMESTAMPTZ
);

-- REVIEWS (optional but recommended)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    customer_name TEXT,
    customer_email TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT,
    is_verified_purchase BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false
);

-- RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Store settings: read by everyone, write by service role
CREATE POLICY "Store settings readable" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Store settings editable by service role" ON public.store_settings FOR ALL USING (auth.role() = 'service_role');

-- Pages: published readable by everyone
CREATE POLICY "Published pages readable" ON public.pages FOR SELECT USING (is_published = true OR auth.role() = 'service_role');
CREATE POLICY "Pages editable by service role" ON public.pages FOR ALL USING (auth.role() = 'service_role');

-- Homepage sections
CREATE POLICY "Homepage sections readable" ON public.homepage_sections FOR SELECT USING (true);
CREATE POLICY "Homepage sections editable by service role" ON public.homepage_sections FOR ALL USING (auth.role() = 'service_role');

-- Newsletter: insert by anyone, else service role
CREATE POLICY "Newsletter subscribe" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Newsletter manage by service role" ON public.newsletter_subscribers FOR ALL USING (auth.role() = 'service_role');

-- Reviews: approved readable, own writable
CREATE POLICY "Approved reviews readable" ON public.reviews FOR SELECT USING (is_approved = true OR auth.role() = 'service_role');
CREATE POLICY "Reviews insertable" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Reviews editable by service role" ON public.reviews FOR ALL USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pages_slug ON public.pages(slug);
CREATE INDEX IF NOT EXISTS idx_homepage_sort ON public.homepage_sections(sort_order);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON public.reviews(is_approved, product_id);

-- Insert default store settings
INSERT INTO public.store_settings (name, email, currency, currency_symbol, country)
VALUES ('Moolre', 'hello@moolre.com', 'GHS', '₵', 'GH')
ON CONFLICT DO NOTHING;

-- Insert default pages
INSERT INTO public.pages (slug, title, content, is_published, published_at)
VALUES 
    ('privacy-policy', 'Privacy Policy', '# Privacy Policy\n\nYour privacy is important to us...', true, now()),
    ('terms-of-service', 'Terms of Service', '# Terms of Service\n\nBy using our service...', true, now()),
    ('refund-policy', 'Refund Policy', '# Refund Policy\n\nWe offer a 30-day return policy...', true, now()),
    ('shipping-policy', 'Shipping Policy', '# Shipping Policy\n\nWe ship nationwide in Ghana...', true, now())
ON CONFLICT (slug) DO NOTHING;
