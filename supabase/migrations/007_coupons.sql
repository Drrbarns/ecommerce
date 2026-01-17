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
