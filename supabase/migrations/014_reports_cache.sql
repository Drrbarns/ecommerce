-- Migration 014: Reports & Analytics Cache
-- Materialized views for performance and analytics dashboard

-- Daily sales summary (materialized for performance)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.sales_daily AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as order_count,
  SUM(total_minor) as revenue_minor,
  AVG(total_minor) as avg_order_value_minor,
  COUNT(DISTINCT customer_id) FILTER (WHERE customer_id IS NOT NULL) as unique_customers,
  SUM(subtotal_minor) as subtotal_minor,
  SUM(shipping_minor) as shipping_minor,
  SUM(discount_minor) as discount_minor,
  SUM(tax_minor) as tax_minor
FROM public.orders
WHERE status IN ('paid', 'processing', 'shipped', 'delivered')
  AND created_at >= CURRENT_DATE - INTERVAL '365 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_daily_date ON public.sales_daily(date);

-- Top products by revenue (materialized for dashboard)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.top_products AS
SELECT 
  p.id,
  p.name,
  p.slug,
  p.image,
  p.price_minor,
  COUNT(DISTINCT oi.order_id) as order_count,
  SUM(oi.quantity) as units_sold,
  SUM(oi.price_minor * oi.quantity) as revenue_minor
FROM public.products p
JOIN public.order_items oi ON p.id = oi.product_id
JOIN public.orders o ON oi.order_id = o.id
WHERE o.status IN ('paid', 'processing', 'shipped', 'delivered')
  AND o.created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY p.id, p.name, p.slug, p.image, p.price_minor
ORDER BY revenue_minor DESC
LIMIT 100;

-- Payment success rate tracking
CREATE MATERIALIZED VIEW IF NOT EXISTS public.payment_health AS
SELECT 
  DATE(created_at) as date,
  provider,
  COUNT(*) as total_intents,
  COUNT(*) FILTER (WHERE status = 'succeeded') as succeeded_count,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_count,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE status = 'succeeded') / NULLIF(COUNT(*), 0),
    2
  ) as success_rate
FROM public.payment_intents
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at), provider
ORDER BY date DESC, provider;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_health_date_provider ON public.payment_health(date, provider);

-- Fulfillment status counts (refreshed frequently)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.fulfillment_summary AS
SELECT 
  COUNT(*) FILTER (WHERE status = 'paid') as unfulfilled,
  COUNT(*) FILTER (WHERE status = 'processing') as processing,
  COUNT(*) FILTER (WHERE status = 'shipped') as shipped,
  COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
  COUNT(*) FILTER (WHERE refunded_minor > 0) as refunded
FROM public.orders
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days';

-- Low stock items view
CREATE MATERIALIZED VIEW IF NOT EXISTS public.low_stock_items AS
SELECT 
  p.id as product_id,
  p.name as product_name,
  p.image,
  pv.id as variant_id,
  pv.name as variant_name,
  pv.sku,
  COALESCE(pv.inventory_count, p.inventory_count) as current_stock,
  5 as threshold -- TODO: Make configurable via store_settings
FROM public.products p
LEFT JOIN public.product_variants pv ON p.id = pv.product_id
WHERE p.is_active = true
  AND (
    (pv.id IS NOT NULL AND pv.inventory_count <= 5)
    OR (pv.id IS NULL AND p.inventory_count <= 5)
  )
ORDER BY COALESCE(pv.inventory_count, p.inventory_count) ASC;

-- Function to refresh all analytics materialized views
CREATE OR REPLACE FUNCTION refresh_analytics_cache()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.sales_daily;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.top_products;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.payment_health;
  REFRESH MATERIALIZED VIEW public.fulfillment_summary; -- No concurrent (no unique index)
  REFRESH MATERIALIZED VIEW public.low_stock_items;
  
  -- Log the refresh
  RAISE NOTICE 'Analytics cache refreshed at %', now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on refresh function
GRANT EXECUTE ON FUNCTION refresh_analytics_cache() TO service_role;
