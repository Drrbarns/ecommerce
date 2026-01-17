import { Hero } from "@/components/home/hero";
import { FeaturedCollections } from "@/components/home/featured-collections";
import { FeaturedProducts } from "@/components/home/featured-products";
import { Newsletter } from "@/components/home/newsletter";
import { Header } from "@/components/layout/header";
import { FooterWithCMS } from "@/components/layout/footer-with-cms";
import { CMSThemeProvider } from "@/components/shared/cms-theme-provider";

import { getFeaturedProducts, getCollections } from "@/lib/api";

export default async function Home() {
  const [featuredProducts, collections] = await Promise.all([
    getFeaturedProducts(),
    getCollections(),
  ]);

  return (
    <CMSThemeProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Hero />
          <FeaturedCollections collections={collections} />
          <FeaturedProducts products={featuredProducts} />
          <Newsletter />
        </main>
        <FooterWithCMS />
      </div>
    </CMSThemeProvider>
  );
}
