import { Award, Users, TrendingUp, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function getLoyaltyStats() {
    const { data: loyalty } = await supabaseAdmin
        .from('customer_loyalty')
        .select('*, customer:customers(email, first_name, last_name)');

    return loyalty || [];
}

export default async function AdminLoyaltyPage() {
    const loyaltyMembers = await getLoyaltyStats();

    const totalPoints = loyaltyMembers.reduce((sum: number, m: any) => sum + (m.points_balance || 0), 0);
    const platinumCount = loyaltyMembers.filter((m: any) => m.tier === 'platinum').length;
    const goldCount = loyaltyMembers.filter((m: any) => m.tier === 'gold').length;

    const tierColors: Record<string, string> = {
        bronze: 'bg-orange-100 text-orange-800',
        silver: 'bg-gray-200 text-gray-800',
        gold: 'bg-yellow-100 text-yellow-800',
        platinum: 'bg-purple-100 text-purple-800',
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Loyalty Program</h1>
                <p className="text-muted-foreground">
                    Manage customer rewards and points.
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Members</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loyaltyMembers.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Outstanding Points</CardTitle>
                        <Award className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{totalPoints.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Gold Members</CardTitle>
                        <Crown className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{goldCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Platinum Members</CardTitle>
                        <Crown className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">{platinumCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tier Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Loyalty Tiers</CardTitle>
                    <CardDescription>Points required for each tier level</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="p-4 border rounded-lg text-center">
                            <Badge className={tierColors.bronze}>Bronze</Badge>
                            <p className="mt-2 text-2xl font-bold">0+</p>
                            <p className="text-xs text-muted-foreground">Lifetime points</p>
                        </div>
                        <div className="p-4 border rounded-lg text-center">
                            <Badge className={tierColors.silver}>Silver</Badge>
                            <p className="mt-2 text-2xl font-bold">1,000+</p>
                            <p className="text-xs text-muted-foreground">Lifetime points</p>
                        </div>
                        <div className="p-4 border rounded-lg text-center">
                            <Badge className={tierColors.gold}>Gold</Badge>
                            <p className="mt-2 text-2xl font-bold">5,000+</p>
                            <p className="text-xs text-muted-foreground">Lifetime points</p>
                        </div>
                        <div className="p-4 border rounded-lg text-center">
                            <Badge className={tierColors.platinum}>Platinum</Badge>
                            <p className="mt-2 text-2xl font-bold">10,000+</p>
                            <p className="text-xs text-muted-foreground">Lifetime points</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Members List */}
            <Card>
                <CardHeader>
                    <CardTitle>Loyalty Members</CardTitle>
                </CardHeader>
                <CardContent>
                    {loyaltyMembers.length > 0 ? (
                        <div className="space-y-3">
                            {loyaltyMembers.map((member: any) => (
                                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Award className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {member.customer?.first_name} {member.customer?.last_name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {member.customer?.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold">{member.points_balance?.toLocaleString() || 0} pts</p>
                                        <Badge className={tierColors[member.tier] || tierColors.bronze}>
                                            {member.tier?.charAt(0).toUpperCase() + member.tier?.slice(1)}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">No Loyalty Members Yet</h3>
                            <p className="text-muted-foreground">
                                Customers earn points automatically when they make purchases.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
