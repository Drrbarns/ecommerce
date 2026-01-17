"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Monitor, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createPosSession, closePosSession } from "@/lib/actions/feature-actions";

export function OpenRegisterButton({ staffEmail = "admin@store.com" }: { staffEmail?: string }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [startingCash, setStartingCash] = useState("0");

    const handleOpenRegister = async () => {
        setIsLoading(true);
        const result = await createPosSession(staffEmail);
        setIsLoading(false);

        if (result.success) {
            toast.success("Register opened successfully!");
            setOpen(false);
            router.refresh();
        } else {
            toast.error(result.error || "Failed to open register");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="lg">
                    <Monitor className="mr-2 h-5 w-5" />
                    Open Register
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Open Register</DialogTitle>
                    <DialogDescription>
                        Start a new POS session to process in-store sales.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="staffEmail">Staff Email</Label>
                        <Input
                            id="staffEmail"
                            value={staffEmail}
                            disabled
                            className="bg-muted"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="startingCash">Starting Cash (₵)</Label>
                        <Input
                            id="startingCash"
                            type="number"
                            min="0"
                            step="0.01"
                            value={startingCash}
                            onChange={(e) => setStartingCash(e.target.value)}
                            placeholder="0.00"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleOpenRegister} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Opening...
                            </>
                        ) : (
                            <>
                                <Monitor className="mr-2 h-4 w-4" />
                                Open Register
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function CloseRegisterButton({ sessionId, onSuccess }: { sessionId: string; onSuccess?: () => void }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [closingCash, setClosingCash] = useState("0");

    const handleCloseRegister = async () => {
        setIsLoading(true);
        const result = await closePosSession(sessionId, parseFloat(closingCash) || 0);
        setIsLoading(false);

        if (result.success) {
            toast.success("Register closed successfully!");
            setOpen(false);
            router.refresh();
            onSuccess?.();
        } else {
            toast.error(result.error || "Failed to close register");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive">
                    Close Register
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Close Register</DialogTitle>
                    <DialogDescription>
                        End the current POS session and record closing cash.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="closingCash">Closing Cash (₵)</Label>
                        <Input
                            id="closingCash"
                            type="number"
                            min="0"
                            step="0.01"
                            value={closingCash}
                            onChange={(e) => setClosingCash(e.target.value)}
                            placeholder="0.00"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleCloseRegister} disabled={isLoading}>
                        {isLoading ? "Closing..." : "Close Register"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
