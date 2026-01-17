-- Migration 004: Customers and Auth
-- Customer profiles linked to Supabase Auth

-- CUSTOMERS TABLE (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    accepts_marketing BOOLEAN DEFAULT false,
    default_address JSONB,
    notes TEXT,
    tags TEXT[],
    total_spent_minor INTEGER DEFAULT 0, -- Minor units
    order_count INTEGER DEFAULT 0
);

-- Add customer_id to orders
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'customer_id') THEN
        ALTER TABLE public.orders ADD COLUMN customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;
    END IF;
    -- Add more order fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'subtotal_minor') THEN
        ALTER TABLE public.orders ADD COLUMN subtotal_minor INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'shipping_minor') THEN
        ALTER TABLE public.orders ADD COLUMN shipping_minor INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'discount_minor') THEN
        ALTER TABLE public.orders ADD COLUMN discount_minor INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'tax_minor') THEN
        ALTER TABLE public.orders ADD COLUMN tax_minor INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'total_minor') THEN
        ALTER TABLE public.orders ADD COLUMN total_minor INTEGER;
        -- Migrate existing totals
        UPDATE public.orders SET total_minor = CAST(total * 100 AS INTEGER) WHERE total_minor IS NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'currency') THEN
        ALTER TABLE public.orders ADD COLUMN currency TEXT DEFAULT 'GHS';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'notes') THEN
        ALTER TABLE public.orders ADD COLUMN notes TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'internal_notes') THEN
        ALTER TABLE public.orders ADD COLUMN internal_notes TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'coupon_code') THEN
        ALTER TABLE public.orders ADD COLUMN coupon_code TEXT;
    END IF;
END $$;

-- Update order_items for minor units
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'order_items' AND column_name = 'price_minor') THEN
        ALTER TABLE public.order_items ADD COLUMN price_minor INTEGER;
        UPDATE public.order_items SET price_minor = CAST(price_at_time * 100 AS INTEGER) WHERE price_minor IS NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'order_items' AND column_name = 'variant_id') THEN
        ALTER TABLE public.order_items ADD COLUMN variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'order_items' AND column_name = 'product_name') THEN
        ALTER TABLE public.order_items ADD COLUMN product_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'order_items' AND column_name = 'variant_name') THEN
        ALTER TABLE public.order_items ADD COLUMN variant_name TEXT;
    END IF;
END $$;

-- RLS for customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Customers can only see their own profile
CREATE POLICY "Customers can view own profile" ON public.customers
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Customers can update own profile" ON public.customers
    FOR UPDATE USING (auth.uid() = id);

-- Service role can do everything
CREATE POLICY "Service role full access to customers" ON public.customers
    FOR ALL USING (auth.role() = 'service_role');

-- Update orders RLS for customer access
DROP POLICY IF EXISTS "Users can view their own orders via email lookup" ON public.orders;
CREATE POLICY "Customers can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = customer_id OR auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
