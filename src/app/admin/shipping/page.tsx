import { Truck, MapPin, DollarSign } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getShippingZones } from "@/lib/actions/settings-actions";
import { formatMoney } from "@/lib/money";

interface ShippingRate {
    id: string;
    name: string;
    description?: string;
    price_minor: number;
    free_above_minor?: number;
    estimated_days_min?: number;
    estimated_days_max?: number;
    is_active: boolean;
}

interface ShippingZone {
    id: string;
    name: string;
    countries: string[];
    is_active: boolean;
    shipping_rates: ShippingRate[];
}

export default async function AdminShippingPage() {
    const zones = await getShippingZones() as ShippingZone[];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Shipping</h1>
                <p className="text-muted-foreground">
                    Manage shipping zones and rates.
                </p>
            </div>

            {/* Shipping Zones */}
            {zones.map((zone) => (
                <Card key={zone.id}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <MapPin className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle>{zone.name}</CardTitle>
                                    <CardDescription>
                                        Countries: {zone.countries.join(', ')}
                                    </CardDescription>
                                </div>
                            </div>
                            <Badge variant={zone.is_active ? "default" : "secondary"}>
                                {zone.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {zone.shipping_rates && zone.shipping_rates.length > 0 ? (
                                zone.shipping_rates.map((rate: {
                                    id: string;
                                    name: string;
                                    description?: string;
                                    price_minor: number;
                                    free_above_minor?: number;
                                    estimated_days_min?: number;
                                    estimated_days_max?: number;
                                    is_active: boolean;
                                }) => (
                                    <div
                                        key={rate.id}
                                        className="flex items-center justify-between p-4 border rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Truck className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">{rate.name}</p>
                                                {rate.description && (
                                                    <p className="text-sm text-muted-foreground">{rate.description}</p>
                                                )}
                                                {rate.estimated_days_min && rate.estimated_days_max && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {rate.estimated_days_min}-{rate.estimated_days_max} business days
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">{formatMoney(rate.price_minor)}</p>
                                            {rate.free_above_minor && (
                                                <p className="text-xs text-green-600">
                                                    Free above {formatMoney(rate.free_above_minor)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No shipping rates configured for this zone.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}

            {zones.length === 0 && (
                <Card>
                    <CardContent className="py-8">
                        <p className="text-muted-foreground text-center">
                            No shipping zones configured. Run migrations to set up default zones.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
