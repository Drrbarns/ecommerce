import { Header } from "@/components/layout/header";
import { FooterWithCMS } from "@/components/layout/footer-with-cms";
import { CMSThemeProvider } from "@/components/shared/cms-theme-provider";

export default function StorefrontLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <CMSThemeProvider>
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">
                    {children}
                </main>
                <FooterWithCMS />
            </div>
        </CMSThemeProvider>
    );
}
