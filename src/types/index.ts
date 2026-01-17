export interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number;
    image: string;
    category: string;
    isNew?: boolean;
    isSale?: boolean;
    isBestSeller?: boolean;
    rating?: number;
    reviewCount?: number;
    description?: string;
    inventory_count?: number;
}

export interface Collection {
    id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
}

export interface Order {
    id: string;
    created_at: string;
    user_email: string;
    status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
    total: number;
    shipping_address: {
        name: string;
        email: string;
        address: string;
        city: string;
        region?: string;
        phone: string;
    };
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    price_at_time: number;
    selected_variant: {
        size?: string;
        color?: string;
    };
}
