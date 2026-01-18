import { Container } from "@/components/shared/container";
import { Heading } from "@/components/shared/heading";
import { RotateCcw, Clock, CheckCircle, AlertCircle } from "lucide-react";

export const metadata = {
    title: "Returns & Refunds | Moolre Commerce",
    description: "Our return policy and how to request a refund.",
};

export default function ReturnsPage() {
    return (
        <section className="py-12">
            <Container>
                <div className="text-center mb-12">
                    <Heading
                        title="Returns & Refunds"
                        description="We want you to love your purchase. If not, here's how we can help."
                        align="center"
                    />
                </div>

                <div className="max-w-3xl mx-auto space-y-12">
                    {/* Return Policy Overview */}
                    <div className="grid sm:grid-cols-3 gap-6">
                        <div className="text-center p-6 rounded-2xl border">
                            <Clock className="h-8 w-8 mx-auto mb-3 text-primary" />
                            <h3 className="font-bold mb-1">14 Days</h3>
                            <p className="text-sm text-muted-foreground">Return window from delivery</p>
                        </div>
                        <div className="text-center p-6 rounded-2xl border">
                            <RotateCcw className="h-8 w-8 mx-auto mb-3 text-primary" />
                            <h3 className="font-bold mb-1">Free Returns</h3>
                            <p className="text-sm text-muted-foreground">On defective items</p>
                        </div>
                        <div className="text-center p-6 rounded-2xl border">
                            <CheckCircle className="h-8 w-8 mx-auto mb-3 text-primary" />
                            <h3 className="font-bold mb-1">Easy Process</h3>
                            <p className="text-sm text-muted-foreground">Simple online request</p>
                        </div>
                    </div>

                    {/* Eligible Items */}
                    <div>
                        <h2 className="text-xl font-bold mb-4">What Can Be Returned?</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">✓ Eligible</h4>
                                <ul className="text-sm space-y-1 text-muted-foreground">
                                    <li>• Unused items in original packaging</li>
                                    <li>• Items with all tags attached</li>
                                    <li>• Defective or damaged products</li>
                                    <li>• Wrong item received</li>
                                </ul>
                            </div>
                            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">✗ Not Eligible</h4>
                                <ul className="text-sm space-y-1 text-muted-foreground">
                                    <li>• Used or worn items</li>
                                    <li>• Items without original packaging</li>
                                    <li>• Items on final sale</li>
                                    <li>• Personalized/custom items</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* How to Return */}
                    <div>
                        <h2 className="text-xl font-bold mb-4">How to Request a Return</h2>
                        <ol className="space-y-4">
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</span>
                                <div>
                                    <h4 className="font-semibold">Contact Us</h4>
                                    <p className="text-sm text-muted-foreground">Email us at returns@moolre.com with your order number.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</span>
                                <div>
                                    <h4 className="font-semibold">Get Approval</h4>
                                    <p className="text-sm text-muted-foreground">We'll review your request and send return instructions.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</span>
                                <div>
                                    <h4 className="font-semibold">Ship It Back</h4>
                                    <p className="text-sm text-muted-foreground">Pack the item securely and drop it off or schedule a pickup.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">4</span>
                                <div>
                                    <h4 className="font-semibold">Get Your Refund</h4>
                                    <p className="text-sm text-muted-foreground">Refunds are processed within 5-7 business days after we receive the item.</p>
                                </div>
                            </li>
                        </ol>
                    </div>

                    {/* Note */}
                    <div className="p-6 rounded-2xl bg-muted/50 flex items-start gap-4">
                        <AlertCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold mb-1">Need Help?</h4>
                            <p className="text-sm text-muted-foreground">
                                For any questions about returns, contact our customer support team. We're here to help make the process as smooth as possible.
                            </p>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
