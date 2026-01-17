-- Migration 012: Order Enhancements
-- Adds shipping tracking, refund tracking, order timeline, and tags

-- Add shipping tracking fields
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_carrier TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_url TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

-- Add refund tracking fields
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refunded_minor INTEGER DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refund_reason TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;

-- Order timeline events table
CREATE TABLE IF NOT EXISTS public.order_timeline (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'status_change', 'note_added', 'refund', 'tracking_added', 'payment', 'webhook')),
  title TEXT NOT NULL,
  description TEXT,
  staff_id UUID REFERENCES public.staff_members(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'
);

-- Tags for order organization
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- RLS for order timeline
ALTER TABLE public.order_timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Timeline viewable with order access" ON public.order_timeline
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_timeline.order_id 
      AND (orders.customer_id = auth.uid() OR auth.role() = 'service_role')
    )
  );
CREATE POLICY "Timeline manageable by service role" ON public.order_timeline
  FOR ALL USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_order_timeline_order ON public.order_timeline(order_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_filter ON public.orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_tracking ON public.orders(tracking_number) WHERE tracking_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_tags ON public.orders USING GIN(tags);

-- Function to auto-create timeline entry on order creation
CREATE OR REPLACE FUNCTION create_order_timeline_entry()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.order_timeline (order_id, event_type, title, description)
  VALUES (NEW.id, 'created', 'Order Created', format('Order #%s created', substring(NEW.id::text, 1, 8)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new orders
DROP TRIGGER IF EXISTS trigger_create_order_timeline ON public.orders;
CREATE TRIGGER trigger_create_order_timeline
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION create_order_timeline_entry();
