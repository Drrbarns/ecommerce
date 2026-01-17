import { Mail, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getNewsletterSubscribers } from "@/lib/actions/feature-actions";

export default async function AdminNewsletterPage() {
    const subscribers = await getNewsletterSubscribers();

    const activeCount = subscribers.filter((s: any) => s.is_active).length;
    const thisMonth = subscribers.filter((s: any) => {
        const date = new Date(s.created_at);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Newsletter</h1>
                <p className="text-muted-foreground">
                    Manage your email subscribers.
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{subscribers.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active</CardTitle>
                        <Mail className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{activeCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">This Month</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{thisMonth}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Subscribers List */}
            <Card>
                <CardHeader>
                    <CardTitle>Subscribers ({subscribers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {subscribers.length > 0 ? (
                        <div className="space-y-2">
                            {subscribers.map((sub: any) => (
                                <div key={sub.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Mail className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{sub.email}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Joined {new Date(sub.created_at).toLocaleDateString()}
                                                {sub.source && ` • Source: ${sub.source}`}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={sub.is_active ? "default" : "secondary"}>
                                        {sub.is_active ? "Active" : "Unsubscribed"}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">No Subscribers Yet</h3>
                            <p className="text-muted-foreground">
                                Add a newsletter signup form to your storefront to collect subscribers.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
