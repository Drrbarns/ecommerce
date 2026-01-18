import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/shared/container";
import { Facebook, Instagram, Twitter, MessageCircle, Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { getCMSContent, FooterContent } from "@/lib/actions/cms-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Default footer content
const defaultFooter: FooterContent = {
    companyName: siteConfig.name,
    tagline: "Your trusted online shopping destination. We bring premium quality directly to your doorstep.",
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

    const hasContactInfo = footer.contactInfo && (
        footer.contactInfo.email ||
        footer.contactInfo.phone ||
        footer.contactInfo.address
    );

    const mainColor = footer.textColor || "#d4d4d8"; // Default zinc-300
    const bgColor = footer.backgroundColor || "#09090b"; // Default zinc-950

    return (
        <footer
            className="relative"
            style={{
                backgroundColor: bgColor,
                color: mainColor
            }}
        >
            {/* Decorative Top Border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent" />

            {/* Main Footer Content */}
            <div className="pt-16 pb-12">
                <Container>
                    {/* Top Section - Logo & Newsletter */}
                    <div className="grid gap-12 lg:grid-cols-2 lg:gap-24 pb-12 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                        {/* Brand Info */}
                        <div className="space-y-6">
                            <Link href="/" className="inline-block">
                                <h3 className="font-heading text-3xl font-bold tracking-tight" style={{ color: 'inherit' }}>
                                    {footer.companyName}
                                </h3>
                            </Link>
                            <p className="max-w-md leading-relaxed opacity-80">
                                {footer.tagline}
                            </p>

                            {/* Social Links */}
                            {hasSocialLinks && (
                                <div className="flex gap-3">
                                    {footer.socialLinks.facebook && (
                                        <a
                                            href={footer.socialLinks.facebook}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 rounded-full transition-all duration-300 hover:scale-110"
                                            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} // Subtle bg
                                            aria-label="Facebook"
                                        >
                                            <Facebook className="h-5 w-5" />
                                        </a>
                                    )}
                                    {footer.socialLinks.instagram && (
                                        <a
                                            href={footer.socialLinks.instagram}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 rounded-full transition-all duration-300 hover:scale-110"
                                            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                                            aria-label="Instagram"
                                        >
                                            <Instagram className="h-5 w-5" />
                                        </a>
                                    )}
                                    {footer.socialLinks.twitter && (
                                        <a
                                            href={footer.socialLinks.twitter}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 rounded-full transition-all duration-300 hover:scale-110"
                                            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                                            aria-label="Twitter"
                                        >
                                            <Twitter className="h-5 w-5" />
                                        </a>
                                    )}
                                    {footer.socialLinks.whatsapp && (
                                        <a
                                            href={footer.socialLinks.whatsapp}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 rounded-full transition-all duration-300 hover:scale-110"
                                            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                                            aria-label="WhatsApp"
                                        >
                                            <MessageCircle className="h-5 w-5" />
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Newsletter Signup */}
                        <div className="lg:text-right space-y-4">
                            <h4 className="font-semibold text-lg" style={{ color: 'inherit' }}>Stay Updated</h4>
                            <p className="text-sm lg:ml-auto lg:max-w-sm opacity-80">
                                Subscribe to our newsletter for exclusive deals and new arrivals.
                            </p>
                            <form className="flex gap-2 max-w-md lg:ml-auto">
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="h-12 border-white/10 placeholder:text-inherit/50 focus-visible:ring-primary"
                                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'inherit' }}
                                />
                                <Button type="submit" size="lg" className="h-12 px-6 shrink-0">
                                    <ArrowRight className="h-5 w-5" />
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Middle Section - Links Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                        {/* Shop Links */}
                        <div>
                            <h4 className="font-semibold mb-6 text-sm uppercase tracking-wider opacity-100">Shop</h4>
                            <ul className="space-y-4">
                                {(footer.quickLinks?.length ? footer.quickLinks : siteConfig.footer.shop.map(i => ({ label: i.name, href: i.href }))).map((item) => (
                                    <li key={item.label}>
                                        <Link
                                            href={item.href}
                                            className="hover:opacity-100 transition-opacity duration-200 text-sm inline-flex items-center gap-1 group opacity-70"
                                        >
                                            <span>{item.label}</span>
                                            <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Company Links */}
                        <div>
                            <h4 className="font-semibold mb-6 text-sm uppercase tracking-wider opacity-100">Company</h4>
                            <ul className="space-y-4">
                                {siteConfig.footer.company.map((item) => (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            className="hover:opacity-100 transition-opacity duration-200 text-sm inline-flex items-center gap-1 group opacity-70"
                                        >
                                            <span>{item.name}</span>
                                            <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Support Links */}
                        <div>
                            <h4 className="font-semibold mb-6 text-sm uppercase tracking-wider opacity-100">Support</h4>
                            <ul className="space-y-4">
                                {(footer.customerService?.length ? footer.customerService : siteConfig.footer.support.map(i => ({ label: i.name, href: i.href }))).map((item) => (
                                    <li key={item.label}>
                                        <Link
                                            href={item.href}
                                            className="hover:opacity-100 transition-opacity duration-200 text-sm inline-flex items-center gap-1 group opacity-70"
                                        >
                                            <span>{item.label}</span>
                                            <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h4 className="font-semibold mb-6 text-sm uppercase tracking-wider opacity-100">Contact</h4>
                            <ul className="space-y-4">
                                {hasContactInfo ? (
                                    <>
                                        {footer.contactInfo.email && (
                                            <li>
                                                <a
                                                    href={`mailto:${footer.contactInfo.email}`}
                                                    className="hover:opacity-100 transition-opacity duration-200 text-sm flex items-center gap-3 opacity-70"
                                                >
                                                    <Mail className="h-4 w-4 text-primary" />
                                                    <span>{footer.contactInfo.email}</span>
                                                </a>
                                            </li>
                                        )}
                                        {footer.contactInfo.phone && (
                                            <li>
                                                <a
                                                    href={`tel:${footer.contactInfo.phone}`}
                                                    className="hover:opacity-100 transition-opacity duration-200 text-sm flex items-center gap-3 opacity-70"
                                                >
                                                    <Phone className="h-4 w-4 text-primary" />
                                                    <span>{footer.contactInfo.phone}</span>
                                                </a>
                                            </li>
                                        )}
                                        {footer.contactInfo.address && (
                                            <li className="text-sm flex items-start gap-3 opacity-70">
                                                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                                <span>{footer.contactInfo.address}</span>
                                            </li>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <li>
                                            <a
                                                href="mailto:hello@moolre.com"
                                                className="hover:opacity-100 transition-opacity duration-200 text-sm flex items-center gap-3 opacity-70"
                                            >
                                                <Mail className="h-4 w-4 text-primary" />
                                                <span>hello@moolre.com</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="tel:+233200000000"
                                                className="hover:opacity-100 transition-opacity duration-200 text-sm flex items-center gap-3 opacity-70"
                                            >
                                                <Phone className="h-4 w-4 text-primary" />
                                                <span>+233 20 000 0000</span>
                                            </a>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Section - Copyright & Payment Methods */}
                    <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-sm text-center md:text-left opacity-50">
                            {footer.copyrightText || `© ${new Date().getFullYear()} ${footer.companyName}. All rights reserved.`}
                        </p>

                        {/* Payment Methods */}
                        <div className="flex items-center gap-4">
                            <span className="text-xs opacity-60">We accept:</span>
                            <div className="flex gap-3">
                                <div className="px-3 py-1.5 rounded text-xs font-medium" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                    Visa
                                </div>
                                <div className="px-3 py-1.5 rounded text-xs font-medium" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                    Mastercard
                                </div>
                                <div className="px-3 py-1.5 bg-gradient-to-r from-primary/20 to-primary/10 rounded text-xs font-medium text-primary border border-primary/20">
                                    Mobile Money
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>
        </footer>
    );
}
