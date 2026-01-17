"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Settings,
    LogOut,
    Store,
    FolderOpen,
    Users,
    Truck,
    Percent,
    CreditCard,
    UserCog,
    History,
    Image as ImageIcon,
    Undo2,
    Blocks,
    PenLine,
    Star,
    Mail,
    Gift,
    Award,
    Monitor,
    Palette,
    LucideIcon
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface NavItem {
    href: string;
    label: string;
    icon: LucideIcon;
    moduleKey?: string; // Optional: links to a module
}

// Core items that are always shown
const coreNavItems: NavItem[] = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/categories", label: "Categories", icon: FolderOpen },
    { href: "/admin/media", label: "Media Library", icon: ImageIcon },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/coupons", label: "Coupons", icon: Percent },
];

// Module-based items (only show if module is enabled)
const moduleNavItems: NavItem[] = [
    { href: "/admin/returns", label: "Returns", icon: Undo2, moduleKey: "returns" },
    { href: "/admin/reviews", label: "Reviews", icon: Star, moduleKey: "reviews" },
    { href: "/admin/blog", label: "Blog", icon: PenLine, moduleKey: "blog" },
    { href: "/admin/newsletter", label: "Newsletter", icon: Mail, moduleKey: "newsletter" },
    { href: "/admin/gift-cards", label: "Gift Cards", icon: Gift, moduleKey: "gift_cards" },
    { href: "/admin/loyalty", label: "Loyalty", icon: Award, moduleKey: "loyalty" },
    { href: "/admin/pos", label: "Point of Sale", icon: Monitor, moduleKey: "pos" },
    { href: "/admin/cms", label: "CMS", icon: Palette, moduleKey: "cms" },
];

// Settings items that are always shown
const settingsNavItems: NavItem[] = [
    { href: "/admin/shipping", label: "Shipping", icon: Truck },
    { href: "/admin/payments", label: "Payments", icon: CreditCard },
    { href: "/admin/staff", label: "Staff", icon: UserCog },
    { href: "/admin/audit", label: "Audit Log", icon: History },
    { href: "/admin/modules", label: "Modules", icon: Blocks },
    { href: "/admin/settings", label: "Settings", icon: Settings },
];

interface AdminSidebarProps {
    enabledModules?: string[];
    variant?: "desktop" | "mobile";
}

export function AdminSidebar({ enabledModules = [], variant = "desktop" }: AdminSidebarProps) {
    const pathname = usePathname();

    // Filter module items based on enabled modules
    const visibleModuleItems = moduleNavItems.filter(item =>
        !item.moduleKey || enabledModules.includes(item.moduleKey)
    );

    // Combine all visible nav items
    const allNavItems = [...coreNavItems, ...visibleModuleItems, ...settingsNavItems];

    const asideClassName = variant === "mobile"
        ? "flex flex-col h-full w-full bg-background"
        : "fixed left-0 top-0 z-40 hidden h-screen w-64 border-r bg-background lg:block";

    return (
        <aside className={asideClassName}>
            <div className="flex h-full flex-col">
                {/* Logo */}
                <div className="flex h-16 items-center border-b px-6">
                    <Link href="/admin" className="flex items-center gap-2">
                        <Store className="h-6 w-6 text-primary" />
                        <span className="font-heading text-xl font-bold">Moolre Admin</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto space-y-1 p-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                    {allNavItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== "/admin" && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <Separator />

                {/* Footer */}
                <div className="p-4">
                    <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" asChild>
                        <Link href="/">
                            <LogOut className="h-5 w-5" />
                            Back to Store
                        </Link>
                    </Button>
                </div>
            </div>
        </aside>
    );
}
