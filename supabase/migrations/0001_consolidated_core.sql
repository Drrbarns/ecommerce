-- SOURCE: 002_categories_brands.sql

-- Migration 002: Categories and Brands
-- Run after initial schema.sql

-- CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image TEXT,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0
);

-- BRANDS TABLE
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    logo TEXT,
    website TEXT,
    is_active BOOLEAN DEFAULT true
);

-- Add category_id and brand_id to products (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'category_id') THEN
        ALTER TABLE public.products ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'brand_id') THEN
        ALTER TABLE public.products ADD COLUMN brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL;
    END IF;
END $$;

-- RLS for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Categories are editable by service role" ON public.categories FOR ALL USING (auth.role() = 'service_role');

-- RLS for brands
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Brands are viewable by everyone" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Brands are editable by service role" ON public.brands FOR ALL USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_brands_slug ON public.brands(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand_id);



-- SOURCE: 003_product_variants.sql

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
                   WHERE table_name = 'products' AND column_name = 'cost_minor') THEN
        ALTER TABLE public.products ADD COLUMN cost_minor INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'sku') THEN
        ALTER TABLE public.products ADD COLUMN sku TEXT UNIQUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'low_stock_threshold') THEN
        ALTER TABLE public.products ADD COLUMN low_stock_threshold INTEGER DEFAULT 5;
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



-- SOURCE: 004_customers_auth.sql

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



-- SOURCE: 005_carts_server.sql

-- Migration 005: Server-side Carts
-- Persistent carts for guest and authenticated users

-- CARTS TABLE
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    session_id TEXT, -- For guest carts
    currency TEXT DEFAULT 'GHS',
    subtotal_minor INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ DEFAULT (now() + interval '30 days'),
    CONSTRAINT cart_owner CHECK (customer_id IS NOT NULL OR session_id IS NOT NULL)
);

-- CART ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price_minor INTEGER NOT NULL, -- Snapshot of price at add time
    UNIQUE(cart_id, product_id, variant_id)
);

-- RLS for carts
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Customers can access own carts
CREATE POLICY "Customers can view own carts" ON public.carts
    FOR SELECT USING (auth.uid() = customer_id OR auth.role() = 'service_role');

CREATE POLICY "Customers can insert own carts" ON public.carts
    FOR INSERT WITH CHECK (auth.uid() = customer_id OR auth.role() = 'service_role' OR customer_id IS NULL);

CREATE POLICY "Customers can update own carts" ON public.carts
    FOR UPDATE USING (auth.uid() = customer_id OR auth.role() = 'service_role');

CREATE POLICY "Customers can delete own carts" ON public.carts
    FOR DELETE USING (auth.uid() = customer_id OR auth.role() = 'service_role');

-- Cart items follow cart access
CREATE POLICY "Cart items follow cart access" ON public.cart_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.carts 
            WHERE carts.id = cart_items.cart_id 
            AND (carts.customer_id = auth.uid() OR auth.role() = 'service_role')
        )
    );

-- Guest cart access via session (handled by service role)
CREATE POLICY "Service role full access to cart items" ON public.cart_items
    FOR ALL USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_carts_customer ON public.carts(customer_id);
CREATE INDEX IF NOT EXISTS idx_carts_session ON public.carts(session_id);
CREATE INDEX IF NOT EXISTS idx_carts_expires ON public.carts(expires_at);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON public.cart_items(product_id);

-- Function to update cart subtotal
CREATE OR REPLACE FUNCTION update_cart_subtotal()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.carts
    SET subtotal_minor = (
        SELECT COALESCE(SUM(price_minor * quantity), 0)
        FROM public.cart_items
        WHERE cart_id = COALESCE(NEW.cart_id, OLD.cart_id)
    ),
    updated_at = now()
    WHERE id = COALESCE(NEW.cart_id, OLD.cart_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for cart subtotal
DROP TRIGGER IF EXISTS trigger_update_cart_subtotal ON public.cart_items;
CREATE TRIGGER trigger_update_cart_subtotal
    AFTER INSERT OR UPDATE OR DELETE ON public.cart_items
    FOR EACH ROW EXECUTE FUNCTION update_cart_subtotal();



-- SOURCE: 006_shipping.sql

-- Migration 006: Shipping Zones and Rates

-- SHIPPING ZONES
CREATE TABLE IF NOT EXISTS public.shipping_zones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    countries TEXT[] DEFAULT ARRAY['GH'], -- ISO country codes
    regions TEXT[], -- State/region codes
    is_active BOOLEAN DEFAULT true
);

