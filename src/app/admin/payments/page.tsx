import { CreditCard, CheckCircle, XCircle, Clock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { formatMoney } from "@/lib/money";

interface PaymentIntent {
    id: string;
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
}

async function getPaymentStats() {
    const { data: intentsData } = await supabaseAdmin
        .from('payment_intents')
        .select('id, provider, amount_minor, currency, status, created_at')
        .order('created_at', { ascending: false });

    const intents = (intentsData as PaymentIntent[]) || [];

    const { data: providersData } = await supabaseAdmin
        .from('payment_providers')
        .select('*')
        .order('priority');

    const providers = (providersData as PaymentProvider[]) || [];

    const stats = {
        total: intents.length,
        succeeded: intents.filter(i => i.status === 'succeeded').length,
        pending: intents.filter(i => i.status === 'pending' || i.status === 'processing').length,
        failed: intents.filter(i => i.status === 'failed').length,
        revenue: intents.filter(i => i.status === 'succeeded').reduce((sum, i) => sum + i.amount_minor, 0),
    };

    return { stats, providers, intents: intents.slice(0, 10) };
}

const statusIcons: Record<string, React.ReactNode> = {
    succeeded: <CheckCircle className="h-4 w-4 text-green-500" />,
    failed: <XCircle className="h-4 w-4 text-red-500" />,
    pending: <Clock className="h-4 w-4 text-yellow-500" />,
    processing: <Clock className="h-4 w-4 text-blue-500" />,
};

export default async function AdminPaymentsPage() {
    const { stats, providers, intents } = await getPaymentStats();

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
                <p className="text-muted-foreground">
                    Manage payment providers and view transactions.
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatMoney(stats.revenue)}</div>
                        <p className="text-xs text-muted-foreground">{stats.succeeded} successful payments</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Succeeded</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.succeeded}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pending}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Failed</CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.failed}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Payment Providers */}
            <Card>
                <CardHeader>
                    <CardTitle>Payment Providers</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {providers.map((provider) => (
                            <div
                                key={provider.id}
                                className="flex items-center justify-between p-4 border rounded-lg"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <CreditCard className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{provider.display_name}</p>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span>Currencies: {provider.supported_currencies?.join(', ')}</span>
                                            {provider.is_test_mode && (
                                                <Badge variant="outline" className="text-xs">Test Mode</Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {provider.is_primary && (
                                        <Badge>Primary</Badge>
                                    )}
                                    <Badge variant={provider.is_enabled ? "default" : "secondary"}>
                                        {provider.is_enabled ? 'Enabled' : 'Disabled'}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    {intents.length > 0 ? (
                        <div className="space-y-3">
                            {intents.map((intent: {
                                id: string;
                                provider: string;
                                amount_minor: number;
                                currency: string;
                                status: string;
                                created_at: string;
                            }) => (
                                <div
                                    key={intent.id}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        {statusIcons[intent.status] || statusIcons.pending}
                                        <div>
                                            <p className="font-medium">{formatMoney(intent.amount_minor)}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {intent.provider} • {intent.id.slice(0, 8)}...
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="outline">{intent.status}</Badge>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(intent.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">
                            No payment transactions yet.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
