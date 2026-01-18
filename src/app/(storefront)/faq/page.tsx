import { Container } from "@/components/shared/container";
import { Heading } from "@/components/shared/heading";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const metadata = {
    title: "FAQ | Moolre Commerce",
    description: "Frequently asked questions about shopping with us.",
};

const faqs = [
    {
        question: "How long does shipping take?",
        answer: "Standard shipping typically takes 3-5 business days within Accra and 5-7 business days for other regions in Ghana. Express shipping options are available at checkout."
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept all major payment methods including Mobile Money (MTN, Vodafone Cash, AirtelTigo Money), Visa/Mastercard, and bank transfers through Paystack and Flutterwave."
    },
    {
        question: "What is your return policy?",
        answer: "We offer a 14-day return policy for unused items in their original packaging. Please visit our Returns page for detailed instructions."
    },
    {
        question: "How can I track my order?",
        answer: "Once your order ships, you'll receive a tracking number via email. You can use this on our Order Tracking page to see real-time updates."
    },
    {
        question: "Do you offer international shipping?",
        answer: "Currently, we only ship within Ghana. We're working on expanding our delivery network to West Africa soon."
    },
    {
        question: "How do I contact customer support?",
        answer: "You can reach us via our Contact page, WhatsApp, or email at support@moolre.com. We respond within 24 hours."
    },
];

export default function FAQPage() {
    return (
        <section className="py-12">
            <Container>
                <Heading
                    title="Frequently Asked Questions"
                    description="Find answers to common questions about our products and services."
                    className="mb-12 text-center"
                />

                <Accordion type="single" collapsible className="max-w-3xl mx-auto">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-left">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </Container>
        </section>
    );
}