-- SHIPPING RATES
CREATE TABLE IF NOT EXISTS public.shipping_rates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    zone_id UUID NOT NULL REFERENCES public.shipping_zones(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., "Standard Shipping", "Express"
    description TEXT,
    price_minor INTEGER NOT NULL, -- Price in minor units
    min_order_minor INTEGER DEFAULT 0, -- Minimum order for this rate
    max_order_minor INTEGER, -- Maximum order (null = no limit)
    free_above_minor INTEGER, -- Free shipping above this amount
    estimated_days_min INTEGER,
    estimated_days_max INTEGER,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0
);

-- RLS
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shipping zones viewable by everyone" ON public.shipping_zones FOR SELECT USING (true);
CREATE POLICY "Shipping zones editable by service role" ON public.shipping_zones FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Shipping rates viewable by everyone" ON public.shipping_rates FOR SELECT USING (true);
CREATE POLICY "Shipping rates editable by service role" ON public.shipping_rates FOR ALL USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shipping_zones_countries ON public.shipping_zones USING GIN(countries);
CREATE INDEX IF NOT EXISTS idx_shipping_rates_zone ON public.shipping_rates(zone_id);

-- Insert default shipping zone for Ghana
INSERT INTO public.shipping_zones (name, countries, regions, is_active)
VALUES ('Ghana', ARRAY['GH'], NULL, true)
ON CONFLICT DO NOTHING;

-- Insert default shipping rates
DO $$
DECLARE
    zone_id UUID;
BEGIN
    SELECT id INTO zone_id FROM public.shipping_zones WHERE name = 'Ghana' LIMIT 1;
    IF zone_id IS NOT NULL THEN
        INSERT INTO public.shipping_rates (zone_id, name, description, price_minor, estimated_days_min, estimated_days_max, free_above_minor, sort_order)
        VALUES 
            (zone_id, 'Standard Shipping', 'Delivery within 3-5 business days', 2500, 3, 5, 50000, 1),
            (zone_id, 'Express Shipping', 'Delivery within 1-2 business days', 5000, 1, 2, NULL, 2)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;



-- SOURCE: 007_coupons.sql

-- Migration 007: Coupons and Discounts

-- COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value INTEGER NOT NULL, -- Percentage (0-100) or fixed amount in minor units
    min_order_minor INTEGER DEFAULT 0,
    max_discount_minor INTEGER, -- Cap for percentage discounts
    usage_limit INTEGER, -- Total uses allowed
    usage_count INTEGER DEFAULT 0,
    usage_limit_per_customer INTEGER DEFAULT 1,
    starts_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    applies_to TEXT DEFAULT 'all' CHECK (applies_to IN ('all', 'products', 'categories')),
    product_ids UUID[], -- If applies_to = 'products'
    category_ids UUID[], -- If applies_to = 'categories'
    first_order_only BOOLEAN DEFAULT false,
    free_shipping BOOLEAN DEFAULT false
);

-- COUPON USAGE TRACKING
CREATE TABLE IF NOT EXISTS public.coupon_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    customer_email TEXT, -- Fallback for guest checkout
    discount_minor INTEGER NOT NULL -- Actual discount applied
);

-- RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

-- Coupons readable by everyone (to validate at checkout)
CREATE POLICY "Coupons viewable by everyone" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "Coupons editable by service role" ON public.coupons FOR ALL USING (auth.role() = 'service_role');

-- Usage only accessible by service role
CREATE POLICY "Coupon usage by service role" ON public.coupon_usage FOR ALL USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons(is_active, starts_at, expires_at);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon ON public.coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_customer ON public.coupon_usage(customer_id);

-- Function to validate coupon
CREATE OR REPLACE FUNCTION validate_coupon(
    p_code TEXT,
    p_order_subtotal_minor INTEGER,
    p_customer_id UUID DEFAULT NULL,
    p_customer_email TEXT DEFAULT NULL
)
RETURNS TABLE (
    valid BOOLEAN,
    coupon_id UUID,
    discount_type TEXT,
    discount_value INTEGER,
    max_discount_minor INTEGER,
    free_shipping BOOLEAN,
    error_message TEXT
) AS $$
DECLARE
    v_coupon RECORD;
    v_customer_usage INTEGER;
