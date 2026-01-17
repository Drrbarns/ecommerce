import { Monitor, DollarSign, Clock, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { formatMoney } from "@/lib/money";
import { OpenRegisterButton, CloseRegisterButton } from "./pos-buttons";

interface PosSession {
    id: string;
    staff_email: string;
    status: 'open' | 'closed';
    opened_at: string;
    closed_at?: string;
    starting_cash_minor: number;
    closing_cash_minor?: number;
}

async function getPosStats() {
    const { data: sessions } = await supabaseAdmin
        .from('pos_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    const typedSessions = (sessions || []) as PosSession[];
    const openSession = typedSessions.find((s) => s.status === 'open');

    // Get today's POS orders (if we had a pos flag on orders)
    const today = new Date().toISOString().split('T')[0];
    const { data: todayOrders } = await supabaseAdmin
        .from('orders')
        .select('total_minor')
        .gte('created_at', today);

    const todayTotal = todayOrders?.reduce((sum: number, o: any) => sum + o.total_minor, 0) || 0;

    return { sessions: typedSessions, openSession, todayTotal, todayCount: todayOrders?.length || 0 };
}

export default async function AdminPosPage() {
    const { sessions, openSession, todayTotal, todayCount } = await getPosStats();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Point of Sale</h1>
                    <p className="text-muted-foreground">
                        In-store sales and register management.
                    </p>
                </div>
                {openSession ? (
                    <div className="flex items-center gap-4">
                        <Badge variant="default" className="text-lg px-4 py-2 bg-green-500">
                            <Monitor className="mr-2 h-4 w-4" />
                            Register Open
                        </Badge>
                        <CloseRegisterButton sessionId={openSession.id} />
                    </div>
                ) : (
                    <OpenRegisterButton />
                )}
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today&apos;s Sales</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatMoney(todayTotal)}</div>
                        <p className="text-xs text-muted-foreground">{todayCount} transactions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Register Status</CardTitle>
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${openSession ? 'text-green-600' : 'text-gray-400'}`}>
                            {openSession ? 'Open' : 'Closed'}
                        </div>
                        {openSession && (
                            <p className="text-xs text-muted-foreground">
                                Since {new Date(openSession.opened_at).toLocaleTimeString()}
                            </p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sessions Today</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {sessions.filter((s: any) => s.opened_at.startsWith(new Date().toISOString().split('T')[0])).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Sale */}
            {openSession && (
                <Card className="border-2 border-primary">
                    <CardHeader>
                        <CardTitle>Quick Sale</CardTitle>
                        <CardDescription>Process an in-store transaction</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center py-8">
                        <Button size="lg" className="text-lg px-8 py-6">
                            <ShoppingBag className="mr-2 h-6 w-6" />
                            New Transaction
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Recent Sessions */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                    {sessions.length > 0 ? (
                        <div className="space-y-3">
                            {sessions.map((session: any) => (
                                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${session.status === 'open' ? 'bg-green-100' : 'bg-gray-100'
                                            }`}>
                                            <Monitor className={`h-5 w-5 ${session.status === 'open' ? 'text-green-600' : 'text-gray-500'
                                                }`} />
                                        </div>
                                        <div>
                                            <p className="font-medium">{session.staff_email}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Opened: {new Date(session.opened_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant={session.status === 'open' ? 'default' : 'secondary'}>
                                            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                                        </Badge>
                                        {session.closing_cash_minor && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Closing: {formatMoney(session.closing_cash_minor)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Monitor className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">No POS Sessions Yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Open the register to start processing in-store sales.
                            </p>
                            <OpenRegisterButton />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
