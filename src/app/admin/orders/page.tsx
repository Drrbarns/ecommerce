import { Badge } from "@/components/ui/badge";
import { getOrdersAdmin } from "@/lib/actions/order-actions";
import { fromMinorUnits } from "@/lib/money";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default async function OrdersPage({
    searchParams,
}: {
    searchParams: { status?: string; search?: string; page?: string };
}) {
    const page = parseInt(searchParams.page || "1");
    const limit = 20;
    const offset = (page - 1) * limit;

    const { orders, count } = await getOrdersAdmin({
        status: searchParams.status,
        search: searchParams.search,
        limit,
        offset,
    });

    const totalPages = Math.ceil(count / limit);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                    <p className="text-muted-foreground">Manage and fulfill customer orders</p>
                </div>
                <Button asChild>
                    <Link href="/admin/orders/export">Export Orders</Link>
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="flex flex-col md:flex-row gap-4">
                        <Input
                            name="search"
                            placeholder="Search by email or order ID..."
                            defaultValue={searchParams.search}
                            className="md:w-64"
                        />
                        <Select name="status" defaultValue={searchParams.status || "all"}>
                            <SelectTrigger className="md:w-48">
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button type="submit">Apply Filters</Button>
                    </form>
                </CardContent>
            </Card>

            {/* Orders List */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        {count} {count === 1 ? "Order" : "Orders"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {orders.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">No orders found</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {orders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/admin/orders/${order.id}`}
                                    className="block p-4 rounded-lg border hover:bg-accent transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <p className="font-mono text-sm font-medium">
                                                    #{order.id.substring(0, 8)}
                                                </p>
                                                <Badge variant={
                                                    order.status === 'delivered' ? 'default' :
                                                        order.status === 'shipped' ? 'secondary' :
                                                            order.status === 'processing' ? 'outline' :
                                                                order.status === 'cancelled' ? 'destructive' :
                                                                    'secondary'
                                                }>
                                                    {order.status}
                                                </Badge>
                                                {order.tags && order.tags.length > 0 && (
                                                    <div className="flex gap-1">
                                                        {order.tags.map((tag: string) => (
                                                            <Badge key={tag} variant="outline" className="text-xs">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {order.user_email}
                                                {order.customer?.first_name && ` • ${order.customer.first_name} ${order.customer.last_name}`}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold">
                                                ₵{fromMinorUnits(order.total_minor || 0)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {order.items?.[0]?.count || 0} {order.items?.[0]?.count === 1 ? 'item' : 'items'}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-6 border-t">
                            <p className="text-sm text-muted-foreground">
                                Page {page} of {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    disabled={page === 1}
                                >
                                    <Link href={`/admin/orders?page=${page - 1}${searchParams.status ? `&status=${searchParams.status}` : ''}${searchParams.search ? `&search=${searchParams.search}` : ''}`}>
                                        Previous
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    disabled={page === totalPages}
                                >
                                    <Link href={`/admin/orders?page=${page + 1}${searchParams.status ? `&status=${searchParams.status}` : ''}${searchParams.search ? `&search=${searchParams.search}` : ''}`}>
                                        Next
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
