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
