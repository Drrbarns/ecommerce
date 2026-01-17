
-- Seed Data for Products
INSERT INTO public.products (name, slug, description, price, image, category, is_new, is_sale) VALUES
('Premium Leather Traveler', 'premium-leather-traveler', 'Handcrafted from full-grain leather, this weekender bag features brass hardware and a reinforced bottom. Perfect for short getaways.', 250.00, 'https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=2670&auto=format&fit=crop', 'Bags', true, false),
('Minimalist Chronograph', 'minimalist-chronograph', 'A sleek timepiece with a sapphire crystal face, Swiss movement, and a genuine leather strap. Water-resistant up to 50m.', 180.00, 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=2576&auto=format&fit=crop', 'Watches', false, true),
('Sonic Headphones', 'sonic-headphones', 'Experience high-fidelity sound with these noise-cancelling over-ear headphones. Features 30-hour battery life and plush memory foam ear cups.', 320.00, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2670&auto=format&fit=crop', 'Electronics', true, false),
('Everyday Cotton Tee', 'everyday-cotton-tee', 'Made from 100% organic heavyweight cotton. This relaxed-fit tee is designed for durability and comfort.', 45.00, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2000&auto=format&fit=crop', 'Apparel', false, false),
('Urban Sneaker', 'urban-sneaker', 'A versatile low-top sneaker featuring a breathable knit upper and a responsive cushioned sole for all-day comfort.', 120.00, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2670&auto=format&fit=crop', 'Footwear', true, false),
('Signature Sunglasses', 'signature-sunglasses', 'Classic wayfarer frames with polarized lenses that offer 100% UV protection. Includes a hard leather case.', 85.00, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=2000&auto=format&fit=crop', 'Accessories', false, true);

-- Seed Data for Collections
INSERT INTO public.collections (name, slug, description, image) VALUES
('New Arrivals', 'new-arrivals', 'The latest trends for the upcoming season.', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2670&auto=format&fit=crop'),
('Best Sellers', 'best-sellers', 'Our most coveted pieces, loved by the community.', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2670&auto=format&fit=crop'),
('Accessories', 'accessories', 'Finishing touches to elevate any look.', 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?q=80&w=2565&auto=format&fit=crop');
