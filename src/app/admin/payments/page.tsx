import { CreditCard, CheckCircle, XCircle, Clock, Settings, ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { formatMoney } from "@/lib/money";
import { PaymentProviderEditor } from "./payment-provider-editor";
import { initializePaymentProviders } from "@/lib/actions/payment-actions";

interface PaymentIntent {
    id: string;
    order_id: string | null;
    provider: string;
    amount_minor: number;
    currency: string;
    status: string;
    created_at: string;
}

interface PaymentProvider {
    id: string;
    provider: string;
    display_name: string;
    is_enabled: boolean;
    is_primary: boolean;
    is_test_mode: boolean;
    supported_currencies: string[];
    credentials: Record<string, string>;
}

async function getPaymentData() {
    const { data: intentsData } = await supabaseAdmin
        .from('payment_intents')
        .select('id, order_id, provider, amount_minor, currency, status, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

    const intents = (intentsData as PaymentIntent[]) || [];

    const { data: providersData } = await supabaseAdmin
        .from('payment_providers')
        .select('*')
        .order('priority');

    let providers = (providersData as PaymentProvider[]) || [];

    // If no providers exist, initialize them
    if (providers.length === 0) {
        await initializePaymentProviders();
        const { data: newProvidersData } = await supabaseAdmin
            .from('payment_providers')
            .select('*')
            .order('priority');
        providers = (newProvidersData as PaymentProvider[]) || [];
    }

    const stats = {
        total: intents.length,
        succeeded: intents.filter(i => i.status === 'succeeded').length,
        pending: intents.filter(i => i.status === 'pending' || i.status === 'processing').length,
        failed: intents.filter(i => i.status === 'failed').length,
        revenue: intents.filter(i => i.status === 'succeeded').reduce((sum, i) => sum + i.amount_minor, 0),
    };

    return { stats, providers, intents };
}

const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    succeeded: {
        icon: <CheckCircle className="h-4 w-4" />,
        color: 'text-green-600 bg-green-50',
        label: 'Succeeded'
    },
    failed: {
        icon: <XCircle className="h-4 w-4" />,
        color: 'text-red-600 bg-red-50',
        label: 'Failed'
    },
    pending: {
        icon: <Clock className="h-4 w-4" />,
        color: 'text-yellow-600 bg-yellow-50',
        label: 'Pending'
    },
    processing: {
        icon: <Clock className="h-4 w-4" />,
        color: 'text-blue-600 bg-blue-50',
        label: 'Processing'
    },
};

export default async function AdminPaymentsPage() {
    const { stats, providers, intents } = await getPaymentData();

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
                <p className="text-muted-foreground">
                    Configure payment gateways and monitor transactions.
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatMoney(stats.revenue)}</div>
                        <p className="text-xs text-muted-foreground">
                            From {stats.succeeded} successful payments
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Succeeded</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.succeeded}</div>
                        <p className="text-xs text-muted-foreground">Completed payments</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                        <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Failed</CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                        <p className="text-xs text-muted-foreground">Failed transactions</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="providers" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="providers" className="gap-2">
                        <Settings className="h-4 w-4" />
                        Payment Providers
                    </TabsTrigger>
                    <TabsTrigger value="transactions" className="gap-2">
                        <CreditCard className="h-4 w-4" />
                        Transactions
                    </TabsTrigger>
                </TabsList>

                {/* Payment Providers Tab */}
                <TabsContent value="providers">
                    <PaymentProviderEditor providers={providers} />
                </TabsContent>

                {/* Transactions Tab */}
                <TabsContent value="transactions">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>
                                View and manage payment transactions.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {intents.length > 0 ? (
                                <div className="space-y-3">
                                    {intents.map((intent) => {
                                        const statusInfo = statusConfig[intent.status] || statusConfig.pending;
                                        return (
                                            <div
                                                key={intent.id}
                                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2 rounded-full ${statusInfo.color}`}>
                                                        {statusInfo.icon}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold">{formatMoney(intent.amount_minor)}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {intent.provider.charAt(0).toUpperCase() + intent.provider.slice(1)} •
                                                            {intent.order_id ? ` Order ${intent.order_id.slice(0, 8)}...` : ' No order'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right flex items-center gap-4">
                                                    <div>
                                                        <Badge
                                                            variant="outline"
                                                            className={statusInfo.color}
                                                        >
                                                            {statusInfo.label}
                                                        </Badge>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {new Date(intent.created_at).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <ArrowUpRight className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="font-semibold mb-2">No transactions yet</h3>
                                    <p className="text-muted-foreground text-sm">
                                        When customers make payments, they'll appear here.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
