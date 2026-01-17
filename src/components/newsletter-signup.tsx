"use client";

import { useState } from "react";
import { Mail, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeToNewsletter } from "@/lib/actions/feature-actions";

export function NewsletterSignup({ source = "website" }: { source?: string }) {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.includes("@")) {
            setStatus("error");
            setMessage("Please enter a valid email");
            return;
        }

        setStatus("loading");
        const result = await subscribeToNewsletter(email, source);

        if (result.success) {
            setStatus("success");
            setMessage(result.message || "Successfully subscribed!");
            setEmail("");
        } else {
            setStatus("error");
            setMessage(result.error || "Something went wrong");
        }
    };

    if (status === "success") {
        return (
            <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>{message}</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={status === "loading"}
                />
            </div>
            <Button type="submit" disabled={status === "loading"}>
                {status === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    "Subscribe"
                )}
            </Button>
            {status === "error" && (
                <p className="text-red-500 text-sm absolute -bottom-6 left-0">{message}</p>
            )}
        </form>
    );
}
