/**
 * Database type placeholders
 * In production, generate with: npx supabase gen types typescript
 */

export interface Database {
    public: {
        Tables: {
            products: {
                Row: {
                    id: string;
                    created_at: string;
                    updated_at: string | null;
                    name: string;
                    slug: string;
                    description: string | null;
                    price: number;
                    price_minor: number | null;
                    compare_at_price_minor: number | null;
                    image: string | null;
                    category: string | null;
                    category_id: string | null;
                    brand_id: string | null;
                    is_new: boolean;
                    is_sale: boolean;
                    is_featured: boolean;
                    is_active: boolean;
                    inventory_count: number;
                };
                Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['products']['Insert']>;
            };
            categories: {
                Row: {
                    id: string;
                    created_at: string;
                    updated_at: string;
                    name: string;
                    slug: string;
                    description: string | null;
                    image: string | null;
                    parent_id: string | null;
                    is_active: boolean;
                    sort_order: number;
                };
                Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['categories']['Insert']>;
            };
            brands: {
                Row: {
                    id: string;
                    created_at: string;
                    updated_at: string;
                    name: string;
                    slug: string;
                    description: string | null;
                    logo: string | null;
                    website: string | null;
                    is_active: boolean;
                };
                Insert: Omit<Database['public']['Tables']['brands']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['brands']['Insert']>;
            };
            collections: {
                Row: {
                    id: string;
                    created_at: string;
                    name: string;
                    slug: string;
                    description: string | null;
                    image: string | null;
                };
                Insert: Omit<Database['public']['Tables']['collections']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['collections']['Insert']>;
            };
            orders: {
                Row: {
                    id: string;
                    created_at: string;
                    user_email: string;
                    customer_id: string | null;
                    status: string;
                    total: number;
                    total_minor: number | null;
                    subtotal_minor: number | null;
                    shipping_minor: number | null;
                    discount_minor: number | null;
                    tax_minor: number | null;
                    currency: string;
                    shipping_address: Record<string, unknown> | null;
                    notes: string | null;
                    internal_notes: string | null;
                    coupon_code: string | null;
                };
                Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['orders']['Insert']>;
            };
            order_items: {
                Row: {
                    id: string;
                    order_id: string;
                    product_id: string;
                    variant_id: string | null;
                    quantity: number;
                    price_at_time: number;
                    price_minor: number | null;
                    product_name: string | null;
                    variant_name: string | null;
                    selected_variant: Record<string, unknown> | null;
                };
                Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id'>;
                Update: Partial<Database['public']['Tables']['order_items']['Insert']>;
            };
            customers: {
                Row: {
                    id: string;
                    created_at: string;
                    updated_at: string;
                    email: string;
                    first_name: string | null;
                    last_name: string | null;
                    phone: string | null;
                    accepts_marketing: boolean;
                    default_address: Record<string, unknown> | null;
                    notes: string | null;
                    tags: string[] | null;
                    total_spent_minor: number;
                    order_count: number;
                };
                Insert: Omit<Database['public']['Tables']['customers']['Row'], 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['customers']['Insert']>;
            };
            coupons: {
                Row: {
                    id: string;
                    created_at: string;
                    updated_at: string;
                    code: string;
                    description: string | null;
                    discount_type: 'percentage' | 'fixed';
                    discount_value: number;
                    min_order_minor: number;
                    max_discount_minor: number | null;
                    usage_limit: number | null;
                    usage_count: number;
                    usage_limit_per_customer: number;
                    starts_at: string;
                    expires_at: string | null;
                    is_active: boolean;
                    applies_to: 'all' | 'products' | 'categories';
                    product_ids: string[] | null;
                    category_ids: string[] | null;
                    first_order_only: boolean;
                    free_shipping: boolean;
                };
                Insert: Omit<Database['public']['Tables']['coupons']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['coupons']['Insert']>;
            };
            shipping_zones: {
                Row: {
                    id: string;
                    created_at: string;
                    updated_at: string;
                    name: string;
                    countries: string[];
                    regions: string[] | null;
                    is_active: boolean;
                };
                Insert: Omit<Database['public']['Tables']['shipping_zones']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['shipping_zones']['Insert']>;
            };
            shipping_rates: {
                Row: {
                    id: string;
                    created_at: string;
                    updated_at: string;
                    zone_id: string;
                    name: string;
                    description: string | null;
                    price_minor: number;
                    min_order_minor: number;
                    max_order_minor: number | null;
                    free_above_minor: number | null;
                    estimated_days_min: number | null;
                    estimated_days_max: number | null;
                    is_active: boolean;
                    sort_order: number;
                };
                Insert: Omit<Database['public']['Tables']['shipping_rates']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['shipping_rates']['Insert']>;
            };
            payment_intents: {
                Row: {
                    id: string;
                    created_at: string;
                    updated_at: string;
                    order_id: string | null;
                    customer_id: string | null;
                    provider: string;
                    provider_reference: string | null;
                    amount_minor: number;
                    currency: string;
                    status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded';
                    metadata: Record<string, unknown>;
                    client_secret: string | null;
                    redirect_url: string | null;
                    callback_url: string | null;
                    expires_at: string;
                    idempotency_key: string | null;
                };
                Insert: Omit<Database['public']['Tables']['payment_intents']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['payment_intents']['Insert']>;
            };
            payment_events: {
                Row: {
                    id: string;
                    created_at: string;
                    payment_intent_id: string | null;
                    provider: string;
                    event_type: string;
                    provider_event_id: string | null;
                    payload: Record<string, unknown>;
                    processed: boolean;
                    error_message: string | null;
                };
                Insert: Omit<Database['public']['Tables']['payment_events']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['payment_events']['Insert']>;
            };
            store_settings: {
                Row: {
                    id: string;
                    created_at: string;
                    updated_at: string;
                    name: string;
                    tagline: string | null;
                    description: string | null;
                    logo: string | null;
                    favicon: string | null;
                    email: string | null;
                    phone: string | null;
                    whatsapp: string | null;
                    address: Record<string, unknown> | null;
                    social_links: Record<string, unknown>;
                    seo_title: string | null;
                    seo_description: string | null;
                    seo_image: string | null;
                    currency: string;
                    currency_symbol: string;
                    country: string;
                    timezone: string;
                    guest_checkout_enabled: boolean;
                    tax_rate: number;
                    tax_included: boolean;
                    default_shipping_zone_id: string | null;
                    google_analytics_id: string | null;
                    facebook_pixel_id: string | null;
                    order_notification_email: string | null;
                    low_stock_threshold: number;
                };
                Insert: Omit<Database['public']['Tables']['store_settings']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['store_settings']['Insert']>;
            };
            staff_members: {
                Row: {
                    id: string;
                    created_at: string;
                    updated_at: string;
                    user_id: string | null;
                    email: string;
                    first_name: string | null;
                    last_name: string | null;
                    role: 'owner' | 'admin' | 'staff';
                    permissions: Record<string, unknown>;
                    is_active: boolean;
                    last_login: string | null;
                    avatar: string | null;
                };
                Insert: Omit<Database['public']['Tables']['staff_members']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['staff_members']['Insert']>;
            };
            audit_logs: {
                Row: {
                    id: string;
                    created_at: string;
                    staff_id: string | null;
                    staff_email: string | null;
                    action: string;
                    resource_type: string;
                    resource_id: string | null;
                    changes: Record<string, unknown> | null;
                    metadata: Record<string, unknown>;
                    ip_address: string | null;
                    user_agent: string | null;
                };
                Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>;
            };
            newsletter_subscribers: {
                Row: {
                    id: string;
                    created_at: string;
                    email: string;
                    is_subscribed: boolean;
                    source: string;
                    unsubscribed_at: string | null;
                };
                Insert: Omit<Database['public']['Tables']['newsletter_subscribers']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['newsletter_subscribers']['Insert']>;
            };
            reviews: {
                Row: {
                    id: string;
                    created_at: string;
                    updated_at: string;
                    product_id: string;
                    customer_id: string | null;
                    order_id: string | null;
                    customer_name: string | null;
                    customer_email: string | null;
                    rating: number;
                    title: string | null;
                    content: string | null;
                    is_verified_purchase: boolean;
                    is_approved: boolean;
                    is_featured: boolean;
                };
                Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
            };
        };
        Functions: {
            validate_coupon: {
                Args: {
                    p_code: string;
                    p_order_subtotal_minor: number;
                    p_customer_id?: string;
                    p_customer_email?: string;
                };
                Returns: {
                    valid: boolean;
                    coupon_id: string | null;
                    discount_type: string | null;
                    discount_value: number | null;
                    max_discount_minor: number | null;
                    free_shipping: boolean;
                    error_message: string | null;
                }[];
            };
        };
    };
}

// Re-export types for convenience
export type Tables = Database['public']['Tables'];
export type Product = Tables['products']['Row'];
export type Category = Tables['categories']['Row'];
export type Brand = Tables['brands']['Row'];
export type Order = Tables['orders']['Row'];
export type OrderItem = Tables['order_items']['Row'];
export type Customer = Tables['customers']['Row'];
export type Coupon = Tables['coupons']['Row'];
export type ShippingZone = Tables['shipping_zones']['Row'];
export type ShippingRate = Tables['shipping_rates']['Row'];
export type PaymentIntent = Tables['payment_intents']['Row'];
export type StoreSettings = Tables['store_settings']['Row'];
export type StaffMember = Tables['staff_members']['Row'];
export type AuditLog = Tables['audit_logs']['Row'];
export type Review = Tables['reviews']['Row'];
