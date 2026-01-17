import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Store, Truck, CreditCard, Bell } from "lucide-react";
import { BrandingSettings } from "./branding-settings";
import { getStoreSettings } from "@/lib/actions/settings-actions";

export default async function AdminSettingsPage() {
    const settings = await getStoreSettings();

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your store settings and preferences.
                </p>
            </div>

            <Tabs defaultValue="branding" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:w-auto lg:inline-flex">
                    <TabsTrigger value="branding" className="gap-2">
                        <Palette className="h-4 w-4" />
                        Branding
                    </TabsTrigger>
                    <TabsTrigger value="store" className="gap-2">
                        <Store className="h-4 w-4" />
                        Store Info
                    </TabsTrigger>
                    <TabsTrigger value="shipping" className="gap-2">
                        <Truck className="h-4 w-4" />
                        Shipping
                    </TabsTrigger>
                    <TabsTrigger value="payments" className="gap-2">
                        <CreditCard className="h-4 w-4" />
                        Payments
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-2">
                        <Bell className="h-4 w-4" />
                        Notifications
                    </TabsTrigger>
                </TabsList>

                {/* Branding Tab */}
                <TabsContent value="branding">
                    {settings ? (
                        <BrandingSettings settings={settings} />
                    ) : (
                        <Card>
                            <CardContent className="p-6">
                                <p className="text-muted-foreground">
                                    No settings found. Please check your database connection.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Store Info Tab */}
                <TabsContent value="store">
                    <Card>
                        <CardHeader>
                            <CardTitle>Store Information</CardTitle>
                            <CardDescription>
                                Contact details and business information.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="storeEmail">Email</Label>
                                    <Input
                                        id="storeEmail"
                                        type="email"
                                        defaultValue={settings?.email || ""}
                                        placeholder="hello@store.com"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="storePhone">Phone</Label>
                                    <Input
                                        id="storePhone"
                                        type="tel"
                                        defaultValue={settings?.phone || ""}
                                        placeholder="+233 20 000 0000"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="whatsapp">WhatsApp</Label>
                                <Input
                                    id="whatsapp"
                                    defaultValue={settings?.whatsapp || ""}
                                    placeholder="+233 20 000 0000"
                                />
                            </div>
                            <Separator />
                            <div className="grid gap-2">
                                <Label>Currency & Region</Label>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Input defaultValue={`${settings?.currency_symbol || '₵'} ${settings?.currency || 'GHS'}`} disabled />
                                    <Input defaultValue={settings?.country || "Ghana (GH)"} disabled />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Currency and region settings are fixed. Contact support to change.
                                </p>
                            </div>
                            <Button>Save Store Info</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Shipping Tab */}
                <TabsContent value="shipping">
                    <Card>
                        <CardHeader>
                            <CardTitle>Shipping Settings</CardTitle>
                            <CardDescription>
                                Configure shipping rates and options.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="flatRate">Flat Rate Shipping (₵)</Label>
                                    <Input id="flatRate" type="number" defaultValue="25.00" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="freeThreshold">Free Shipping Above (₵)</Label>
                                    <Input id="freeThreshold" type="number" defaultValue="500.00" />
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                For advanced shipping zones and rates, go to the{" "}
                                <a href="/admin/shipping" className="text-primary underline">Shipping page</a>.
                            </p>
                            <Button>Save Shipping Settings</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Payments Tab */}
                <TabsContent value="payments">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Methods</CardTitle>
                            <CardDescription>
                                Configure payment gateway integrations.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <p className="font-medium">Moolre Pay</p>
                                    <p className="text-sm text-muted-foreground">Primary payment gateway</p>
                                </div>
                                <span className="text-sm text-green-600 font-medium">Connected</span>
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <p className="font-medium">Paystack</p>
                                    <p className="text-sm text-muted-foreground">Alternative payment option</p>
                                </div>
                                <Button variant="outline" size="sm">Connect</Button>
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <p className="font-medium">Flutterwave</p>
                                    <p className="text-sm text-muted-foreground">Alternative payment option</p>
                                </div>
                                <Button variant="outline" size="sm">Connect</Button>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                For detailed payment settings, go to the{" "}
                                <a href="/admin/payments" className="text-primary underline">Payments page</a>.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Settings</CardTitle>
                            <CardDescription>
                                Configure email and alert preferences.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="orderEmail">Order Notification Email</Label>
                                <Input
                                    id="orderEmail"
                                    type="email"
                                    defaultValue={settings?.order_notification_email || ""}
                                    placeholder="orders@store.com"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Receives new order notifications.
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="lowStock">Low Stock Threshold</Label>
                                <Input
                                    id="lowStock"
                                    type="number"
                                    defaultValue={settings?.low_stock_threshold || 5}
                                    min={0}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Get alerted when product stock falls below this number.
                                </p>
                            </div>
                            <Button>Save Notification Settings</Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
