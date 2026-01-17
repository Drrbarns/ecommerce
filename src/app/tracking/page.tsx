import { Header } from "@/components/layout/header";
import { FooterWithCMS } from "@/components/layout/footer-with-cms";
import { TrackingForm } from "@/components/tracking/tracking-form";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Track Your Order | Moolre",
    description: "Enter your tracking number to see the current status of your shipment.",
};

export default function TrackingPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 py-12">
                <TrackingForm />
            </main>
            <FooterWithCMS />
        </div>
    );
}
