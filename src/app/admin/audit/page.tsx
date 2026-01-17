import { History, User, Package, ShoppingCart, Settings } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAuditLogs } from "@/lib/actions/audit-actions";

interface AuditLogEntry {
    id: string;
    created_at: string;
    staff_id: string | null;
    staff_email: string | null;
    action: string;
    resource_type: string;
    resource_id: string | null;
    changes: Record<string, { old: unknown; new: unknown }> | null;
    metadata: Record<string, unknown>;
}

const actionIcons: Record<string, React.ReactNode> = {
    product: <Package className="h-4 w-4" />,
    order: <ShoppingCart className="h-4 w-4" />,
    settings: <Settings className="h-4 w-4" />,
    staff: <User className="h-4 w-4" />,
};

const actionColors: Record<string, string> = {
    create: 'bg-green-100 text-green-800',
    update: 'bg-blue-100 text-blue-800',
    delete: 'bg-red-100 text-red-800',
};

export default async function AdminAuditPage() {
    const { logs, count } = await getAuditLogs({ limit: 100 }) as { logs: AuditLogEntry[]; count: number };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
                <p className="text-muted-foreground">
                    Track all changes made to your store.
                </p>
            </div>

            {/* Audit Logs */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Recent Activity ({count})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {logs.length > 0 ? (
                        <div className="space-y-4">
                            {logs.map((log) => {
                                const actionType = log.action.split('.')[1] || 'update';

                                return (
                                    <div
                                        key={log.id}
                                        className="flex items-start gap-4 p-4 border rounded-lg"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                            {actionIcons[log.resource_type] || <History className="h-4 w-4" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium">{log.staff_email}</span>
                                                <Badge
                                                    variant="secondary"
                                                    className={actionColors[actionType] || 'bg-gray-100 text-gray-800'}
                                                >
                                                    {log.action}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {log.resource_type}
                                                {log.resource_id && ` • ${log.resource_id.slice(0, 8)}...`}
                                            </p>
                                            {log.changes && Object.keys(log.changes).length > 0 && (
                                                <div className="mt-2 text-xs bg-muted/50 p-2 rounded">
                                                    {Object.entries(log.changes).map(([field, change]: [string, { old: unknown; new: unknown }]) => (
                                                        <div key={field}>
                                                            <span className="font-medium">{field}:</span>{' '}
                                                            <span className="text-red-600 line-through">{String(change.old)}</span>
                                                            {' → '}
                                                            <span className="text-green-600">{String(change.new)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(log.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">
                            No audit logs yet. Activity will be recorded here.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
