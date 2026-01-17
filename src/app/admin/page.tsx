import { DollarSign, Package, ShoppingCart, TrendingUp, AlertTriangle, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSalesSummary, getPaymentHealth, getFulfillmentStatus, getLowStockItems, getTopProducts, getRecentActivity } from "@/lib/actions/reports-actions";
import { fromMinorUnits } from "@/lib/money";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DashboardRefresh } from "@/components/admin/dashboard-refresh";

interface StatCardProps {
    title: string;
    value: string;
    description: string;
    icon: React.ReactNode;
    trend?: string;
    href?: string;
}

function StatCard({ title, value, description, icon, trend, href }: StatCardProps) {
    const content = (
        <Card className={href ? "cursor-pointer hover:bg-accent/50 transition-colors" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                    {trend && <span className={trend.startsWith('+') ? "text-green-600 font-medium" : trend.startsWith('-') ? "text-red-600 font-medium" : ""}>{trend}</span>} {description}
                </p>
            </CardContent>
        </Card>
    );

    return href ? <Link href={href}>{content}</Link> : content;
}

async function getThirtyDaysAgo() {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
}

export default async function AdminDashboardPage() {
    const thirtyDaysAgo = await getThirtyDaysAgo();
    const now = new Date();

    const [salesData, paymentHealth, fulfillmentCounts, lowStockItems, topProducts, recentActivity] = await Promise.all([
        getSalesSummary({ start: thirtyDaysAgo, end: now }),
        getPaymentHealth(),
        getFulfillmentStatus(),
        getLowStockItems(10),
        getTopProducts(5),
        getRecentActivity(10),
    ]);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome back! Here&apos;s what&apos;s happening with your store.
                    </p>
                </div>
                <DashboardRefresh />
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Revenue (30d)"
                    value={`₵${fromMinorUnits(salesData.revenue)}`}
                    description="from last month"
                    icon={<DollarSign className="h-4 w-4" />}
                    trend={salesData.trend}
                    href="/admin/orders?status=paid"
                />
                <StatCard
                    title="Orders"
                    value={salesData.orderCount.toString()}
                    description="paid orders"
                    icon={<ShoppingCart className="h-4 w-4" />}
                    href="/admin/orders"
                />
                <StatCard
                    title="Average Order"
                    value={`₵${fromMinorUnits(salesData.avgOrderValue)}`}
                    description="per transaction"
                    icon={<TrendingUp className="h-4 w-4" />}
                />
                <StatCard
                    title="Payment Success"
                    value={`${paymentHealth.successRate}%`}
                    description={paymentHealth.failedCount > 5 ? `${paymentHealth.failedCount} failed` : "last 30 days"}
                    icon={<CreditCard className="h-4 w-4" />}
                    trend={paymentHealth.failedCount > 5 ? "⚠️" : undefined}
                    href="/admin/payments"
                />
            </div>

            {/* Fulfillment Overview */}
            <Card>
                <CardHeader>
                    <CardTitle>Fulfillment Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{fulfillmentCounts.unfulfilled}</div>
                            <p className="text-xs text-muted-foreground">Unfulfilled</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{fulfillmentCounts.processing}</div>
                            <p className="text-xs text-muted-foreground">Processing</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{fulfillmentCounts.shipped}</div>
                            <p className="text-xs text-muted-foreground">Shipped</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{fulfillmentCounts.delivered}</div>
                            <p className="text-xs text-muted-foreground">Delivered</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-500">{fulfillmentCounts.cancelled}</div>
                            <p className="text-xs text-muted-foreground">Cancelled</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{fulfillmentCounts.refunded}</div>
                            <p className="text-xs text-muted-foreground">Refunded</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Low Stock Alerts */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            Low Stock Alert
                        </CardTitle>
                        <Badge variant="destructive">{lowStockItems.items.length}</Badge>
                    </CardHeader>
                    <CardContent>
                        {lowStockItems.items.length === 0 ? (
                            <p className="text-sm text-muted-foreground">All products are in stock!</p>
                        ) : (
                            <div className="space-y-3">
                                {lowStockItems.items.map((item) => (
                                    <Link
                                        key={item.variantId || item.productId}
                                        href={`/admin/products/${item.productId}`}
                                        className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            {item.image && (
                                                <img src={item.image} alt="" className="w-10 h-10 rounded object-cover" />
                                            )}
                                            <div>
                                                <p className="text-sm font-medium">{item.productName}</p>
                                                {item.variantName && (
                                                    <p className="text-xs text-muted-foreground">{item.variantName}</p>
                                                )}
                                            </div>
                                        </div>
                                        <Badge variant={item.currentStock === 0 ? "destructive" : "outline"}>
                                            {item.currentStock} left
                                        </Badge>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Top Products */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Top Products (Revenue)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {topProducts.products.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No sales data yet</p>
                        ) : (
                            <div className="space-y-3">
                                {topProducts.products.map((product, index) => (
                                    <Link
                                        key={product.id}
                                        href={`/admin/products/${product.id}`}
                                        className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                {index + 1}
                                            </div>
                                            {product.image && (
                                                <img src={product.image} alt="" className="w-10 h-10 rounded object-cover" />
                                            )}
                                            <div>
                                                <p className="text-sm font-medium">{product.name}</p>
                                                <p className="text-xs text-muted-foreground">{product.unitsSold} sold</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold">₵{product.revenue}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    {recentActivity.activities.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No recent activity</p>
                    ) : (
                        <div className="space-y-3">
                            {recentActivity.activities.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{activity.title}</p>
                                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {activity.staffEmail && `by ${activity.staffEmail} • `}
                                            {new Date(activity.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
