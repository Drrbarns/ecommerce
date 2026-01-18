"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingBag, User, Menu, CreditCard, Home, LayoutGrid, Info, Phone, Briefcase, Package } from "lucide-react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { useScroll } from "@/hooks/use-scroll";
import { useCartStore } from "@/store/cart-store";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

export function Header() {
    const scrolled = useScroll(50);
    const pathname = usePathname();
    const isHome = pathname === "/";
    const { setOpen, getCartCount } = useCartStore();

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setIsSearchOpen(false);
            router.push(`/shop?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <header
            className={cn(
                "z-50 w-full transition-all duration-300 border-b bg-white dark:bg-zinc-950 shadow-sm",
                "sticky top-0"
            )}
        >
            <Container className="flex h-16 items-center justify-between">
                {/* Mobile Menu */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("md:hidden", !scrolled && isHome && "hover:bg-white/10 hover:text-white")}
                        >
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] sm:w-[400px] flex flex-col h-full">
                        <SheetHeader className="text-left border-b pb-4 mb-2">
                            <SheetTitle className="font-heading text-2xl font-bold tracking-tight text-primary">
                                {siteConfig.name}
                            </SheetTitle>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                Explore Premium Collections
                            </p>
                        </SheetHeader>
                        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto py-4">
                            {siteConfig.nav.map((item) => {
                                const Icon = item.href === "/" ? Home :
                                    item.href === "/shop" ? ShoppingBag :
                                        item.href === "/collections" ? LayoutGrid :
                                            item.href === "/about" ? Info :
                                                item.href === "/contact" ? Phone :
                                                    item.href === "/careers" ? Briefcase :
                                                        Package;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex items-center gap-4 px-2 py-3 text-lg font-medium transition-colors hover:bg-muted/50 rounded-lg group"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/50 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        {item.name}
                                    </Link>
                                )
                            })}
                        </nav>

                        <div className="border-t pt-6 pb-8 mt-auto space-y-4">
                            <Button
                                variant="outline"
                                className="w-full justify-start h-12 text-base font-medium gap-3 rounded-xl border-2 hover:bg-secondary/50"
                                onClick={() => setOpen(true)}
                            >
                                <div className="relative">
                                    <ShoppingBag className="h-5 w-5" />
                                    {getCartCount() > 0 && (
                                        <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                                            {getCartCount()}
                                        </span>
                                    )}
                                </div>
                                View Cart
                            </Button>
                            <Button
                                className="w-full justify-between h-12 text-base font-semibold rounded-xl bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
                                asChild
                            >
                                <Link href="/checkout">
                                    Proceed to Checkout
                                    <CreditCard className="h-5 w-5" />
                                </Link>
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Logo */}
                <div className="flex lg:w-0 lg:flex-1">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="font-heading text-2xl font-bold tracking-tight text-primary">
                            {siteConfig.name}
                        </span>
                    </Link>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex gap-6 lg:gap-8">
                    {siteConfig.nav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Actions */}
                <div className="flex flex-1 items-center justify-end gap-2 md:gap-4">
                    <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Search className="h-5 w-5" />
                                <span className="sr-only">Search</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Search Products</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSearch} className="flex gap-2 pt-4">
                                <Input
                                    placeholder="Search by name or category..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="col-span-3"
                                    autoFocus
                                />
                                <Button type="submit">Search</Button>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Button variant="ghost" size="icon">
                        <User className="h-5 w-5" />
                        <span className="sr-only">Account</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setOpen(true)}
                        className="relative"
                    >
                        <ShoppingBag className="h-5 w-5" />
                        {getCartCount() > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                                {getCartCount()}
                            </span>
                        )}
                        <span className="sr-only">Cart</span>
                    </Button>
                </div>
            </Container>
        </header>
    );
}
