-- =============================================
-- MODULE FEATURES TABLES (CLEAN INSTALL)
-- Blog, Reviews, Newsletter, Gift Cards, Loyalty, POS
-- =============================================

-- First, drop all indexes that might exist
DROP INDEX IF EXISTS idx_blog_posts_slug;
DROP INDEX IF EXISTS idx_blog_posts_status;
DROP INDEX IF EXISTS idx_reviews_product;
DROP INDEX IF EXISTS idx_reviews_status;
DROP INDEX IF EXISTS idx_newsletter_email;
DROP INDEX IF EXISTS idx_newsletter_active;
DROP INDEX IF EXISTS idx_gift_cards_code;
DROP INDEX IF EXISTS idx_gift_cards_status;
DROP INDEX IF EXISTS idx_loyalty_customer;
DROP INDEX IF EXISTS idx_loyalty_tx_customer;
DROP INDEX IF EXISTS idx_pos_sessions_staff;
DROP INDEX IF EXISTS idx_pos_sessions_status;

-- Drop existing tables if they exist (in correct order for foreign keys)
DROP TABLE IF EXISTS loyalty_transactions CASCADE;
DROP TABLE IF EXISTS customer_loyalty CASCADE;
DROP TABLE IF EXISTS pos_sessions CASCADE;
DROP TABLE IF EXISTS gift_cards CASCADE;
DROP TABLE IF EXISTS newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS product_reviews CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;

-- 1. BLOG POSTS
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image TEXT,
    author_email TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);

-- 2. PRODUCT REVIEWS
CREATE TABLE product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_product ON product_reviews(product_id);
CREATE INDEX idx_reviews_status ON product_reviews(status);

-- 3. NEWSLETTER SUBSCRIBERS
CREATE TABLE newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    source TEXT DEFAULT 'website',
    is_active BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_active ON newsletter_subscribers(is_active);

-- 4. GIFT CARDS
CREATE TABLE gift_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    initial_balance_minor INTEGER NOT NULL,
    current_balance_minor INTEGER NOT NULL,
    recipient_email TEXT,
    sender_name TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'depleted', 'expired', 'cancelled')),
    expires_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gift_cards_code ON gift_cards(code);
CREATE INDEX idx_gift_cards_status ON gift_cards(status);

-- 5. CUSTOMER LOYALTY
CREATE TABLE customer_loyalty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
    points_balance INTEGER DEFAULT 0,
    lifetime_points INTEGER DEFAULT 0,
    tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_loyalty_customer ON customer_loyalty(customer_id);

-- 6. LOYALTY TRANSACTIONS
CREATE TABLE loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    reason TEXT NOT NULL,
    balance_after INTEGER NOT NULL,
    order_id UUID REFERENCES orders(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_loyalty_tx_customer ON loyalty_transactions(customer_id);

-- 7. POS SESSIONS
CREATE TABLE pos_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    starting_cash_minor INTEGER DEFAULT 0,
    closing_cash_minor INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pos_sessions_staff ON pos_sessions(staff_email);
CREATE INDEX idx_pos_sessions_status ON pos_sessions(status);

-- Enable RLS on all tables
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_loyalty ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Service role full access to blog_posts" ON blog_posts FOR ALL USING (TRUE);
CREATE POLICY "Public read published blog posts" ON blog_posts FOR SELECT USING (status = 'published');

CREATE POLICY "Service role full access to product_reviews" ON product_reviews FOR ALL USING (TRUE);
CREATE POLICY "Public read approved reviews" ON product_reviews FOR SELECT USING (status = 'approved');

CREATE POLICY "Service role full access to newsletter" ON newsletter_subscribers FOR ALL USING (TRUE);
CREATE POLICY "Service role full access to gift_cards" ON gift_cards FOR ALL USING (TRUE);
CREATE POLICY "Service role full access to loyalty" ON customer_loyalty FOR ALL USING (TRUE);
CREATE POLICY "Service role full access to loyalty_tx" ON loyalty_transactions FOR ALL USING (TRUE);
CREATE POLICY "Service role full access to pos" ON pos_sessions FOR ALL USING (TRUE);

-- Function to get product rating summary
CREATE OR REPLACE FUNCTION get_product_rating(p_product_id UUID)
RETURNS TABLE(average_rating NUMERIC, review_count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROUND(AVG(rating)::NUMERIC, 1) as average_rating,
        COUNT(*) as review_count
    FROM product_reviews
    WHERE product_id = p_product_id
    AND status = 'approved';
END;
$$ LANGUAGE plpgsql;

-- Function to calculate loyalty points from order
CREATE OR REPLACE FUNCTION calculate_order_points(order_total_minor INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- 1 point per 1 GHS spent (100 minor units)
    RETURN FLOOR(order_total_minor / 100);
END;
$$ LANGUAGE plpgsql;

SELECT 'Module feature tables created successfully!' as status;
