"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContactForm } from "@/lib/actions/contact-actions";

export function ContactForm() {
    const [isPending, startTransition] = useTransition();
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = (formData: FormData) => {
        startTransition(async () => {
            const result = await submitContactForm(formData);

            if (result.success) {
                setIsSuccess(true);
                toast.success("Message sent successfully!");
            } else {
                toast.error(result.error || "Failed to send message");
            }
        });
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-green-100 p-4 mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                <p className="text-muted-foreground mb-4">
                    Thank you for reaching out. We'll get back to you soon.
                </p>
                <Button variant="outline" onClick={() => setIsSuccess(false)}>
                    Send Another Message
                </Button>
            </div>
        );
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                    id="name"
                    name="name"
                    placeholder="Your name"
                    required
                    disabled={isPending}
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    disabled={isPending}
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                    id="message"
                    name="message"
                    placeholder="How can we help you?"
                    className="min-h-[120px]"
                    required
                    disabled={isPending}
                />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                    </>
                ) : (
                    "Send Message"
                )}
            </Button>
        </form>
    );
}
