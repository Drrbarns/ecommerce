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
