"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { addOrderNote, updateOrderTracking, processRefund, updateOrderStatusAdmin } from "@/lib/actions/order-actions";
import { toast } from "sonner";
import { MessageSquare, Truck, DollarSign, Edit } from "lucide-react";

interface OrderActionsProps {
    orderId: string;
    currentStatus: string;
}

export function OrderActions({ orderId, currentStatus }: OrderActionsProps) {
    return (
        <div className="flex flex-wrap gap-2">
            <AddNoteButton orderId={orderId} />
            <UpdateTrackingButton orderId={orderId} />
            <ProcessRefundButton orderId={orderId} />
            <UpdateStatusButton orderId={orderId} currentStatus={currentStatus} />
        </div>
    );
}

function AddNoteButton({ orderId }: { orderId: string }) {
    const [open, setOpen] = useState(false);
    const [note, setNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!note.trim()) {
            toast.error("Please enter a note");
            return;
        }

        setIsSubmitting(true);
        const result = await addOrderNote(orderId, note);
        setIsSubmitting(false);

        if (result.success) {
            toast.success("Note added");
            setNote("");
            setOpen(false);
            window.location.reload();
        } else {
            toast.error(result.error || "Failed to add note");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Note
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Order Note</DialogTitle>
                    <DialogDescription>Add an internal note to this order</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label>Note</Label>
                        <Textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Enter note..."
                            rows={4}
                        />
                    </div>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
                        {isSubmitting ? "Adding..." : "Add Note"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function UpdateTrackingButton({ orderId }: { orderId: string }) {
    const [open, setOpen] = useState(false);
    const [carrier, setCarrier] = useState("");
    const [trackingNumber, setTrackingNumber] = useState("");
    const [trackingUrl, setTrackingUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!carrier || !trackingNumber) {
            toast.error("Carrier and tracking number are required");
            return;
        }

        setIsSubmitting(true);
        const result = await updateOrderTracking(orderId, carrier, trackingNumber, trackingUrl || undefined);
        setIsSubmitting(false);

        if (result.success) {
            toast.success("Tracking updated");
            setOpen(false);
            window.location.reload();
        } else {
            toast.error(result.error || "Failed to update tracking");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Truck className="h-4 w-4 mr-2" />
                    Update Tracking
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Shipping Tracking</DialogTitle>
                    <DialogDescription>Add or update tracking information</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label>Carrier</Label>
                        <Input
                            value={carrier}
                            onChange={(e) => setCarrier(e.target.value)}
                            placeholder="e.g., DHL, FedEx"
                        />
                    </div>
                    <div>
                        <Label>Tracking Number</Label>
                        <Input
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            placeholder="Enter tracking number"
                        />
                    </div>
                    <div>
                        <Label>Tracking URL (optional)</Label>
                        <Input
                            value={trackingUrl}
                            onChange={(e) => setTrackingUrl(e.target.value)}
                            placeholder="https://..."
                            type="url"
                        />
                    </div>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
                        {isSubmitting ? "Updating..." : "Update Tracking"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function ProcessRefundButton({ orderId }: { orderId: string }) {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState("");
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        if (!reason.trim()) {
            toast.error("Please provide a reason");
            return;
        }

        setIsSubmitting(true);
        const result = await processRefund(orderId, amountNum, reason);
        setIsSubmitting(false);

        if (result.success) {
            toast.success("Refund processed");
            setOpen(false);
            window.location.reload();
        } else {
            toast.error(result.error || "Failed to process refund");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Process Refund
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Process Refund</DialogTitle>
                    <DialogDescription>Issue a refund for this order</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label>Amount (₵)</Label>
                        <Input
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <Label>Reason</Label>
                        <Textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Why is this refund being issued?"
                            rows={3}
                        />
                    </div>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full" variant="destructive">
                        {isSubmitting ? "Processing..." : "Process Refund"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function UpdateStatusButton({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
    const [open, setOpen] = useState(false);
    const [newStatus, setNewStatus] = useState(currentStatus);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (newStatus === currentStatus) {
            toast.error("Please select a different status");
            return;
        }

        setIsSubmitting(true);
        const result = await updateOrderStatusAdmin(orderId, newStatus);
        setIsSubmitting(false);

        if (result.success) {
            toast.success("Status updated");
            setOpen(false);
            window.location.reload();
        } else {
            toast.error(result.error || "Failed to update status");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Update Status
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Order Status</DialogTitle>
                    <DialogDescription>Change the order status</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label>Current Status</Label>
                        <p className="text-sm text-muted-foreground capitalize">{currentStatus}</p>
                    </div>
                    <div>
                        <Label>New Status</Label>
                        <Select value={newStatus} onValueChange={setNewStatus}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
                        {isSubmitting ? "Updating..." : "Update Status"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
