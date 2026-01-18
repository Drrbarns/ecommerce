import { Hero } from "@/components/home/hero";
import { FeaturedCollections } from "@/components/home/featured-collections";
import { FeaturedProducts } from "@/components/home/featured-products";
import { Newsletter } from "@/components/home/newsletter";
import { Header } from "@/components/layout/header";
import { FooterWithCMS } from "@/components/layout/footer-with-cms";
import { CMSThemeProvider } from "@/components/shared/cms-theme-provider";

import { getFeaturedProducts, getCollections } from "@/lib/api";
import { getCMSContent } from "@/lib/actions/cms-actions";

export default async function Home() {
  const [featuredProducts, collections, collectionContent, productContent] = await Promise.all([
    getFeaturedProducts(),
    getCollections(),
    getCMSContent<{ backgroundColor?: string }>("featured_collections"),
    getCMSContent<{ backgroundColor?: string }>("featured_products"),
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
          <Newsletter />
        </main>
        <FooterWithCMS />
      </div>
    </CMSThemeProvider>
  );
}
