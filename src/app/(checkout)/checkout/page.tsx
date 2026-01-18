
import Link from "next/link";
import { Lock } from "lucide-react";

import { Container } from "@/components/shared/container";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { CheckoutSummary } from "@/components/checkout/checkout-summary";
import { siteConfig } from "@/config/site";

export const metadata = {
    title: "Checkout | Moolre Commerce",
};

export default function CheckoutPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black/50">
            {/* Simple Checkout Header */}
            <header className="border-b bg-background py-4">
                <Container className="flex items-center justify-between">
                    <Link href="/" className="font-heading text-2xl font-bold tracking-tight text-primary">
                        {siteConfig.name}
                    </Link>
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Lock className="mr-2 h-4 w-4" />
                        Secure Checkout
                    </div>
                </Container>
            </header>

            <main className="py-10">
                <Container>
                    <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
                        <div className="lg:col-span-7">
                            <CheckoutForm />
                        </div>
                        <div className="lg:col-span-5 lg:sticky lg:top-24">
                            <CheckoutSummary />
                        </div>
                    </div>
                </Container>
            </main>
        </div>
    );
}
