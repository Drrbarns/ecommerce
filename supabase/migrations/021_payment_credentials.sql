-- Migration 021: Add credentials column to payment_providers
-- This allows storing API keys in the database for easy configuration

-- Add credentials column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payment_providers' 
        AND column_name = 'credentials'
    ) THEN
        ALTER TABLE public.payment_providers 
        ADD COLUMN credentials JSONB DEFAULT '{}';
    END IF;
END $$;

-- Update comment
COMMENT ON COLUMN public.payment_providers.credentials IS 'Encrypted API credentials (api_user, api_pubkey, account_number, etc.)';

-- Update existing providers with empty credentials if null
UPDATE public.payment_providers 
SET credentials = '{}' 
WHERE credentials IS NULL;
