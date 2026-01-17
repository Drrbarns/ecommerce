-- =============================================
-- CMS MODULE - Content Management System
-- Manage hero, homepage sections, footer, and theme colors
-- =============================================

-- Add CMS to store_modules if not exists
INSERT INTO public.store_modules (module_key, display_name, description, is_enabled, category, sort_order)
VALUES ('cms', 'CMS & Theme', 'Content management system for hero, homepage sections, footer, and theme colors', true, 'core', 0)
ON CONFLICT (module_key) DO NOTHING;

-- Drop existing tables if they exist
DROP INDEX IF EXISTS idx_cms_content_key;
DROP TABLE IF EXISTS cms_content CASCADE;
DROP TABLE IF EXISTS cms_theme CASCADE;

-- 1. CMS CONTENT TABLE (for all editable content blocks)
CREATE TABLE cms_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key TEXT NOT NULL UNIQUE, -- e.g., 'hero', 'footer', 'about_section'
    section_name TEXT NOT NULL,       -- Display name for admin
    content JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cms_content_key ON cms_content(section_key);

-- 2. CMS THEME TABLE (for color customization)
CREATE TABLE cms_theme (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    theme_name TEXT NOT NULL DEFAULT 'default',
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Primary Colors
    primary_color TEXT DEFAULT '#0F766E',        -- Main brand color
    primary_foreground TEXT DEFAULT '#FFFFFF',
    
    -- Secondary Colors
    secondary_color TEXT DEFAULT '#F5F5F5',
    secondary_foreground TEXT DEFAULT '#1A1A1A',
    
    -- Accent Colors
    accent_color TEXT DEFAULT '#F59E0B',
    accent_foreground TEXT DEFAULT '#FFFFFF',
    
    -- Background Colors
    background_color TEXT DEFAULT '#FFFFFF',
    foreground_color TEXT DEFAULT '#1A1A1A',
    
    -- Card Colors
    card_color TEXT DEFAULT '#FFFFFF',
    card_foreground TEXT DEFAULT '#1A1A1A',
    
    -- Muted Colors
    muted_color TEXT DEFAULT '#F5F5F5',
    muted_foreground TEXT DEFAULT '#6B7280',
    
    -- Border & Ring
    border_color TEXT DEFAULT '#E5E7EB',
    ring_color TEXT DEFAULT '#0F766E',
    
    -- Destructive
    destructive_color TEXT DEFAULT '#EF4444',
    destructive_foreground TEXT DEFAULT '#FFFFFF',
    
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_theme ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "CMS content readable by all" ON cms_content FOR SELECT USING (TRUE);
CREATE POLICY "CMS content editable by service role" ON cms_content FOR ALL USING (TRUE);

CREATE POLICY "CMS theme readable by all" ON cms_theme FOR SELECT USING (TRUE);
CREATE POLICY "CMS theme editable by service role" ON cms_theme FOR ALL USING (TRUE);

-- Insert default content blocks
INSERT INTO cms_content (section_key, section_name, content) VALUES
(
    'hero',
    'Hero Section',
    '{
        "title": "Discover Premium Quality Products",
        "subtitle": "Shop the latest collection of handpicked items, crafted with care and delivered with love to your doorstep.",
        "badge": "New Collection",
        "primaryButtonText": "Shop Now",
        "primaryButtonLink": "/shop",
        "secondaryButtonText": "Learn More",
        "secondaryButtonLink": "/about",
        "backgroundImage": "",
        "overlayOpacity": 0.5
    }'::jsonb
),
(
    'features',
    'Features Section',
    '{
        "title": "Why Shop With Us",
        "subtitle": "We provide the best shopping experience",
        "features": [
            {
                "icon": "truck",
                "title": "Fast Delivery",
                "description": "Free delivery on orders over ₵500"
            },
            {
                "icon": "shield",
                "title": "Secure Payment",
                "description": "100% secure payment methods"
            },
            {
                "icon": "refresh",
                "title": "Easy Returns",
                "description": "30-day return policy"
            },
            {
                "icon": "headphones",
                "title": "24/7 Support",
                "description": "Dedicated customer support"
            }
        ]
    }'::jsonb
),
(
    'promo_banner',
    'Promotional Banner',
    '{
        "enabled": true,
        "text": "🎉 Free shipping on all orders over ₵500!",
        "link": "/shop",
        "backgroundColor": "#0F766E",
        "textColor": "#FFFFFF"
    }'::jsonb
),
(
    'newsletter_section',
    'Newsletter Section',
    '{
        "title": "Stay Updated",
        "subtitle": "Subscribe to our newsletter and get 10% off your first order.",
        "buttonText": "Subscribe",
        "placeholder": "Enter your email"
    }'::jsonb
),
(
    'footer',
    'Footer',
    '{
        "companyName": "Moolre Commerce",
        "tagline": "Your trusted online shopping destination in Ghana.",
        "copyrightText": "© 2024 Moolre Commerce. All rights reserved.",
        "socialLinks": {
            "facebook": "",
            "instagram": "",
            "twitter": "",
            "tiktok": "",
            "whatsapp": ""
        },
        "quickLinks": [
            {"label": "Shop", "href": "/shop"},
            {"label": "About Us", "href": "/about"},
            {"label": "Contact", "href": "/contact"},
            {"label": "FAQ", "href": "/faq"}
        ],
        "customerService": [
            {"label": "Shipping Info", "href": "/shipping"},
            {"label": "Returns & Refunds", "href": "/returns"},
            {"label": "Privacy Policy", "href": "/privacy"},
            {"label": "Terms of Service", "href": "/terms"}
        ],
        "contactInfo": {
            "email": "hello@moolre.com",
            "phone": "+233 20 000 0000",
            "address": "Accra, Ghana"
        }
    }'::jsonb
),
(
    'about_section',
    'About Section (Homepage)',
    '{
        "title": "About Our Store",
        "content": "We are passionate about bringing you the best products at the best prices. Our curated selection features items from trusted suppliers, ensuring quality you can count on.",
        "image": "",
        "buttonText": "Learn More",
        "buttonLink": "/about"
    }'::jsonb
),
(
    'trust_badges',
    'Trust Badges',
    '{
        "enabled": true,
        "badges": [
            {"icon": "verified", "text": "Verified Seller"},
            {"icon": "lock", "text": "Secure Checkout"},
            {"icon": "award", "text": "Quality Guaranteed"}
        ]
    }'::jsonb
);

-- Insert default theme
INSERT INTO cms_theme (theme_name, is_active) VALUES ('default', true);

SELECT 'CMS Module tables created successfully!' as status;
