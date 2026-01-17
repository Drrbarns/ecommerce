"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { refreshAnalytics } from "@/lib/actions/reports-actions";

export function DashboardRefresh() {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const router = useRouter();

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            const result = await refreshAnalytics();
            if (result.success) {
                toast.success("Analytics updated");
                router.refresh(); // Reload server components
            } else {
                toast.error("Failed to update analytics");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
        >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh Data
        </Button>
    );
}
