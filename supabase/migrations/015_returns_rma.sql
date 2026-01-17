-- Migration 015: Returns & RMA
-- Return merchandise authorization system

CREATE TABLE IF NOT EXISTS public.return_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- References
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  
  -- Status workflow
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'received', 'refunded', 'cancelled')),
  
  -- Return details
  reason TEXT NOT NULL, -- Customer-provided reason
  items JSONB NOT NULL, -- [{product_id, variant_id, quantity, reason}]
  
  -- Refund details
  refund_method TEXT CHECK (refund_method IN ('original_payment', 'store_credit', 'exchange')),
  refund_amount_minor INTEGER,
  
  -- Notes
  customer_notes TEXT,
  staff_notes TEXT, -- Internal notes
  
  -- Approval tracking
  approved_by UUID REFERENCES public.staff_members(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejected_reason TEXT,
  
  -- Logistics
  return_tracking_number TEXT,
  received_at TIMESTAMPTZ,
  
  -- QC check
  inspection_notes TEXT,
  restocked_at TIMESTAMPTZ
);

-- RLS policies
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;

-- Customers can view their own return requests
CREATE POLICY "Customers can view own returns" ON public.return_requests 
  FOR SELECT USING (
    customer_id = auth.uid() 
    OR auth.role() = 'service_role'
  );

-- Customers can create return requests for their orders
CREATE POLICY "Customers can create returns" ON public.return_requests 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_id 
      AND orders.customer_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

-- Only service role can update/delete
CREATE POLICY "Service role manages returns" ON public.return_requests 
  FOR ALL USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_returns_order ON public.return_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_customer ON public.return_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_returns_status ON public.return_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_returns_created ON public.return_requests(created_at DESC);

-- Function to validate return request
CREATE OR REPLACE FUNCTION validate_return_request()
RETURNS TRIGGER AS $$
DECLARE
  order_record RECORD;
  days_since_order INTEGER;
BEGIN
  -- Get order details
  SELECT * INTO order_record FROM public.orders WHERE id = NEW.order_id;
  
  -- Calculate days since order
  days_since_order := EXTRACT(DAY FROM (now() - order_record.created_at));
  
  -- Check if order exists
  IF order_record IS NULL THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  
  -- Check if order is eligible for returns (paid/delivered)
  IF order_record.status NOT IN ('paid', 'shipped', 'delivered') THEN
    RAISE EXCEPTION 'Order status % is not eligible for returns', order_record.status;
  END IF;
  
  -- Check return window (30 days - make configurable later)
  IF days_since_order > 30 THEN
    RAISE EXCEPTION 'Return window has expired (% days since order)', days_since_order;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for return validation
DROP TRIGGER IF EXISTS trigger_validate_return ON public.return_requests;
CREATE TRIGGER trigger_validate_return
  BEFORE INSERT ON public.return_requests
  FOR EACH ROW
  EXECUTE FUNCTION validate_return_request();
