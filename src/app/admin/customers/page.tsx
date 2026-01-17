import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Users, Mail, ShoppingBag, DollarSign } from "lucide-react";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function CustomersPage({
    searchParams,
}: {
    searchParams: { search?: string; page?: string };
}) {
    const page = parseInt(searchParams.page || "1");
    const limit = 20;
    const offset = (page - 1) * limit;

    // Get customers with order stats
    let query = supabase
        .from('customers')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (searchParams.search) {
        query = query.or(`email.ilike.%${searchParams.search}%,first_name.ilike.%${searchParams.search}%,last_name.ilike.%${searchParams.search}%`);
    }

    const { data: customers, count } = await query;

    const totalPages = Math.ceil((count || 0) / limit);

    // Get customer segments
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: newCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

    const { count: highSpenders } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .gte('total_spent_minor', 50000); // GHS 500+

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
                <p className="text-muted-foreground">Manage your customer base</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{count || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New (30d)</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{newCustomers || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">High Spenders</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{highSpenders || 0}</div>
                        <p className="text-xs text-muted-foreground">₵500+ lifetime</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Orders</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {customers && customers.length > 0
                                ? (customers.reduce((sum: number, c: any) => sum + (c.order_count || 0), 0) / customers.length).toFixed(1)
                                : "0"}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Customers List */}
            <Card>
                <CardHeader>
                    <CardTitle>All Customers</CardTitle>
                </CardHeader>
                <CardContent>
                    {!customers || customers.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">No customers found</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {customers.map((customer: any) => (
                                <Link
                                    key={customer.id}
                                    href={`/admin/customers/${customer.id}`}
                                    className="block p-4 rounded-lg border hover:bg-accent transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <span className="font-bold text-primary">
                                                        {customer.first_name?.[0] || customer.email[0].toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium">
                                                        {customer.first_name} {customer.last_name}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Mail className="h-3 w-3" />
                                                        {customer.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold">
                                                ₵{((customer.total_spent_minor || 0) / 100).toFixed(2)}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {customer.order_count || 0} orders
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
                                    <Link href={`/admin/customers?page=${page - 1}${searchParams.search ? `&search=${searchParams.search}` : ''}`}>
                                        Previous
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    disabled={page === totalPages}
                                >
                                    <Link href={`/admin/customers?page=${page + 1}${searchParams.search ? `&search=${searchParams.search}` : ''}`}>
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
