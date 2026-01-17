"use server";

import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { toMinorUnits, calculateOrderTotals } from '@/lib/money';

// Use untyped client for new tables not in the type definitions yet
const supabaseUntyped = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Validation schemas
const CartItemSchema = z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number().int().positive(),
    image: z.string().optional(),
    selectedSize: z.string().optional(),
    selectedColor: z.string().optional(),
    variantId: z.string().optional(),
});

const ShippingAddressSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(10, 'Valid phone number is required'),
    address: z.string().min(5, 'Address is required'),
    city: z.string().min(2, 'City is required'),
    region: z.string().optional(),
    country: z.string().default('GH'),
});

const CreateOrderSchema = z.object({
    items: z.array(CartItemSchema).min(1, 'Cart cannot be empty'),
    shippingAddress: ShippingAddressSchema,
    couponCode: z.string().optional(),
    shippingRateId: z.string().optional(),
    notes: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

interface CreateOrderResult {
    success: boolean;
    orderId?: string;
    totals?: {
        subtotalMinor: number;
        shippingMinor: number;
        discountMinor: number;
        taxMinor: number;
        totalMinor: number;
    };
    error?: string;
}

/**
 * Create an order with server-side total calculation
 */
export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    // Validate input
    const validated = CreateOrderSchema.safeParse(input);
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message };
    }

    const { items, shippingAddress, couponCode, shippingRateId, notes } = validated.data;

    try {
        // Calculate subtotal from product prices (server-side verification)
        let subtotalMinor = 0;
        const verifiedItems: Array<{
            productId: string;
            variantId: string | null;
            productName: string;
            variantName: string | null;
            quantity: number;
            priceMinor: number;
        }> = [];

        for (const item of items) {
            // Verify product exists and get current price
            const { data: productData, error: productError } = await supabaseAdmin
                .from('products')
                .select('id, name, price, price_minor, is_active')
                .eq('id', item.id)
                .single();

            const product = productData as {
                id: string;
                name: string;
                price: number;
                price_minor: number | null;
                is_active: boolean;
            } | null;

            if (productError || !product) {
                return { success: false, error: `Product not found: ${item.name}` };
            }

            if (!product.is_active) {
                return { success: false, error: `Product is no longer available: ${item.name}` };
            }

            // Use price_minor if available, otherwise convert
            const priceMinor = product.price_minor || toMinorUnits(product.price);
            const itemTotal = priceMinor * item.quantity;
            subtotalMinor += itemTotal;

            let variantName: string | null = null;
            if (item.selectedSize || item.selectedColor) {
                const parts = [];
                if (item.selectedSize) parts.push(item.selectedSize);
                if (item.selectedColor) parts.push(item.selectedColor);
                variantName = parts.join(' / ');
            }

            verifiedItems.push({
                productId: product.id,
                variantId: item.variantId || null,
                productName: product.name,
                variantName,
                quantity: item.quantity,
                priceMinor,
            });
        }

        // Get shipping rate
        let shippingMinor = 2500; // Default ₵25.00
        if (shippingRateId) {
            const { data: rateData } = await supabaseUntyped
                .from('shipping_rates')
                .select('price_minor, free_above_minor')
                .eq('id', shippingRateId)
                .single();
            const rate = rateData as { price_minor: number; free_above_minor?: number } | null;

            if (rate) {
                shippingMinor = rate.price_minor;
                // Check free shipping threshold
                if (rate.free_above_minor && subtotalMinor >= rate.free_above_minor) {
                    shippingMinor = 0;
                }
            }
        } else {
            // Check default free shipping threshold (₵500)
            if (subtotalMinor >= 50000) {
                shippingMinor = 0;
            }
        }

        // Apply coupon if provided
        let discountMinor = 0;
        let validatedCouponCode: string | null = null;

        if (couponCode) {
            const { data: couponResult } = await supabaseUntyped
                .rpc('validate_coupon', {
                    p_code: couponCode.toUpperCase(),
                    p_order_subtotal_minor: subtotalMinor,
                    p_customer_email: shippingAddress.email,
                });

            if (couponResult && couponResult.length > 0 && couponResult[0].valid) {
                const coupon = couponResult[0];
                validatedCouponCode = couponCode.toUpperCase();

                if (coupon.discount_type === 'percentage') {
                    discountMinor = Math.round((subtotalMinor * coupon.discount_value) / 100);
                    if (coupon.max_discount_minor && discountMinor > coupon.max_discount_minor) {
                        discountMinor = coupon.max_discount_minor;
                    }
                } else {
                    discountMinor = coupon.discount_value;
                }

                // Free shipping from coupon
                if (coupon.free_shipping) {
                    shippingMinor = 0;
                }
            }
        }

        // Get store settings for tax
        const { data: settingsData } = await supabaseUntyped
            .from('store_settings')
            .select('tax_rate, tax_included')
            .single();
        const settings = settingsData as { tax_rate?: number; tax_included?: boolean } | null;

        const taxRate = settings?.tax_rate || 0;
        const taxIncluded = settings?.tax_included ?? true;

        // Calculate totals
        const totals = calculateOrderTotals(
            subtotalMinor,
            shippingMinor,
            discountMinor,
            taxRate / 100, // Convert from basis points
            taxIncluded
        );

        // Create the order
        // Create the order
        const { data: orderData, error: orderError } = await supabaseUntyped
            .from('orders')
            .insert({
                user_email: shippingAddress.email,
                status: 'pending',
                total: totals.totalMinor / 100, // Legacy field
                total_minor: totals.totalMinor,
                subtotal_minor: totals.subtotalMinor,
                shipping_minor: totals.shippingMinor,
                discount_minor: totals.discountMinor,
                tax_minor: totals.taxMinor,
                currency: 'GHS',
                shipping_address: shippingAddress,
                coupon_code: validatedCouponCode,
                notes,
            })
            .select()
            .single();

        const order = orderData as { id: string } | null;

        if (orderError || !order) {
            console.error('Error creating order:', orderError);
            return { success: false, error: 'Failed to create order' };
        }

        // Create order items
        const orderItems = verifiedItems.map((item) => ({
            order_id: order.id,
            product_id: item.productId,
            variant_id: item.variantId,
            product_name: item.productName,
            variant_name: item.variantName,
            quantity: item.quantity,
            price_at_time: item.priceMinor / 100, // Legacy field
            price_minor: item.priceMinor,
            selected_variant: {
                size: items.find(i => i.id === item.productId)?.selectedSize,
                color: items.find(i => i.id === item.productId)?.selectedColor,
            },
        }));

        const { error: itemsError } = await supabaseUntyped
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            console.error('Error creating order items:', itemsError);
            // Order was created, but items failed - should ideally rollback
            return { success: false, error: 'Failed to create order items' };
        }

        // Record coupon usage
        if (validatedCouponCode) {
            const { data: couponData } = await supabaseUntyped
                .from('coupons')
                .select('id')
                .eq('code', validatedCouponCode)
                .single();

            const couponId = (couponData as { id: string } | null)?.id;
            if (couponId) {
                await supabaseUntyped.from('coupon_usage').insert({
                    coupon_id: couponId,
                    order_id: order.id,
                    customer_email: shippingAddress.email,
                    discount_minor: discountMinor,
                });

                // Note: usage_count is automatically maintained by the coupon_usage trigger
            }
        }

        return {
            success: true,
            orderId: order.id,
            totals,
        };
    } catch (error) {
        console.error('Create order error:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

/**
 * Get order by ID
 */
export async function getOrder(orderId: string) {
    const { data: order, error } = await supabaseUntyped
        .from('orders')
        .select(`
            *,
            order_items (*)
        `)
        .eq('id', orderId)
        .single();

    if (error) {
        console.error('Error fetching order:', error);
        return null;
    }

    return order;
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId: string, status: string, internalNotes?: string) {
    const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
        return { success: false, error: 'Invalid status' };
    }

    const updateData: Record<string, unknown> = { status };
    if (internalNotes !== undefined) {
        updateData.internal_notes = internalNotes;
    }

    const { error } = await supabaseUntyped
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

    if (error) {
        console.error('Error updating order status:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Get all orders for admin
 */
export async function getOrders(options?: {
    status?: string;
    limit?: number;
    offset?: number;
}) {
    let query = supabaseUntyped
        .from('orders')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

    if (options?.status) {
        query = query.eq('status', options.status);
    }

    if (options?.limit) {
        query = query.limit(options.limit);
    }

    if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching orders:', error);
        return { orders: [], count: 0 };
    }

    return { orders: data || [], count: count || 0 };
}
