-- =============================================
-- CMS ADVANCED SETTINGS
-- Custom CSS, Scripts, Analytics, and More
-- =============================================

-- Drop if exists for clean install
DROP TABLE IF EXISTS cms_advanced_settings CASCADE;

-- Advanced settings table (single row for global settings)
CREATE TABLE cms_advanced_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Custom CSS & Scripts
    custom_css TEXT DEFAULT '',
    custom_head_scripts TEXT DEFAULT '', -- Scripts to inject in <head>
    custom_body_scripts TEXT DEFAULT '', -- Scripts to inject before </body>
    
    -- Analytics & Tracking
    google_analytics_id TEXT DEFAULT '',   -- GA4 Measurement ID (G-XXXXXXXX)
    google_tag_manager_id TEXT DEFAULT '', -- GTM Container ID (GTM-XXXXXXX)
    facebook_pixel_id TEXT DEFAULT '',
    tiktok_pixel_id TEXT DEFAULT '',
    hotjar_id TEXT DEFAULT '',
    
    -- SEO & Meta
    google_site_verification TEXT DEFAULT '',
    bing_site_verification TEXT DEFAULT '',
    default_robots_meta TEXT DEFAULT 'index, follow',
    
    -- Maintenance Mode
    maintenance_mode BOOLEAN DEFAULT FALSE,
    maintenance_message TEXT DEFAULT 'We are currently performing scheduled maintenance. Please check back soon.',
    maintenance_allowed_ips TEXT[] DEFAULT '{}', -- IPs that can bypass maintenance
    
    -- Cookie Consent
    cookie_consent_enabled BOOLEAN DEFAULT TRUE,
    cookie_consent_message TEXT DEFAULT 'We use cookies to enhance your browsing experience. By continuing to use our site, you agree to our use of cookies.',
    cookie_policy_url TEXT DEFAULT '/privacy',
    
    -- Social Proof & Trust
    show_stock_warning BOOLEAN DEFAULT TRUE,
    low_stock_threshold INTEGER DEFAULT 5,
    show_sold_count BOOLEAN DEFAULT FALSE,
    
    -- Performance
    lazy_load_images BOOLEAN DEFAULT TRUE,
    enable_image_optimization BOOLEAN DEFAULT TRUE,
    
    -- Chat & Support
    tawk_to_id TEXT DEFAULT '',
    crisp_website_id TEXT DEFAULT '',
    intercom_app_id TEXT DEFAULT '',
    whatsapp_number TEXT DEFAULT '',
    whatsapp_message TEXT DEFAULT 'Hello! I have a question about your products.',
    
    -- Third-party Integrations
    mailchimp_api_key TEXT DEFAULT '',
    mailchimp_list_id TEXT DEFAULT '',
    sendgrid_api_key TEXT DEFAULT '',
    
    -- Timestamps
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE cms_advanced_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Advanced settings viewable by service role" ON cms_advanced_settings;
DROP POLICY IF EXISTS "Advanced settings editable by service role" ON cms_advanced_settings;

CREATE POLICY "Advanced settings viewable by service role" ON cms_advanced_settings 
    FOR SELECT USING (TRUE);
CREATE POLICY "Advanced settings editable by service role" ON cms_advanced_settings 
    FOR ALL USING (TRUE);

-- Insert default settings row
INSERT INTO cms_advanced_settings (id) 
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

SELECT 'CMS Advanced Settings table created successfully!' as status;
