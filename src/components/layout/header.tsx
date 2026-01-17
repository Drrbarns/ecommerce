"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingBag, User, Menu } from "lucide-react";

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
                "z-50 w-full transition-all duration-300",
                isHome ? "fixed top-0" : "sticky top-0",
                scrolled || !isHome
                    ? "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
                    : "bg-transparent text-white border-b border-white/10"
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
                    <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                        <SheetHeader>
                            <SheetTitle className="font-heading text-xl font-bold">
                                {siteConfig.name}
                            </SheetTitle>
                        </SheetHeader>
                        <nav className="flex flex-col gap-4 mt-8">
                            {siteConfig.nav.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="text-lg font-medium transition-colors hover:text-primary"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </SheetContent>
                </Sheet>

                {/* Logo */}
                <div className="flex lg:w-0 lg:flex-1">
                    <Link href="/" className="flex items-center gap-2">
                        <span
                            className={cn(
                                "font-heading text-2xl font-bold tracking-tight",
                                !scrolled && isHome ? "text-white" : "text-primary"
                            )}
                        >
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
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary",
                                !scrolled && isHome ? "text-white/90 hover:text-white" : "text-muted-foreground"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Actions */}
                <div className="flex flex-1 items-center justify-end gap-2 md:gap-4">
                    <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(!scrolled && isHome && "text-white hover:bg-white/10 hover:text-white")}
                            >
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

                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(!scrolled && isHome && "text-white hover:bg-white/10 hover:text-white")}
                    >
                        <User className="h-5 w-5" />
                        <span className="sr-only">Account</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setOpen(true)}
                        className={cn("relative", !scrolled && isHome && "text-white hover:bg-white/10 hover:text-white")}
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
