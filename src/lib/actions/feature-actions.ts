"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ============== BLOG POSTS ==============

export async function getBlogPosts(options?: { status?: string; limit?: number }) {
    let query = supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (options?.status) {
        query = query.eq('status', options.status);
    }
    if (options?.limit) {
        query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) {
        console.error('Error fetching blog posts:', error);
        return [];
    }
    return data || [];
}

export async function getBlogPostBySlug(slug: string) {
    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) return null;
    return data;
}

export async function createBlogPost(input: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    featuredImage?: string;
    status: 'draft' | 'published';
    authorEmail?: string;
}) {
    const { data, error } = await supabase
        .from('blog_posts')
        .insert({
            title: input.title,
            slug: input.slug,
            content: input.content,
            excerpt: input.excerpt,
            featured_image: input.featuredImage,
            status: input.status,
            author_email: input.authorEmail,
            published_at: input.status === 'published' ? new Date().toISOString() : null,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating blog post:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/blog');
    revalidatePath('/blog');
    return { success: true, post: data };
}

export async function updateBlogPost(id: string, input: {
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    featuredImage?: string;
    status?: 'draft' | 'published';
}) {
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (input.title) updateData.title = input.title;
    if (input.slug) updateData.slug = input.slug;
    if (input.content) updateData.content = input.content;
    if (input.excerpt !== undefined) updateData.excerpt = input.excerpt;
    if (input.featuredImage !== undefined) updateData.featured_image = input.featuredImage;
    if (input.status) {
        updateData.status = input.status;
        if (input.status === 'published') {
            updateData.published_at = new Date().toISOString();
        }
    }

    const { error } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/blog');
    revalidatePath('/blog');
    return { success: true };
}

export async function deleteBlogPost(id: string) {
    const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/blog');
    revalidatePath('/blog');
    return { success: true };
}

// ============== PRODUCT REVIEWS ==============

export async function getProductReviews(productId?: string, options?: { status?: string; limit?: number }) {
    let query = supabase
        .from('product_reviews')
        .select('*, product:products(name, slug)')
        .order('created_at', { ascending: false });

    if (productId) {
        query = query.eq('product_id', productId);
    }
    if (options?.status) {
        query = query.eq('status', options.status);
    }
    if (options?.limit) {
        query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) {
        console.error('Error fetching reviews:', error);
        return [];
    }
    return data || [];
}

export async function createProductReview(input: {
    productId: string;
    customerEmail: string;
    customerName: string;
    rating: number;
    title?: string;
    content: string;
}) {
    const { data, error } = await supabase
        .from('product_reviews')
        .insert({
            product_id: input.productId,
            customer_email: input.customerEmail,
            customer_name: input.customerName,
            rating: input.rating,
            title: input.title,
            content: input.content,
            status: 'pending', // Reviews need approval
        })
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/reviews');
    return { success: true, review: data };
}

export async function updateReviewStatus(id: string, status: 'pending' | 'approved' | 'rejected') {
    const { error } = await supabase
        .from('product_reviews')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/reviews');
    return { success: true };
}

// ============== NEWSLETTER ==============

export async function getNewsletterSubscribers(options?: { limit?: number }) {
    let query = supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false });

    if (options?.limit) {
        query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) {
        console.error('Error fetching subscribers:', error);
        return [];
    }
    return data || [];
}

export async function subscribeToNewsletter(email: string, source?: string) {
    // Check if already subscribed
    const { data: existing } = await supabase
        .from('newsletter_subscribers')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

    if (existing) {
        return { success: true, message: 'Already subscribed' };
    }

    const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({
            email: email.toLowerCase(),
            source: source || 'website',
            is_active: true,
        });

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/newsletter');
    return { success: true, message: 'Successfully subscribed!' };
}

export async function unsubscribeFromNewsletter(email: string) {
    const { error } = await supabase
        .from('newsletter_subscribers')
        .update({ is_active: false, unsubscribed_at: new Date().toISOString() })
        .eq('email', email.toLowerCase());

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}

// ============== GIFT CARDS ==============

export async function getGiftCards(options?: { status?: string; limit?: number }) {
    let query = supabase
        .from('gift_cards')
        .select('*')
        .order('created_at', { ascending: false });

    if (options?.status) {
        query = query.eq('status', options.status);
    }
    if (options?.limit) {
        query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) {
        console.error('Error fetching gift cards:', error);
        return [];
    }
    return data || [];
}

