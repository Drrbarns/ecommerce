"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Loader2, CheckCircle, XCircle, PackageOpen } from "lucide-react";
import { toast } from "sonner";
import { updateReturnStatus, approveReturn, markReturnReceived } from "@/lib/actions/returns-actions";
import { fromMinorUnits } from "@/lib/money";

export function ReturnsList({ initialReturns }: { initialReturns: any[] }) {
    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {initialReturns.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                                No return requests found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        initialReturns.map((rma) => (
                            <ReturnRow key={rma.id} rma={rma} />
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

function ReturnRow({ rma }: { rma: any }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleApprove = async () => {
        if (!confirm("Approve this return and issue Refund via Original Payment?")) return;
        setIsLoading(true);
        const result = await approveReturn(rma.id, "original_payment");
        setIsLoading(false);
        if (result.success) {
            toast.success("Return approved");
            router.refresh();
        } else {
            toast.error(result.error);
        }
    };

    const handleReject = async () => {
        const reason = prompt("Enter rejection reason:");
        if (!reason) return;
        setIsLoading(true);
        const result = await updateReturnStatus(rma.id, "rejected", reason);
        setIsLoading(false);
        if (result.success) {
            toast.success("Return rejected");
            router.refresh();
        }
    };

    const handleReceived = async () => {
        setIsLoading(true);
        const result = await markReturnReceived(rma.id, "Received in good condition", true);
        setIsLoading(false);
        if (result.success) {
            toast.success("Marked as received & restocked");
            router.refresh();
        }
    };

    return (
        <TableRow>
            <TableCell className="font-mono text-xs">{rma.id.slice(0, 8)}...</TableCell>
            <TableCell>#{rma.order?.id?.slice(0, 8)}</TableCell>
            <TableCell>{rma.customer?.email}</TableCell>
            <TableCell className="max-w-[200px] truncate">{rma.reason}</TableCell>
            <TableCell>
                <StatusBadge status={rma.status} />
            </TableCell>
            <TableCell>{new Date(rma.created_at).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={isLoading}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push(`/admin/orders/${rma.order_id}`)}>
                            View Order
                        </DropdownMenuItem>

                        {rma.status === 'pending' && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleApprove}>
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                    Approve & Refund
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleReject}>
                                    <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                    Reject
                                </DropdownMenuItem>
                            </>
                        )}

                        {rma.status === 'approved' && (
                            <DropdownMenuItem onClick={handleReceived}>
                                <PackageOpen className="mr-2 h-4 w-4" />
                                Mark Received
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
        approved: "bg-green-100 text-green-800 hover:bg-green-100",
        rejected: "bg-red-100 text-red-800 hover:bg-red-100",
        received: "bg-blue-100 text-blue-800 hover:bg-blue-100",
        refunded: "bg-purple-100 text-purple-800 hover:bg-purple-100",
    };

    return (
        <Badge className={styles[status] || "bg-gray-100 text-gray-800"}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    );
}
