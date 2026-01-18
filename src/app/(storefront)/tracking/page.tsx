import { TrackingForm } from "@/components/tracking/tracking-form";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Track Your Order | Moolre",
    description: "Enter your tracking number to see the current status of your shipment.",
};

export default function TrackingPage() {
    return (
        <div className="py-12">
            <TrackingForm />
        </div>
    );
}
