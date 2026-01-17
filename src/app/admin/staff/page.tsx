import { Users, Shield, UserCog } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStaffMembers } from "@/lib/actions/audit-actions";

interface StaffMember {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    role: 'owner' | 'admin' | 'staff';
    is_active: boolean;
    last_login: string | null;
    avatar: string | null;
}

const roleColors: Record<string, string> = {
    owner: 'bg-purple-100 text-purple-800',
    admin: 'bg-blue-100 text-blue-800',
    staff: 'bg-gray-100 text-gray-800',
};

export default async function AdminStaffPage() {
    const staff = await getStaffMembers() as StaffMember[];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Staff</h1>
                    <p className="text-muted-foreground">
                        Manage team members and permissions.
                    </p>
                </div>
                <Button>
                    <Users className="mr-2 h-4 w-4" />
                    Invite Staff
                </Button>
            </div>

            {/* Staff List */}
            <Card>
                <CardHeader>
                    <CardTitle>Team Members ({staff.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {staff.length > 0 ? (
                        <div className="space-y-4">
                            {staff.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between p-4 border rounded-lg"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            {member.avatar ? (
                                                <img
                                                    src={member.avatar}
                                                    alt={member.email}
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <span className="font-medium text-primary">
                                                    {member.first_name?.[0] || member.email[0].toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {member.first_name && member.last_name
                                                    ? `${member.first_name} ${member.last_name}`
                                                    : member.email}
                                            </p>
                                            <p className="text-sm text-muted-foreground">{member.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge className={roleColors[member.role]}>
                                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                                        </Badge>
                                        {!member.is_active && (
                                            <Badge variant="secondary">Inactive</Badge>
                                        )}
                                        {member.last_login && (
                                            <span className="text-xs text-muted-foreground">
                                                Last login: {new Date(member.last_login).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">
                            No staff members yet. Invite your first team member.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Roles Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Role Permissions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="h-5 w-5 text-purple-600" />
                                <h3 className="font-medium">Owner</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Full access to all features, billing, and staff management.
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <UserCog className="h-5 w-5 text-blue-600" />
                                <h3 className="font-medium">Admin</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Full access to products, orders, customers, and settings.
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="h-5 w-5 text-gray-600" />
                                <h3 className="font-medium">Staff</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                View orders, update order status, and manage inventory.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
