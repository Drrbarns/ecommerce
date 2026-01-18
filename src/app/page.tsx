import { Header } from "@/components/layout/header";
import { FooterWithCMS } from "@/components/layout/footer-with-cms";
import { CMSThemeProvider } from "@/components/shared/cms-theme-provider";
import { homeLayouts, HomeClassic } from "@/components/home/home-layouts";

import { getFeaturedProducts, getCollections } from "@/lib/api";
import { getCMSContent } from "@/lib/actions/cms-actions";

interface SectionContent {
  backgroundColor?: string;
  backgroundImage?: string;
  textColor?: string;
}

interface HomepageSettings {
  layout: string;
}

export default async function Home() {
  const [
    featuredProducts,
    collections,
    collectionContent,
    productContent,
    newsletterContent,
    homepageSettings
  ] = await Promise.all([
    getFeaturedProducts(),
    getCollections(),
    getCMSContent<SectionContent>("featured_collections"),
    getCMSContent<SectionContent>("featured_products"),
    getCMSContent<SectionContent>("newsletter_section"),
    getCMSContent<HomepageSettings>("homepage_settings"),
  ]);

  const layout = (homepageSettings?.layout || "classic") as keyof typeof homeLayouts;
  const HomeLayout = homeLayouts[layout] || HomeClassic;

  const layoutData = {
    featuredProducts,
    collections,
    collectionContent,
    productContent,
    newsletterContent
  };

  return (
    <CMSThemeProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <HomeLayout data={layoutData} />
        </main>
        <FooterWithCMS />
      </div>
    </CMSThemeProvider>
  );
}
