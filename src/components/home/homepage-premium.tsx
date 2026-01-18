import { Hero } from "@/components/home/hero";
import { HeroPremium } from "@/components/home/hero-premium";
import { AnnouncementBar } from "@/components/home/announcement-bar";
import { TrustBadges } from "@/components/home/trust-badges";
import { CategoryGrid } from "@/components/home/category-grid";
import { ProductGrid } from "@/components/home/product-grid";
import { PromoBanner } from "@/components/home/promo-banner";
import { Testimonials } from "@/components/home/testimonials";
import { NewsletterEnhanced } from "@/components/home/newsletter-enhanced";
import { Product } from "@/types";

interface SectionContent {
    backgroundColor?: string;
    backgroundImage?: string;
    textColor?: string;
}

interface Category {
    id: string;
    name: string;
    slug: string;
    image?: string | null;
}

interface HomepageLayoutProps {
    products: Product[];
    categories: Category[];
    heroContent?: any;
    collectionContent?: SectionContent | null;
    productContent?: SectionContent | null;
    newsletterContent?: SectionContent | null;
    promoBannerContent?: any;
    testimonialContent?: any;
}

/**
 * PREMIUM HOMEPAGE LAYOUT
 * A stunning, mobile-first homepage design combining the best of
 * Shopify and WooCommerce aesthetics.
 */
export function HomepagePremium({
    products,
    categories,
    heroContent,
    collectionContent,
    productContent,
    newsletterContent,
    promoBannerContent,
    testimonialContent
}: HomepageLayoutProps) {
    // Split products for different sections
    const trendingProducts = products.slice(0, 8);
    const newArrivals = products.filter(p => p.isNew).slice(0, 4);
    const saleProducts = products.filter(p => p.isSale).slice(0, 4);

    return (
        <>
            {/* Announcement Bar */}
            <AnnouncementBar />

            {/* Hero Section - Premium Slider */}
            <HeroPremium />

            {/* Trust Badges */}
            <TrustBadges />

            {/* Category Grid */}
            <CategoryGrid
                categories={categories}
                title="Shop by Category"
                subtitle="Explore our curated collections designed for every style"
                backgroundColor="#FFFFFF"
            />

            {/* Trending Products */}
            <ProductGrid
                products={trendingProducts}
                title="Trending Now"
                subtitle="Our most coveted pieces, loved by the community"
                backgroundColor="#FAFAFA"
                columns={4}
                variant="premium"
            />

            {/* Promotional Banner */}
            <PromoBanner
                title="Summer Collection"
                subtitle="Discover our exclusive summer essentials. Premium quality, timeless style."
                buttonText="Shop the Collection"
                buttonLink="/collections/summer"
                badge="NEW SEASON"
                discount="30% OFF"
                {...promoBannerContent}
            />

            {/* New Arrivals */}
            {newArrivals.length > 0 && (
                <ProductGrid
                    products={newArrivals}
                    title="New Arrivals"
                    subtitle="Fresh drops you don't want to miss"
                    backgroundColor="#FFFFFF"
                    columns={4}
                    viewAllLink="/shop?filter=new"
                    variant="premium"
                />
            )}

            {/* Testimonials */}
            <Testimonials
                backgroundColor="#F8F9FA"
                {...testimonialContent}
            />

            {/* Sale Products (if any) */}
            {saleProducts.length > 0 && (
                <ProductGrid
                    products={saleProducts}
                    title="On Sale"
                    subtitle="Limited time offers on selected items"
                    backgroundColor="#FFFFFF"
                    columns={4}
                    viewAllLink="/shop?filter=sale"
                    variant="premium"
                />
            )}

            {/* Newsletter */}
            <NewsletterEnhanced
                title="Stay in the Loop"
                subtitle="Join our community for exclusive access to new arrivals, special offers, and style inspiration."
                backgroundColor={newsletterContent?.backgroundColor || "#18181B"}
                textColor={newsletterContent?.textColor || "#FFFFFF"}
                backgroundImage={newsletterContent?.backgroundImage}
            />
        </>
    );
}

/**
 * MINIMAL HOMEPAGE LAYOUT
 * Clean, simple, content-focused design
 */
export function HomepageMinimal({
    products,
    categories,
    collectionContent,
    productContent,
    newsletterContent
}: HomepageLayoutProps) {
    return (
        <>
            {/* Uses the existing Hero component */}
            <Hero />

            {/* Trust Badges */}
            <TrustBadges backgroundColor="#FAFAFA" />

            {/* Featured Categories */}
            <CategoryGrid
                categories={categories}
                backgroundColor="#FFFFFF"
            />

            {/* Products */}
            <ProductGrid
                products={products.slice(0, 8)}
                title="Our Products"
                backgroundColor={productContent?.backgroundColor || "#FAFAFA"}
                variant="minimal"
            />

            {/* Newsletter */}
            <NewsletterEnhanced
                backgroundColor={newsletterContent?.backgroundColor || "#18181B"}
                textColor={newsletterContent?.textColor || "#FFFFFF"}
            />
        </>
    );
}

// Export for use in page
export const homepageLayouts = {
    premium: HomepagePremium,
    minimal: HomepageMinimal
};