BEGIN
    -- Find the coupon
    SELECT * INTO v_coupon FROM public.coupons
    WHERE code = UPPER(p_code) AND is_active = true
    LIMIT 1;
    
    IF v_coupon IS NULL THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::INTEGER, NULL::INTEGER, false, 'Invalid coupon code';
        RETURN;
    END IF;
    
    -- Check dates
    IF v_coupon.starts_at > now() THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::INTEGER, NULL::INTEGER, false, 'Coupon not yet active';
        RETURN;
    END IF;
    
    IF v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at < now() THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::INTEGER, NULL::INTEGER, false, 'Coupon has expired';
        RETURN;
    END IF;
    
    -- Check usage limit
    IF v_coupon.usage_limit IS NOT NULL AND v_coupon.usage_count >= v_coupon.usage_limit THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::INTEGER, NULL::INTEGER, false, 'Coupon usage limit reached';
        RETURN;
    END IF;
    
    -- Check minimum order
    IF p_order_subtotal_minor < v_coupon.min_order_minor THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::INTEGER, NULL::INTEGER, false, 
            format('Minimum order of ₵%.2f required', v_coupon.min_order_minor::DECIMAL / 100);
        RETURN;
    END IF;
    
    -- Check per-customer usage
    IF v_coupon.usage_limit_per_customer IS NOT NULL THEN
        SELECT COUNT(*) INTO v_customer_usage FROM public.coupon_usage
        WHERE coupon_id = v_coupon.id 
        AND (customer_id = p_customer_id OR (p_customer_email IS NOT NULL AND customer_email = p_customer_email));
        
        IF v_customer_usage >= v_coupon.usage_limit_per_customer THEN
            RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::INTEGER, NULL::INTEGER, false, 'You have already used this coupon';
            RETURN;
        END IF;
    END IF;
    
    -- Valid coupon
    RETURN QUERY SELECT true, v_coupon.id, v_coupon.discount_type, v_coupon.discount_value, 
        v_coupon.max_discount_minor, v_coupon.free_shipping, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;



-- SOURCE: 008_payments.sql

-- Migration 008: Payments Hub
-- Multi-gateway payment processing with audit trail

-- PAYMENT PROVIDERS (store config)
CREATE TABLE IF NOT EXISTS public.payment_providers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    provider TEXT NOT NULL UNIQUE CHECK (provider IN ('moolre', 'paystack', 'flutterwave', 'payaza')),
    display_name TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT false,
    is_primary BOOLEAN DEFAULT false,
    is_test_mode BOOLEAN DEFAULT true,
    supported_currencies TEXT[] DEFAULT ARRAY['GHS'],
    config JSONB DEFAULT '{}', -- Encrypted or env-based keys referenced here
    priority INTEGER DEFAULT 0 -- For fallback ordering
);

-- PAYMENT INTENTS (checkout sessions)
CREATE TABLE IF NOT EXISTS public.payment_intents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    provider TEXT NOT NULL,
    provider_reference TEXT, -- Paystack reference, Flutterwave tx_ref, etc.
    amount_minor INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'GHS',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded')),
    metadata JSONB DEFAULT '{}',
    client_secret TEXT, -- For client-side confirmation if needed
    redirect_url TEXT, -- Provider checkout URL
    callback_url TEXT,
    expires_at TIMESTAMPTZ DEFAULT (now() + interval '1 hour'),
    idempotency_key TEXT UNIQUE -- Prevent duplicate charges
);

-- PAYMENT EVENTS (webhook + verification audit log)
CREATE TABLE IF NOT EXISTS public.payment_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    payment_intent_id UUID REFERENCES public.payment_intents(id) ON DELETE SET NULL,
    provider TEXT NOT NULL,
    event_type TEXT NOT NULL, -- e.g., 'charge.success', 'webhook.received', 'verification.success'
    provider_event_id TEXT, -- Dedupe webhooks
    payload JSONB NOT NULL, -- Raw webhook/response data
    processed BOOLEAN DEFAULT false,
    error_message TEXT
);

-- PAYMENTS (successful charges, for accounting)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    payment_intent_id UUID NOT NULL REFERENCES public.payment_intents(id),
    order_id UUID NOT NULL REFERENCES public.orders(id),
    customer_id UUID REFERENCES public.customers(id),
    provider TEXT NOT NULL,
    provider_transaction_id TEXT,
    amount_minor INTEGER NOT NULL,
    fee_minor INTEGER DEFAULT 0, -- Provider fee
    net_minor INTEGER, -- Amount - fee
    currency TEXT NOT NULL DEFAULT 'GHS',
    status TEXT NOT NULL DEFAULT 'captured' CHECK (status IN ('captured', 'refunded', 'partially_refunded', 'disputed')),
    refunded_minor INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'
);

