import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/shared/container";
import { Separator } from "@/components/ui/separator";
import { Facebook, Instagram, Twitter, MessageCircle } from "lucide-react";

// Static footer component (no server calls) - used in client components
// For CMS-powered footer, use FooterWithCMS in server components

export function Footer() {
    return (
        <footer className="bg-secondary/30 pt-16 pb-8">
            <Container>
                <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <h3 className="font-heading text-2xl font-bold text-primary">
                            {siteConfig.name}
                        </h3>
                        <p className="text-muted-foreground text-sm max-w-xs">
                            {siteConfig.description}. We bring premium quality directly to your doorstep with minimal hassle.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-medium text-foreground mb-4">Shop</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            {siteConfig.footer.shop.map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="hover:text-primary transition-colors">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="font-medium text-foreground mb-4">Company</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            {siteConfig.footer.company.map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="hover:text-primary transition-colors">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-medium text-foreground mb-4">Support</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            {siteConfig.footer.support.map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="hover:text-primary transition-colors">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <Separator className="my-12" />

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
                    <div className="flex gap-4">
                        <span>Visa</span>
                        <span>Mastercard</span>
                        <span>Moolre</span>
                    </div>
                </div>
            </Container>
        </footer>
    );
}
