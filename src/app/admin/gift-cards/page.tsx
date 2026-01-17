import { Gift, Plus, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getGiftCards } from "@/lib/actions/feature-actions";
import { formatMoney } from "@/lib/money";
import { GiftCardCreateDialog } from "./create-dialog";

export default async function AdminGiftCardsPage() {
    const giftCards = await getGiftCards();

    const activeCards = giftCards.filter((c: any) => c.status === 'active');
    const totalValue = activeCards.reduce((sum: number, c: any) => sum + c.current_balance_minor, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gift Cards</h1>
                    <p className="text-muted-foreground">
                        Create and manage gift cards.
                    </p>
                </div>
                <GiftCardCreateDialog />
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
                        <Gift className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{giftCards.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Cards</CardTitle>
                        <CreditCard className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{activeCards.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Outstanding Value</CardTitle>
                        <Gift className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">{formatMoney(totalValue)}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Gift Cards List */}
            <Card>
                <CardHeader>
                    <CardTitle>All Gift Cards</CardTitle>
                </CardHeader>
                <CardContent>
                    {giftCards.length > 0 ? (
                        <div className="space-y-3">
                            {giftCards.map((card: any) => (
                                <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                            <Gift className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-mono font-bold">{card.code}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Initial: {formatMoney(card.initial_balance_minor)}
                                                {card.recipient_email && ` • To: ${card.recipient_email}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold">{formatMoney(card.current_balance_minor)}</p>
                                        <StatusBadge status={card.status} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">No Gift Cards Yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Create your first gift card to start selling.
                            </p>
                            <GiftCardCreateDialog />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        active: "bg-green-100 text-green-800",
        depleted: "bg-gray-100 text-gray-800",
        expired: "bg-red-100 text-red-800",
        cancelled: "bg-red-100 text-red-800",
    };

    return (
        <Badge className={styles[status] || "bg-gray-100"}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    );
}
