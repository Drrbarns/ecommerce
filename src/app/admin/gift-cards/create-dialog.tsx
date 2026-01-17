"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { createGiftCard } from "@/lib/actions/feature-actions";

export function GiftCardCreateDialog() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        initialBalance: "50",
        recipientEmail: "",
        senderName: "",
        message: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const balance = parseFloat(formData.initialBalance);
        if (isNaN(balance) || balance <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        setIsLoading(true);
        const result = await createGiftCard({
            initialBalance: balance,
            recipientEmail: formData.recipientEmail || undefined,
            senderName: formData.senderName || undefined,
            message: formData.message || undefined,
        });
        setIsLoading(false);

        if (result.success) {
            toast.success(`Gift card created: ${result.giftCard.code}`);
            setOpen(false);
            setFormData({ initialBalance: "50", recipientEmail: "", senderName: "", message: "" });
            router.refresh();
        } else {
            toast.error(result.error || "Failed to create gift card");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Gift Card
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Gift Card</DialogTitle>
                    <DialogDescription>
                        Generate a new gift card with a unique code.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount (₵)</Label>
                        <Input
                            id="amount"
                            type="number"
                            min="1"
                            step="0.01"
                            value={formData.initialBalance}
                            onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                            placeholder="50.00"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="recipient">Recipient Email (Optional)</Label>
                        <Input
                            id="recipient"
                            type="email"
                            value={formData.recipientEmail}
                            onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                            placeholder="recipient@email.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sender">From (Optional)</Label>
                        <Input
                            id="sender"
                            value={formData.senderName}
                            onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                            placeholder="John Doe"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">Message (Optional)</Label>
                        <Textarea
                            id="message"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            placeholder="Happy Birthday!"
                            rows={2}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            <Gift className="mr-2 h-4 w-4" />
                            {isLoading ? "Creating..." : "Create Card"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
