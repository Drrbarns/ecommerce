import { Container } from "@/components/shared/container";
import { Heading } from "@/components/shared/heading";
import { Truck, Clock, MapPin, Package } from "lucide-react";

export const metadata = {
    title: "Shipping Information | Moolre Commerce",
    description: "Learn about our shipping options, delivery times, and costs.",
};

const shippingInfo = [
    {
        icon: Truck,
        title: "Standard Delivery",
        description: "3-5 business days within Greater Accra, 5-7 business days for other regions.",
        cost: "₵25.00 (Free on orders over ₵500)"
    },
    {
        icon: Clock,
        title: "Express Delivery",
        description: "Next-day delivery available for orders placed before 2 PM within Accra.",
        cost: "₵50.00"
    },
    {
        icon: MapPin,
        title: "Coverage Area",
        description: "We currently deliver to all regions in Ghana. Remote areas may take additional 1-2 days.",
        cost: "Varies by location"
    },
    {
        icon: Package,
        title: "Order Tracking",
        description: "All orders include real-time tracking. You'll receive updates via SMS and email.",
        cost: "Included"
    },
];

export default function ShippingPage() {
    return (
        <section className="py-12">
            <Container>
                <Heading
                    title="Shipping Information"
                    description="Everything you need to know about getting your order delivered."
                    className="mb-12 text-center"
                />

                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {shippingInfo.map((item, index) => (
                        <div key={index} className="p-6 rounded-2xl border bg-card">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-lg bg-primary/10">
                                    <item.icon className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                                    <p className="text-muted-foreground text-sm mb-2">{item.description}</p>
                                    <p className="font-medium text-primary">{item.cost}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 max-w-3xl mx-auto p-6 rounded-2xl bg-muted/50">
                    <h3 className="font-bold text-lg mb-4">Important Notes</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Delivery times are estimates and may vary during peak seasons or holidays.</li>
                        <li>• Someone must be available to receive the package at the delivery address.</li>
                        <li>• For special delivery instructions, please add a note during checkout.</li>
                        <li>• Contact us for bulk orders or corporate deliveries.</li>
                    </ul>
                </div>
            </Container>
        </section>
    );
}
