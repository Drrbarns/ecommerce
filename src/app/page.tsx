import { Header } from "@/components/layout/header";
import { FooterWithCMS } from "@/components/layout/footer-with-cms";
import { CMSThemeProvider } from "@/components/shared/cms-theme-provider";

// Import all homepage layouts
import { homeLayouts, HomeClassic } from "@/components/home/home-layouts";
import { HomepagePremium, HomepageMinimal } from "@/components/home/homepage-premium";

import { getFeaturedProducts, getCollections, getProducts } from "@/lib/api";
import { getCMSContent } from "@/lib/actions/cms-actions";

interface SectionContent {
  backgroundColor?: string;
  backgroundImage?: string;
  textColor?: string;
}

interface HomepageSettings {
  layout: "premium" | "minimal" | "classic" | "modern" | "luxury";
}

export default async function Home() {
  const [
    allProducts,
    featuredProducts,
    collections,
    collectionContent,
    productContent,
    newsletterContent,
    homepageSettings,
    heroContent
  ] = await Promise.all([
    getProducts(),
    getFeaturedProducts(),
    getCollections(),
    getCMSContent<SectionContent>("featured_collections"),
    getCMSContent<SectionContent>("featured_products"),
    getCMSContent<SectionContent>("newsletter_section"),
    getCMSContent<HomepageSettings>("homepage_settings"),
    getCMSContent<any>("hero"),
  ]);

  // Determine which layout to use (default to premium)
  const layoutKey = homepageSettings?.layout || "premium";

  // Use all products, prioritize featured ones
  const displayProducts = [
    ...featuredProducts,
    ...allProducts.filter(p => !featuredProducts.find(fp => fp.id === p.id))
  ].slice(0, 12);

  // Common data structure for legacy layouts
  const legacyLayoutData = {
    featuredProducts: displayProducts,
    collections: collections,
    collectionContent,
    productContent,
    newsletterContent
  };

  // Render based on layout selection
  const renderLayout = () => {
    switch (layoutKey) {
      case "premium":
        return (
          <HomepagePremium
            products={displayProducts}
            categories={collections}
            heroContent={heroContent}
            collectionContent={collectionContent}
            productContent={productContent}
            newsletterContent={newsletterContent}
          />
        );
      case "minimal":
        return (
          <HomepageMinimal
            products={displayProducts}
            categories={collections}
            heroContent={heroContent}
            collectionContent={collectionContent}
            productContent={productContent}
            newsletterContent={newsletterContent}
          />
        );
      case "classic":
        return <HomeClassic data={legacyLayoutData} />;
      case "modern":
        return <homeLayouts.modern data={legacyLayoutData} />;
      case "luxury":
        return <homeLayouts.luxury data={legacyLayoutData} />;
      default:
        return (
          <HomepagePremium
            products={displayProducts}
            categories={collections}
            collectionContent={collectionContent}
            productContent={productContent}
            newsletterContent={newsletterContent}
          />
        );
    }
  };

  return (
    <CMSThemeProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          {renderLayout()}
        </main>
        <FooterWithCMS />
      </div>
    </CMSThemeProvider>
  );
}