export async function createGiftCard(input: {
    initialBalance: number;
    recipientEmail?: string;
    senderName?: string;
    message?: string;
}) {
    const code = generateGiftCardCode();

    const { data, error } = await supabase
        .from('gift_cards')
        .insert({
            code,
            initial_balance_minor: Math.round(input.initialBalance * 100),
            current_balance_minor: Math.round(input.initialBalance * 100),
            recipient_email: input.recipientEmail,
            sender_name: input.senderName,
            message: input.message,
            status: 'active',
        })
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/gift-cards');
    return { success: true, giftCard: data };
}

export async function redeemGiftCard(code: string, amount: number) {
    // Get the gift card
    const { data: card } = await supabase
        .from('gift_cards')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('status', 'active')
        .single();

    if (!card) {
        return { success: false, error: 'Invalid or inactive gift card' };
    }

    const amountMinor = Math.round(amount * 100);
    if (card.current_balance_minor < amountMinor) {
        return { success: false, error: 'Insufficient balance' };
    }

    const newBalance = card.current_balance_minor - amountMinor;

    const { error } = await supabase
        .from('gift_cards')
        .update({
            current_balance_minor: newBalance,
            status: newBalance === 0 ? 'depleted' : 'active',
            last_used_at: new Date().toISOString(),
        })
        .eq('id', card.id);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, remainingBalance: newBalance / 100 };
}

function generateGiftCardCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 16; i++) {
        if (i > 0 && i % 4 === 0) code += '-';
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

// ============== LOYALTY POINTS ==============

export async function getCustomerLoyalty(customerId: string) {
    const { data, error } = await supabase
        .from('customer_loyalty')
        .select('*')
        .eq('customer_id', customerId)
        .single();

    if (error) return null;
    return data;
}

export async function addLoyaltyPoints(customerId: string, points: number, reason: string) {
    // Get or create loyalty record
    let { data: loyalty } = await supabase
        .from('customer_loyalty')
        .select('*')
        .eq('customer_id', customerId)
        .single();

    if (!loyalty) {
        const { data: newLoyalty, error: createError } = await supabase
            .from('customer_loyalty')
            .insert({
                customer_id: customerId,
                points_balance: 0,
                lifetime_points: 0,
                tier: 'bronze',
            })
            .select()
            .single();

        if (createError) {
            return { success: false, error: createError.message };
        }
        loyalty = newLoyalty;
    }

    // Update points
    const newBalance = (loyalty.points_balance || 0) + points;
    const newLifetime = (loyalty.lifetime_points || 0) + (points > 0 ? points : 0);

    // Determine tier based on lifetime points
    let tier = 'bronze';
    if (newLifetime >= 10000) tier = 'platinum';
    else if (newLifetime >= 5000) tier = 'gold';
    else if (newLifetime >= 1000) tier = 'silver';

    const { error } = await supabase
        .from('customer_loyalty')
        .update({
            points_balance: newBalance,
            lifetime_points: newLifetime,
            tier,
            updated_at: new Date().toISOString(),
        })
        .eq('customer_id', customerId);

    if (error) {
        return { success: false, error: error.message };
    }

    // Log the transaction
    await supabase.from('loyalty_transactions').insert({
        customer_id: customerId,
        points,
        reason,
        balance_after: newBalance,
    });

    return { success: true, newBalance, tier };
}

// ============== POS SESSION ==============

export async function createPosSession(staffEmail: string) {
    const { data, error } = await supabase
        .from('pos_sessions')
        .insert({
            staff_email: staffEmail,
            status: 'open',
            opened_at: new Date().toISOString(),
            starting_cash_minor: 0,
        })
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, session: data };
}

export async function closePosSession(sessionId: string, closingCash: number) {
    const { error } = await supabase
        .from('pos_sessions')
        .update({
            status: 'closed',
            closed_at: new Date().toISOString(),
            closing_cash_minor: Math.round(closingCash * 100),
        })
        .eq('id', sessionId);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function getActivePosSession(staffEmail: string) {
    const { data } = await supabase
        .from('pos_sessions')
        .select('*')
        .eq('staff_email', staffEmail)
        .eq('status', 'open')
        .single();

    return data;
}