-- RLS
ALTER TABLE public.payment_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Payment providers readable by everyone (to show options), editable by service role
CREATE POLICY "Payment providers viewable" ON public.payment_providers FOR SELECT USING (true);
CREATE POLICY "Payment providers editable by service role" ON public.payment_providers FOR ALL USING (auth.role() = 'service_role');

-- Payment intents: customer can read own, service role all
CREATE POLICY "Payment intents customer read" ON public.payment_intents 
    FOR SELECT USING (customer_id = auth.uid() OR auth.role() = 'service_role');
CREATE POLICY "Payment intents service role" ON public.payment_intents 
    FOR ALL USING (auth.role() = 'service_role');

-- Events and payments: service role only
CREATE POLICY "Payment events service role" ON public.payment_events FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Payments service role" ON public.payments FOR ALL USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_intents_order ON public.payment_intents(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_provider_ref ON public.payment_intents(provider, provider_reference);
CREATE INDEX IF NOT EXISTS idx_payment_intents_idempotency ON public.payment_intents(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_payment_events_intent ON public.payment_events(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_provider_event ON public.payment_events(provider, provider_event_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);

-- Insert default providers
INSERT INTO public.payment_providers (provider, display_name, is_enabled, is_primary, priority)
VALUES 
    ('moolre', 'Moolre Pay', false, false, 1),
    ('paystack', 'Paystack', true, true, 2),
    ('flutterwave', 'Flutterwave', false, false, 3)
ON CONFLICT (provider) DO NOTHING;



-- SOURCE: 009_staff_audit.sql

-- Migration 009: Staff Members and Audit Logs

-- STAFF MEMBERS (admin users)
CREATE TABLE IF NOT EXISTS public.staff_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'admin', 'staff')),
    permissions JSONB DEFAULT '{}', -- Granular permissions
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    avatar TEXT
);

-- AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    staff_id UUID REFERENCES public.staff_members(id) ON DELETE SET NULL,
    staff_email TEXT, -- Denormalized for history
    action TEXT NOT NULL, -- e.g., 'product.create', 'order.update', 'settings.update'
    resource_type TEXT NOT NULL, -- e.g., 'product', 'order', 'customer'
    resource_id UUID,
    changes JSONB, -- { field: { old: x, new: y } }
    metadata JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT
);

-- RLS
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Staff can see themselves, admins/owners can see all
CREATE POLICY "Staff can view own profile" ON public.staff_members
    FOR SELECT USING (
        user_id = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM public.staff_members sm 
            WHERE sm.user_id = auth.uid() AND sm.role IN ('owner', 'admin')
        )
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Staff editable by admins" ON public.staff_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.staff_members sm 
            WHERE sm.user_id = auth.uid() AND sm.role IN ('owner', 'admin')
        )
        OR auth.role() = 'service_role'
    );

-- Audit logs: admins can read, service role can write
CREATE POLICY "Audit logs readable by admins" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.staff_members sm 
            WHERE sm.user_id = auth.uid() AND sm.role IN ('owner', 'admin')
        )
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Audit logs writable by service role" ON public.audit_logs
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_staff_user ON public.staff_members(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_email ON public.staff_members(email);
CREATE INDEX IF NOT EXISTS idx_audit_staff ON public.audit_logs(staff_id);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON public.audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);

-- Function to log audit
CREATE OR REPLACE FUNCTION log_audit(
    p_staff_email TEXT,
    p_action TEXT,
    p_resource_type TEXT,
    p_resource_id UUID DEFAULT NULL,
    p_changes JSONB DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_staff_id UUID;
    v_log_id UUID;
BEGIN
    SELECT id INTO v_staff_id FROM public.staff_members WHERE email = p_staff_email LIMIT 1;
    
    INSERT INTO public.audit_logs (staff_id, staff_email, action, resource_type, resource_id, changes, metadata)
    VALUES (v_staff_id, p_staff_email, p_action, p_resource_type, p_resource_id, p_changes, p_metadata)
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;



-- SOURCE: 010_store_settings.sql

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



