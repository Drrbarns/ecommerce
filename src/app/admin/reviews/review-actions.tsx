"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { updateReviewStatus } from "@/lib/actions/feature-actions";

export function ReviewActions({ reviewId, currentStatus }: { reviewId: string; currentStatus: string }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleStatusChange = async (newStatus: 'approved' | 'rejected') => {
        setIsLoading(true);
        const result = await updateReviewStatus(reviewId, newStatus);
        setIsLoading(false);

        if (result.success) {
            toast.success(`Review ${newStatus}`);
            router.refresh();
        } else {
            toast.error("Failed to update review");
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={isLoading}>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {currentStatus !== 'approved' && (
                    <DropdownMenuItem onClick={() => handleStatusChange('approved')}>
                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                        Approve
                    </DropdownMenuItem>
                )}
                {currentStatus !== 'rejected' && (
                    <DropdownMenuItem onClick={() => handleStatusChange('rejected')}>
                        <XCircle className="mr-2 h-4 w-4 text-red-600" />
                        Reject
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
