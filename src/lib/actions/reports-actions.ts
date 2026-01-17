"use server";

import { createClient } from '@supabase/supabase-js';
import { fromMinorUnits } from '@/lib/money';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface DateRange {
    start: Date;
    end: Date;
}

/**
 * Get sales summary for date range
 */
export async function getSalesSummary(dateRange: DateRange) {
    const { data, error } = await supabase
        .from('sales_daily')
        .select('*')
        .gte('date', dateRange.start.toISOString().split('T')[0])
        .lte('date', dateRange.end.toISOString().split('T')[0])
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching sales summary:', error);
        return {
            revenue: 0,
            orderCount: 0,
            avgOrderValue: 0,
            trend: '+0%',
        };
    }

    const totals = data.reduce(
        (acc, day) => ({
            revenue: acc.revenue + (day.revenue_minor || 0),
            orders: acc.orders + (day.order_count || 0),
        }),
        { revenue: 0, orders: 0 }
    );

    const avgOrderValue = totals.orders > 0 ? totals.revenue / totals.orders : 0;

    // Calculate trend (compare to previous period)
    const periodDays = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const prevStart = new Date(dateRange.start);
    prevStart.setDate(prevStart.getDate() - periodDays);

    const { data: prevData } = await supabase
        .from('sales_daily')
        .select('revenue_minor')
        .gte('date', prevStart.toISOString().split('T')[0])
        .lt('date', dateRange.start.toISOString().split('T')[0]);

    const prevRevenue = prevData?.reduce((sum, day) => sum + (day.revenue_minor || 0), 0) || 0;
    const trendPercent = prevRevenue > 0 ? ((totals.revenue - prevRevenue) / prevRevenue) * 100 : 0;
    const trend = trendPercent >= 0 ? `+${trendPercent.toFixed(1)}%` : `${trendPercent.toFixed(1)}%`;

    return {
        revenue: totals.revenue,
        orderCount: totals.orders,
        avgOrderValue: Math.round(avgOrderValue),
        trend,
    };
}

/**
 * Get top products by revenue
 */
export async function getTopProducts(limit = 10) {
    const { data, error } = await supabase
        .from('top_products')
        .select('*')
        .limit(limit);

    if (error) {
        console.error('Error fetching top products:', error);
        return { products: [] };
    }

    return {
        products: (data || []).map(p => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            image: p.image,
            orderCount: p.order_count,
            unitsSold: p.units_sold,
            revenue: fromMinorUnits(p.revenue_minor),
            revenueMinor: p.revenue_minor,
        })),
    };
}

/**
 * Get payment health metrics
 */
export async function getPaymentHealth() {
    const { data, error } = await supabase
        .from('payment_health')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

    if (error) {
        console.error('Error fetching payment health:', error);
        return {
            successRate: 0,
            failedCount: 0,
        };
    }

    // Aggregate across all providers for the period
    const totals = (data || []).reduce(
        (acc, day) => ({
            total: acc.total + (day.total_intents || 0),
            succeeded: acc.succeeded + (day.succeeded_count || 0),
            failed: acc.failed + (day.failed_count || 0),
        }),
        { total: 0, succeeded: 0, failed: 0 }
    );

    const successRate = totals.total > 0 ? (totals.succeeded / totals.total) * 100 : 0;

    return {
        successRate: Math.round(successRate * 10) / 10,
        failedCount: totals.failed,
        totalIntents: totals.total,
        lastWebhookSeen: data[0]?.date || null,
    };
}

/**
 * Get fulfillment status counts
 */
export async function getFulfillmentStatus() {
    const { data, error } = await supabase
        .from('fulfillment_summary')
        .select('*')
        .single();

    if (error) {
        console.error('Error fetching fulfillment status:', error);
        return {
            unfulfilled: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0,
            refunded: 0,
        };
    }

    return {
        unfulfilled: data.unfulfilled || 0,
        processing: data.processing || 0,
        shipped: data.shipped || 0,
        delivered: data.delivered || 0,
        cancelled: data.cancelled || 0,
        refunded: data.refunded || 0,
    };
}

/**
 * Get low stock items
 */
export async function getLowStockItems(limit = 20) {
    const { data, error } = await supabase
        .from('low_stock_items')
        .select('*')
        .limit(limit);

    if (error) {
        console.error('Error fetching low stock items:', error);
        return { items: [] };
    }

    return {
        items: (data || []).map(item => ({
            productId: item.product_id,
            productName: item.product_name,
            variantId: item.variant_id,
            variantName: item.variant_name,
            sku: item.sku,
            currentStock: item.current_stock,
            threshold: item.threshold,
            image: item.image,
        })),
    };
}

/**
 * Get recent activity feed (audit log + payment events)
 */
export async function getRecentActivity(limit = 10) {
    const { data: auditLogs, error: auditError } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (auditError) {
        console.error('Error fetching audit logs:', auditError);
        return { activities: [] };
    }

    const activities = (auditLogs || []).map(log => ({
        id: log.id,
        type: 'audit',
        title: log.action,
        description: `${log.resource_type} ${log.action.split('.')[1]}`,
        timestamp: log.created_at,
        staffEmail: log.staff_email,
        metadata: log.metadata,
    }));

    return { activities };
}

/**
 * Refresh analytics cache (call this periodically)
 */
export async function refreshAnalytics() {
    try {
        const { error } = await supabase.rpc('refresh_analytics_cache');

        if (error) {
            console.error('Error refreshing analytics:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Error refreshing analytics:', error);
        return { success: false, error: 'Failed to refresh analytics' };
    }
}

/**
 * Export orders to CSV
 */
export async function exportOrdersCSV(filters?: {
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
}) {
    let query = supabase
        .from('orders')
        .select('*, customer:customers(email, first_name, last_name), items:order_items(*)');

    if (filters?.status) {
        query = query.eq('status', filters.status);
    }

    if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom.toISOString());
    }

    if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo.toISOString());
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error exporting orders:', error);
        return { success: false, error: error.message };
    }

    // Generate CSV
    const headers = [
        'Order ID',
        'Date',
        'Customer Email',
        'Status',
        'Total',
        'Items Count',
        'Shipping Address',
    ];

    const rows = (data || []).map(order => [
        order.id,
        new Date(order.created_at).toLocaleDateString(),
        order.user_email,
        order.status,
        fromMinorUnits(order.total_minor || 0),
        order.items?.length || 0,
        order.shipping_address ? JSON.stringify(order.shipping_address) : '',
    ]);

    const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return {
        success: true,
        csv,
        filename: `orders_export_${new Date().toISOString().split('T')[0]}.csv`,
    };
}

/**
 * Get customer segments
 */
export async function getCustomerSegments() {
    // New customers (first order < 30 days ago)
    const { count: newCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    // High spenders (total_spent_minor > 100000 = GHS 1000)
    const { count: highSpenders } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .gte('total_spent_minor', 100000);

    // Inactive (no orders in last 90 days)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const { data: activeCustomerIds } = await supabase
        .from('orders')
        .select('customer_id')
        .gte('created_at', ninetyDaysAgo);

    const activeIds = new Set((activeCustomerIds || []).map(o => o.customer_id));

    const { count: totalCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

    return {
        new: newCustomers || 0,
        highSpenders: highSpenders || 0,
        inactive: Math.max(0, (totalCustomers || 0) - activeIds.size),
        total: totalCustomers || 0,
    };
}
