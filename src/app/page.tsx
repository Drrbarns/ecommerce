import { Hero } from "@/components/home/hero";
import { FeaturedCollections } from "@/components/home/featured-collections";
import { FeaturedProducts } from "@/components/home/featured-products";
import { Newsletter } from "@/components/home/newsletter";
import { Header } from "@/components/layout/header";
import { FooterWithCMS } from "@/components/layout/footer-with-cms";
import { CMSThemeProvider } from "@/components/shared/cms-theme-provider";

import { getFeaturedProducts, getCollections } from "@/lib/api";
import { getCMSContent } from "@/lib/actions/cms-actions";

interface SectionContent {
  backgroundColor?: string;
  backgroundImage?: string;
  textColor?: string;
}

export default async function Home() {
  const [featuredProducts, collections, collectionContent, productContent, newsletterContent] = await Promise.all([
    getFeaturedProducts(),
    getCollections(),
    getCMSContent<SectionContent>("featured_collections"),
    getCMSContent<SectionContent>("featured_products"),
    getCMSContent<SectionContent>("newsletter_section"),
  ]);

  return (
    <CMSThemeProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Hero />
          <FeaturedCollections
            collections={collections}
            backgroundColor={collectionContent?.backgroundColor || "#FAFAFA"}
          />
          <FeaturedProducts
            products={featuredProducts}
            backgroundColor={productContent?.backgroundColor || "#F3F4F6"}
          />
          <Newsletter
            backgroundColor={newsletterContent?.backgroundColor || "#1B4D3E"}
            backgroundImage={newsletterContent?.backgroundImage}
            textColor={newsletterContent?.textColor}
          />
        </main>
        <FooterWithCMS />
      </div>
    </CMSThemeProvider>
  );
}
