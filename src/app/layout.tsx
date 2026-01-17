import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { StickyMobileBar } from "@/components/layout/sticky-mobile-bar";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Moolre Commerce | Premium DTC Store",
  description: "Experience the future of shopping with premium quality.",
};

import { getActiveTheme } from "@/lib/actions/cms-actions";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getActiveTheme();

  return (
    <html lang="en">
      <head>
        {theme && (
          <style dangerouslySetInnerHTML={{
            __html: `
            :root {
              --background: ${theme.background_color};
              --foreground: ${theme.foreground_color};
              --card: ${theme.card_color};
              --card-foreground: ${theme.card_foreground};
              --popover: ${theme.card_color};
              --popover-foreground: ${theme.card_foreground};
              --primary: ${theme.primary_color};
              --primary-foreground: ${theme.primary_foreground};
              --secondary: ${theme.secondary_color};
              --secondary-foreground: ${theme.secondary_foreground};
              --muted: ${theme.muted_color};
              --muted-foreground: ${theme.muted_foreground};
              --accent: ${theme.accent_color};
              --accent-foreground: ${theme.accent_foreground};
              --destructive: ${theme.destructive_color};
              --destructive-foreground: ${theme.destructive_foreground};
              --border: ${theme.border_color};
              --input: ${theme.border_color};
              --ring: ${theme.ring_color};
              --radius: 0.5rem;
            }
          `}} />
        )}
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <StickyMobileBar />
          <CartDrawer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
