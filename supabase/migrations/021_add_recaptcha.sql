-- Add reCAPTCHA settings to cms_advanced_settings table
ALTER TABLE cms_advanced_settings 
ADD COLUMN IF NOT EXISTS recaptcha_site_key TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS recaptcha_secret_key TEXT DEFAULT '';
