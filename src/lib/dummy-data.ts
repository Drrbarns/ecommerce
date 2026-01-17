import { Product } from "@/types";

export const products: Product[] = [
    {
        id: "1",
        name: "Premium Leather Traveler",
        slug: "premium-leather-traveler",
        price: 1250.00,
        compareAtPrice: 1500.00,
        image: "https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=2670&auto=format&fit=crop",
        category: "Bags",
        isNew: true,
        isBestSeller: true,
        rating: 4.8,
        reviewCount: 124
    },
    {
        id: "2",
        name: "Minimalist Chronograph",
        slug: "minimalist-chronograph",
        price: 3500.00,
        image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=2599&auto=format&fit=crop",
        category: "Watches",
        isSale: true,
        rating: 4.9,
        reviewCount: 89
    },
    {
        id: "3",
        name: "Sonic Noise-Cancelling Headphones",
        slug: "sonic-headphones",
        price: 2800.00,
        compareAtPrice: 3200.00,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2670&auto=format&fit=crop",
        category: "Electronics",
        rating: 4.7,
        reviewCount: 230
    },
    {
        id: "4",
        name: "Modern Running Sneakers",
        slug: "modern-running-sneakers",
        price: 950.00,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2670&auto=format&fit=crop",
        category: "Footwear",
        isBestSeller: true,
        rating: 4.6,
        reviewCount: 450
    },
    {
        id: "5",
        name: "Essential Cotton Crew",
        slug: "essential-cotton-crew",
        price: 150.00,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2680&auto=format&fit=crop",
        category: "Apparel",
        isNew: true,
        rating: 4.5,
        reviewCount: 67
    },
    {
        id: "6",
        name: "Smart Fitness Tracker",
        slug: "smart-fitness-tracker",
        price: 450.00,
        compareAtPrice: 600.00,
        image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?q=80&w=2688&auto=format&fit=crop",
        category: "Electronics",
        isSale: true,
        rating: 4.2,
        reviewCount: 34
    }
];

export const collections = [
    {
        id: "1",
        name: "New Arrivals",
        description: "The latest drop of premium essentials.",
        slug: "new-arrivals",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2670&auto=format&fit=crop"
    },
    {
        id: "2",
        name: "Best Sellers",
        description: "Our most loved pieces this season.",
        slug: "best-sellers",
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2670&auto=format&fit=crop"
    },
    {
        id: "3",
        name: "Accessories",
        description: "Finishing touches for your everyday carry.",
        slug: "accessories",
        image: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?q=80&w=2193&auto=format&fit=crop"
    }
];
