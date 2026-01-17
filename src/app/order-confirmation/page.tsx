import Link from "next/link";
import { CheckCircle, ArrowRight, Package, Clock, XCircle } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { getOrder } from "@/lib/actions/checkout-actions";
import { formatMoney } from "@/lib/money";

interface OrderItem {
    id: string;
    product_name?: string;
    quantity: number;
    price_minor?: number;
    price_at_time: number;
}

interface Order {
    id: string;
    status: string;
    total: number;
    total_minor?: number;
    order_items?: OrderItem[];
}

interface OrderConfirmationPageProps {
    searchParams: Promise<{ orderId?: string; status?: string }>;
}

export default async function OrderConfirmationPage({
    searchParams,
}: OrderConfirmationPageProps) {
    const params = await searchParams;
    const orderId = params.orderId;
    const status = params.status || 'success';

    let order: Order | null = null;
    if (orderId) {
        order = await getOrder(orderId) as Order | null;
    }

    const isSuccess = status === 'success' && order?.status === 'paid';
    const isPending = status === 'pending' || order?.status === 'pending';
    const isFailed = status === 'failed' || status === 'error';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black/50 flex flex-col">
            {/* Simple Header */}
            <header className="border-b bg-background py-4">
                <Container className="flex items-center justify-between">
                    <Link href="/" className="font-heading text-2xl font-bold tracking-tight text-primary">
                        {siteConfig.name}
                    </Link>
                </Container>
            </header>

            <main className="flex-1 flex items-center justify-center py-16">
                <Container className="max-w-lg text-center">
                    {/* Success */}
                    {isSuccess && (
                        <>
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight mb-4">
                                Payment Successful!
                            </h1>
                            <p className="text-muted-foreground mb-6">
                                Thank you for your order. We&apos;ve sent a confirmation email with your order details.
                            </p>
                        </>
                    )}

                    {/* Pending */}
                    {isPending && !isFailed && (
                        <>
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                                <Clock className="h-10 w-10 text-yellow-600" />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight mb-4">
                                Order Pending
                            </h1>
                            <p className="text-muted-foreground mb-6">
                                Your order has been created but payment is still being processed. We&apos;ll notify you once it&apos;s confirmed.
                            </p>
                        </>
                    )}

                    {/* Failed */}
                    {isFailed && (
                        <>
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                                <XCircle className="h-10 w-10 text-red-600" />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight mb-4">
                                Payment Failed
                            </h1>
                            <p className="text-muted-foreground mb-6">
                                We couldn&apos;t process your payment. Please try again or use a different payment method.
                            </p>
                        </>
                    )}

                    {/* Order Details */}
                    {order && (
                        <div className="mb-8 rounded-lg border bg-background p-6 text-left">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Order ID</p>
                                    <p className="font-mono text-sm font-medium">{order.id.slice(0, 8)}...</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Total</p>
                                    <p className="font-medium text-lg">
                                        {formatMoney(order.total_minor || order.total * 100)}
                                    </p>
                                </div>
                            </div>

                            {order.order_items && order.order_items.length > 0 && (
                                <div className="border-t pt-4 mt-4">
                                    <p className="text-sm font-medium mb-2">Items</p>
                                    <div className="space-y-2">
                                        {order.order_items.map((item: {
                                            id: string;
                                            product_name?: string;
                                            quantity: number;
                                            price_minor?: number;
                                            price_at_time: number;
                                        }) => (
                                            <div key={item.id} className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    {item.product_name || 'Product'} × {item.quantity}
                                                </span>
                                                <span>
                                                    {formatMoney((item.price_minor || item.price_at_time * 100) * item.quantity)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {!order && orderId && (
                        <div className="mb-8 rounded-lg border bg-background p-4">
                            <p className="text-sm text-muted-foreground">Order ID</p>
                            <p className="font-mono text-sm font-medium">{orderId}</p>
                        </div>
                    )}

                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                        {isFailed ? (
                            <>
                                <Button asChild className="rounded-full">
                                    <Link href="/checkout">
                                        Try Again <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button variant="outline" asChild className="rounded-full">
                                    <Link href="/cart">
                                        Back to Cart
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button asChild className="rounded-full">
                                    <Link href="/shop">
                                        Continue Shopping <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button variant="outline" asChild className="rounded-full">
                                    <Link href="/">
                                        <Package className="mr-2 h-4 w-4" /> Back Home
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>
                </Container>
            </main>
        </div>
    );
}
