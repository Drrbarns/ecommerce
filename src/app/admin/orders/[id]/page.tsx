import { getOrderById } from "@/lib/actions/order-actions";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fromMinorUnits } from "@/lib/money";
import { Package, Truck, MapPin, CreditCard, Clock } from "lucide-react";
import Link from "next/link";
import { OrderActions } from "@/components/admin/order-actions";

export default async function OrderDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const order = await getOrderById(id);

    if (!order) {
        notFound();
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Order #{order.id.substring(0, 8)}
                        </h1>
                        <Badge variant={
                            order.status === 'delivered' ? 'default' :
                                order.status === 'shipped' ? 'secondary' :
                                    order.status === 'processing' ? 'outline' :
                                        order.status === 'cancelled' ? 'destructive' :
                                            'secondary'
                        }>
                            {order.status}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/admin/orders">Back to Orders</Link>
                    </Button>
                    <OrderActions orderId={order.id} currentStatus={order.status} />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Content - 2 columns */}
                <div className="md:col-span-2 space-y-6">
                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Order Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {order.items && order.items.map((item: any) => (
                                    <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg border">
                                        {item.product?.image && (
                                            <img
                                                src={item.product.image}
                                                alt={item.product?.name || "Product"}
                                                className="w-16 h-16 rounded object-cover"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <p className="font-medium">{item.product?.name || item.product_name}</p>
                                            {item.variant_name && (
                                                <p className="text-sm text-muted-foreground">{item.variant_name}</p>
                                            )}
                                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-bold">₵{fromMinorUnits(item.price_minor * item.quantity)}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className="mt-6 pt-4 border-t space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal</span>
                                    <span>₵{fromMinorUnits(order.subtotal_minor || 0)}</span>
                                </div>
                                {order.shipping_minor > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span>Shipping</span>
                                        <span>₵{fromMinorUnits(order.shipping_minor)}</span>
                                    </div>
                                )}
                                {order.discount_minor > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Discount</span>
                                        <span>-₵{fromMinorUnits(order.discount_minor)}</span>
                                    </div>
                                )}
                                {order.tax_minor > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span>Tax</span>
                                        <span>₵{fromMinorUnits(order.tax_minor)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                    <span>Total</span>
                                    <span>₵{fromMinorUnits(order.total_minor || 0)}</span>
                                </div>
                                {order.refunded_minor > 0 && (
                                    <div className="flex justify-between text-sm text-red-600 pt-2 border-t">
                                        <span>Refunded</span>
                                        <span>-₵{fromMinorUnits(order.refunded_minor)}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Order Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {order.timeline && order.timeline.length > 0 ? (
                                <div className="space-y-4">
                                    {order.timeline.map((event: any) => (
                                        <div key={event.id} className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-3 h-3 rounded-full ${event.event_type === 'created' ? 'bg-blue-500' :
                                                    event.event_type === 'status_change' ? 'bg-purple-500' :
                                                        event.event_type === 'payment' ? 'bg-green-500' :
                                                            event.event_type === 'tracking_added' ? 'bg-orange-500' :
                                                                event.event_type === 'refund' ? 'bg-red-500' :
                                                                    'bg-gray-400'
                                                    }`} />
                                                <div className="w-0.5 h-full bg-border" />
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <p className="font-medium">{event.title}</p>
                                                {event.description && (
                                                    <p className="text-sm text-muted-foreground">{event.description}</p>
                                                )}
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {new Date(event.created_at).toLocaleString()}
                                                    {event.staff && ` • by ${event.staff.first_name} ${event.staff.last_name}`}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No timeline events yet</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar - 1 column */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-medium">{order.user_email}</p>
                            </div>
                            {order.customer && (
                                <>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Name</p>
                                        <p className="font-medium">
                                            {order.customer.first_name} {order.customer.last_name}
                                        </p>
                                    </div>
                                    {order.customer.phone && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Phone</p>
                                            <p className="font-medium">{order.customer.phone}</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Shipping Address */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Shipping Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {order.shipping_address ? (
                                <div className="text-sm space-y-1">
                                    {typeof order.shipping_address === 'object' ? (
                                        <>
                                            <p className="font-medium">{(order.shipping_address as any).name}</p>
                                            <p>{(order.shipping_address as any).address}</p>
                                            <p>{(order.shipping_address as any).city}, {(order.shipping_address as any).region}</p>
                                            <p>{(order.shipping_address as any).phone}</p>
                                        </>
                                    ) : (
                                        <p>{order.shipping_address}</p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No shipping address</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Shipping Tracking */}
                    {order.tracking_number && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Truck className="h-5 w-5" />
                                    Shipping Tracking
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Carrier</p>
                                    <p className="font-medium">{order.shipping_carrier}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Tracking Number</p>
                                    <p className="font-medium font-mono">{order.tracking_number}</p>
                                </div>
                                {order.tracking_url && (
                                    <Button variant="outline" size="sm" className="w-full" asChild>
                                        <a href={order.tracking_url} target="_blank" rel="noopener noreferrer">
                                            Track Package
                                        </a>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Payment */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Payment
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {order.payment_intent && order.payment_intent.length > 0 ? (
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Provider</p>
                                        <p className="font-medium capitalize">{order.payment_intent[0].provider}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Status</p>
                                        <Badge>{order.payment_intent[0].status}</Badge>
                                    </div>
                                    {order.payment_intent[0].provider_reference && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Reference</p>
                                            <p className="font-mono text-xs">{order.payment_intent[0].provider_reference}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No payment information</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
