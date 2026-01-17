import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/shared/container";
import { Separator } from "@/components/ui/separator";
import { Facebook, Instagram, Twitter, MessageCircle } from "lucide-react";
import { getCMSContent, FooterContent } from "@/lib/actions/cms-actions";

// Default footer content
const defaultFooter: FooterContent = {
    companyName: siteConfig.name,
    tagline: siteConfig.description + ". We bring premium quality directly to your doorstep with minimal hassle.",
    copyrightText: `© ${new Date().getFullYear()} ${siteConfig.name}. All rights reserved.`,
    socialLinks: {},
    quickLinks: siteConfig.footer.shop.map(item => ({ label: item.name, href: item.href })),
    customerService: siteConfig.footer.support.map(item => ({ label: item.name, href: item.href })),
    contactInfo: {},
};

// CMS-powered footer - use in server components only
export async function FooterWithCMS() {
    // Fetch CMS content, fall back to defaults
    const cmsFooter = await getCMSContent<FooterContent>("footer");
    const footer = cmsFooter || defaultFooter;

    const hasSocialLinks = footer.socialLinks && (
        footer.socialLinks.facebook ||
        footer.socialLinks.instagram ||
        footer.socialLinks.twitter ||
        footer.socialLinks.whatsapp
    );

    return (
        <footer className="bg-secondary/30 pt-16 pb-8">
            <Container>
                <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <h3 className="font-heading text-2xl font-bold text-primary">
                            {footer.companyName}
                        </h3>
                        <p className="text-muted-foreground text-sm max-w-xs">
                            {footer.tagline}
                        </p>

                        {/* Social Links */}
                        {hasSocialLinks && (
                            <div className="flex gap-3 pt-2">
                                {footer.socialLinks.facebook && (
                                    <a
                                        href={footer.socialLinks.facebook}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                                    >
                                        <Facebook className="h-4 w-4" />
                                    </a>
                                )}
                                {footer.socialLinks.instagram && (
                                    <a
                                        href={footer.socialLinks.instagram}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                                    >
                                        <Instagram className="h-4 w-4" />
                                    </a>
                                )}
                                {footer.socialLinks.twitter && (
                                    <a
                                        href={footer.socialLinks.twitter}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                                    >
                                        <Twitter className="h-4 w-4" />
                                    </a>
                                )}
                                {footer.socialLinks.whatsapp && (
                                    <a
                                        href={footer.socialLinks.whatsapp}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                                    >
                                        <MessageCircle className="h-4 w-4" />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-medium text-foreground mb-4">Shop</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            {(footer.quickLinks?.length ? footer.quickLinks : siteConfig.footer.shop.map(i => ({ label: i.name, href: i.href }))).map((item) => (
                                <li key={item.label}>
                                    <Link href={item.href} className="hover:text-primary transition-colors">
                                        {item.label}
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

                    {/* Customer Service */}
                    <div>
                        <h4 className="font-medium text-foreground mb-4">Support</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            {(footer.customerService?.length ? footer.customerService : siteConfig.footer.support.map(i => ({ label: i.name, href: i.href }))).map((item) => (
                                <li key={item.label}>
                                    <Link href={item.href} className="hover:text-primary transition-colors">
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        {/* Contact Info */}
                        {footer.contactInfo && (footer.contactInfo.email || footer.contactInfo.phone) && (
                            <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                                {footer.contactInfo.email && (
                                    <p>
                                        <a href={`mailto:${footer.contactInfo.email}`} className="hover:text-primary transition-colors">
                                            {footer.contactInfo.email}
                                        </a>
                                    </p>
                                )}
                                {footer.contactInfo.phone && (
                                    <p>
                                        <a href={`tel:${footer.contactInfo.phone}`} className="hover:text-primary transition-colors">
                                            {footer.contactInfo.phone}
                                        </a>
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <Separator className="my-12" />

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <p>{footer.copyrightText || `© ${new Date().getFullYear()} ${footer.companyName}. All rights reserved.`}</p>
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
