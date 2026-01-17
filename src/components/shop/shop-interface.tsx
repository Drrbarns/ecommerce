"use client";

import { useState, useMemo, useEffect } from "react";
import { Product, Collection } from "@/types";
import { ProductCard } from "@/components/shared/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useSearchParams, useRouter } from "next/navigation";

interface ShopInterfaceProps {
    initialProducts: Product[];
    collections: Collection[];
}

type SortOption = "featured" | "price-asc" | "price-desc" | "newest" | "name-asc";

export function ShopInterface({ initialProducts, collections }: ShopInterfaceProps) {
    const searchParams = useSearchParams();
    const router = useRouter();

    // -- State --
    const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
    const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]); // Dynamic max?
    const [maxPrice, setMaxPrice] = useState(1000);
    const [sortOption, setSortOption] = useState<SortOption>("featured");
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    // -- Derived State (Max Price) --
    useEffect(() => {
        if (initialProducts.length > 0) {
            const max = Math.max(...initialProducts.map(p => p.price));
            const roundedMax = Math.ceil(max / 50) * 50; // Round up to nearest 50
            setMaxPrice(roundedMax);
            setPriceRange([0, roundedMax]);
        }
    }, [initialProducts]);

    // -- Filtering Logic --
    const filteredProducts = useMemo(() => {
        return initialProducts.filter(product => {
            // Search
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                if (!product.name.toLowerCase().includes(q) && !product.description?.toLowerCase().includes(q)) {
                    return false;
                }
            }
            // Collections
            if (selectedCollections.length > 0) {
                // Assuming product.category matches collection slug or name
                // Checking strictly against slug might be safer if product.category is slug.
                // Let's relax it to check for partial match if needed, but usually strict match.
                // Assuming product.category stores the category name or slug.
                // Let's try matching name or slug.
                const productCat = product.category?.toLowerCase();
                const matches = collections.some(c =>
                    selectedCollections.includes(c.id) &&
                    (productCat === c.slug.toLowerCase() || productCat === c.name.toLowerCase())
                );
                // Fallback: if product.category is just a string not linked to ID, we might need to filter by names directly.
                // For this implementation, I'll assume we filter by matching IDs to Category Names if product.category IS the category name.
                // Actually safer: check if product.category is in the set of Selected Collection Names/Slugs.

                // Let's map selected IDs to slugs/names
                const selectedSlugs = collections.filter(c => selectedCollections.includes(c.id)).map(c => c.slug);
                if (!selectedSlugs.includes(product.category)) return false;
            }

            // Price
            if (product.price < priceRange[0] || product.price > priceRange[1]) {
                return false;
            }

            return true;
        }).sort((a, b) => {
            switch (sortOption) {
                case "price-asc": return a.price - b.price;
                case "price-desc": return b.price - a.price;
                case "newest": return (new Date(b.isNew ? 1 : 0).getTime() - new Date(a.isNew ? 1 : 0).getTime()) || 0; // Rough "newest" by tag or use created_at if available
                case "name-asc": return a.name.localeCompare(b.name);
                default: return 0; // Featured (original order or special field)
            }
        });
    }, [initialProducts, searchQuery, selectedCollections, priceRange, sortOption, collections]);

    // -- Handlers --
    const toggleCollection = (id: string) => {
        setSelectedCollections(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedCollections([]);
        setPriceRange([0, maxPrice]);
        setSortOption("featured");
    };

    // -- Render Components --
    const FilterSidebar = () => (
        <div className="space-y-8">
            {/* Search */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">Search</Label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Categories */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">Categories</Label>
                <div className="space-y-2">
                    {collections.map(col => (
                        <div key={col.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={`cat-${col.id}`}
                                checked={selectedCollections.includes(col.id)}
                                onCheckedChange={() => toggleCollection(col.id)}
                            />
                            <Label
                                htmlFor={`cat-${col.id}`}
                                className="text-sm font-normal cursor-pointer hover:text-primary transition-colors"
                            >
                                {col.name}
                            </Label>
                        </div>
                    ))}
                    {collections.length === 0 && (
                        <p className="text-sm text-muted-foreground">No categories found.</p>
                    )}
                </div>
            </div>

            {/* Price Range */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Price Range</Label>
                    <span className="text-sm text-muted-foreground">
                        ₵{priceRange[0]} - ₵{priceRange[1]}
                    </span>
                </div>
                <Slider
                    defaultValue={[0, maxPrice]}
                    value={[priceRange[0], priceRange[1]]}
                    max={maxPrice}
                    step={10}
                    onValueChange={(val) => setPriceRange([val[0], val[1]])}
                    className="py-4"
                />
            </div>

            {/* Clear Button */}
            <Button
                variant="outline"
                className="w-full"
                onClick={clearFilters}
                disabled={!searchQuery && selectedCollections.length === 0 && priceRange[0] === 0 && priceRange[1] === maxPrice}
            >
                Clear All Filters
            </Button>
        </div>
    );

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0 space-y-8 sticky top-24 h-fit">
                <FilterSidebar />
            </aside>

            {/* Mobile Filters Trigger */}
            <div className="lg:hidden mb-6">
                <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="w-full">
                            <SlidersHorizontal className="mr-2 h-4 w-4" />
                            Filters & Search
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="overflow-y-auto w-[300px]">
                        <SheetHeader className="mb-6">
                            <SheetTitle>Filters</SheetTitle>
                        </SheetHeader>
                        <FilterSidebar />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Product Grid Area */}
            <div className="flex-1">
                {/* Sort & Count Header */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                    <p className="text-sm text-muted-foreground">
                        Showing <span className="font-medium text-foreground">{filteredProducts.length}</span> results
                    </p>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
                        <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="featured">Featured</SelectItem>
                                <SelectItem value="newest">Newest Arrivals</SelectItem>
                                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                                <SelectItem value="name-asc">Name: A-Z</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Grid */}
                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-secondary/10">
                        <Search className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-lg font-medium">No products found</h3>
                        <p className="text-muted-foreground max-w-xs mt-2">
                            Try adjusting your filters or search query to find what you're looking for.
                        </p>
                        <Button variant="link" onClick={clearFilters} className="mt-4">
                            Clear all filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
