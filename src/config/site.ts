export const siteConfig = {
    name: "Moolre",
    description: "Premium DTC E-commerce Store",
    currency: "GHS",
    nav: [
        { name: "Home", href: "/" },
        { name: "Shop", href: "/shop" },
        { name: "Collections", href: "/collections" },
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
    ],
    footer: {
        shop: [
            { name: "All Products", href: "/shop" },
            { name: "New Arrivals", href: "/shop?sort=new" },
            { name: "Best Sellers", href: "/shop?sort=best-selling" },
        ],
        company: [
            { name: "About Us", href: "/about" },
            { name: "Careers", href: "/careers" },
            { name: "Contact", href: "/contact" },
        ],
        support: [
            { name: "FAQ", href: "/faq" },
            { name: "Shipping", href: "/shipping" },
            { name: "Returns", href: "/returns" },
            { name: "Privacy Policy", href: "/privacy" },
        ],
    },
};
