"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
    Save,
    Loader2,
    Code,
    BarChart3,
    Shield,
    Cookie,
    MessageCircle,
    Zap,
    AlertTriangle,
    Eye,
    EyeOff
} from "lucide-react";
import { updateAdvancedSettings, AdvancedSettings } from "@/lib/actions/cms-advanced-actions";

interface AdvancedSettingsEditorProps {
    settings: AdvancedSettings | null;
}

export function AdvancedSettingsEditor({ settings }: AdvancedSettingsEditorProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showApiKeys, setShowApiKeys] = useState(false);

    const [formData, setFormData] = useState<Partial<AdvancedSettings>>({
        // Custom CSS & Scripts
        custom_css: settings?.custom_css || "",
        custom_head_scripts: settings?.custom_head_scripts || "",
        custom_body_scripts: settings?.custom_body_scripts || "",

        // Analytics & Tracking
        google_analytics_id: settings?.google_analytics_id || "",
        google_tag_manager_id: settings?.google_tag_manager_id || "",
        facebook_pixel_id: settings?.facebook_pixel_id || "",
        tiktok_pixel_id: settings?.tiktok_pixel_id || "",
        hotjar_id: settings?.hotjar_id || "",

        // SEO & Meta
        google_site_verification: settings?.google_site_verification || "",
        bing_site_verification: settings?.bing_site_verification || "",
        default_robots_meta: settings?.default_robots_meta || "index, follow",

        // Maintenance Mode
        maintenance_mode: settings?.maintenance_mode || false,
        maintenance_message: settings?.maintenance_message || "",

        // Cookie Consent
        cookie_consent_enabled: settings?.cookie_consent_enabled ?? true,
        cookie_consent_message: settings?.cookie_consent_message || "",
        cookie_policy_url: settings?.cookie_policy_url || "/privacy",

        // Social Proof & Trust
        show_stock_warning: settings?.show_stock_warning ?? true,
        low_stock_threshold: settings?.low_stock_threshold || 5,
        show_sold_count: settings?.show_sold_count || false,

        // Performance
        lazy_load_images: settings?.lazy_load_images ?? true,
        enable_image_optimization: settings?.enable_image_optimization ?? true,

        // Chat & Support
        tawk_to_id: settings?.tawk_to_id || "",
        crisp_website_id: settings?.crisp_website_id || "",
        intercom_app_id: settings?.intercom_app_id || "",
        whatsapp_number: settings?.whatsapp_number || "",
        whatsapp_message: settings?.whatsapp_message || "",

        // Third-party Integrations
        mailchimp_api_key: settings?.mailchimp_api_key || "",
        mailchimp_list_id: settings?.mailchimp_list_id || "",
        sendgrid_api_key: settings?.sendgrid_api_key || "",
        recaptcha_site_key: settings?.recaptcha_site_key || "",
        recaptcha_secret_key: settings?.recaptcha_secret_key || "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await updateAdvancedSettings(formData);

        setIsLoading(false);

        if (result.success) {
            toast.success("Advanced settings saved!");
            router.refresh();
        } else {
            toast.error(result.error || "Failed to save settings");
        }
    };

    const updateField = (field: keyof AdvancedSettings, value: unknown) => {
        setFormData({ ...formData, [field]: value });
    };

    if (!settings) {
        return (
            <Card>
                <CardContent className="p-6 text-center">
                    <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                        Advanced settings table not found. Please run migration 020_cms_advanced.sql.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="scripts" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
                    <TabsTrigger value="scripts" className="text-xs">
                        <Code className="h-3 w-3 mr-1" />
                        Scripts
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="text-xs">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Analytics
                    </TabsTrigger>
                    <TabsTrigger value="seo" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        SEO
                    </TabsTrigger>
                    <TabsTrigger value="maintenance" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Maintenance
                    </TabsTrigger>
                    <TabsTrigger value="chat" className="text-xs">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Chat
                    </TabsTrigger>
                    <TabsTrigger value="performance" className="text-xs">
                        <Zap className="h-3 w-3 mr-1" />
                        Performance
                    </TabsTrigger>
                </TabsList>

                {/* Custom Scripts Tab */}
                <TabsContent value="scripts" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Code className="h-5 w-5" />
                                Custom CSS
                            </CardTitle>
                            <CardDescription>
                                Add custom CSS that will be injected into all pages.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={formData.custom_css}
                                onChange={(e) => updateField("custom_css", e.target.value)}
                                placeholder={`/* Custom CSS */\n.my-class {\n  color: red;\n}`}
                                className="font-mono text-sm min-h-[200px]"
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Head Scripts</CardTitle>
                            <CardDescription>
                                Scripts injected in the &lt;head&gt; section (e.g., meta tags, early loading scripts).
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={formData.custom_head_scripts}
                                onChange={(e) => updateField("custom_head_scripts", e.target.value)}
                                placeholder={`<!-- Head scripts -->\n<script>...</script>`}
                                className="font-mono text-sm min-h-[150px]"
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Body Scripts</CardTitle>
                            <CardDescription>
                                Scripts injected before &lt;/body&gt; (e.g., chat widgets, analytics).
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={formData.custom_body_scripts}
                                onChange={(e) => updateField("custom_body_scripts", e.target.value)}
                                placeholder={`<!-- Body scripts -->\n<script>...</script>`}
                                className="font-mono text-sm min-h-[150px]"
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Google Analytics
                            </CardTitle>
                            <CardDescription>
                                Track website traffic and user behavior.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="ga4">Google Analytics 4 (Measurement ID)</Label>
                                <Input
                                    id="ga4"
                                    value={formData.google_analytics_id}
                                    onChange={(e) => updateField("google_analytics_id", e.target.value)}
                                    placeholder="G-XXXXXXXXXX"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gtm">Google Tag Manager (Container ID)</Label>
                                <Input
                                    id="gtm"
                                    value={formData.google_tag_manager_id}
                                    onChange={(e) => updateField("google_tag_manager_id", e.target.value)}
                                    placeholder="GTM-XXXXXXX"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Social Media Pixels</CardTitle>
                            <CardDescription>
                                Track conversions and retarget visitors.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fbPixel">Facebook Pixel ID</Label>
                                <Input
                                    id="fbPixel"
                                    value={formData.facebook_pixel_id}
                                    onChange={(e) => updateField("facebook_pixel_id", e.target.value)}
                                    placeholder="XXXXXXXXXXXXXXX"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tiktokPixel">TikTok Pixel ID</Label>
                                <Input
                                    id="tiktokPixel"
                                    value={formData.tiktok_pixel_id}
                                    onChange={(e) => updateField("tiktok_pixel_id", e.target.value)}
                                    placeholder="XXXXXXXXXXXXXXX"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Heatmaps & Session Recording</CardTitle>
                            <CardDescription>
                                Understand user behavior with visual tools.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="hotjar">Hotjar Site ID</Label>
                                <Input
                                    id="hotjar"
                                    value={formData.hotjar_id}
                                    onChange={(e) => updateField("hotjar_id", e.target.value)}
                                    placeholder="XXXXXXX"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SEO Tab */}
                <TabsContent value="seo" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Site Verification
                            </CardTitle>
                            <CardDescription>
                                Verify ownership with search engines.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="googleVerify">Google Site Verification</Label>
                                <Input
                                    id="googleVerify"
                                    value={formData.google_site_verification}
                                    onChange={(e) => updateField("google_site_verification", e.target.value)}
                                    placeholder="google-site-verification=XXXXXXXXXXXXX"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bingVerify">Bing Site Verification</Label>
                                <Input
                                    id="bingVerify"
                                    value={formData.bing_site_verification}
                                    onChange={(e) => updateField("bing_site_verification", e.target.value)}
                                    placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Robots Meta</CardTitle>
                            <CardDescription>
                                Default robots meta tag for all pages.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="robots">Default Robots Meta</Label>
                                <Input
                                    id="robots"
                                    value={formData.default_robots_meta}
                                    onChange={(e) => updateField("default_robots_meta", e.target.value)}
                                    placeholder="index, follow"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Common values: &quot;index, follow&quot;, &quot;noindex, nofollow&quot;, &quot;noindex, follow&quot;
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Cookie className="h-5 w-5" />
                                Cookie Consent
                            </CardTitle>
                            <CardDescription>
                                GDPR-compliant cookie consent banner.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Enable Cookie Consent Banner</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Show cookie consent popup to visitors
                                    </p>
                                </div>
                                <Switch
                                    checked={formData.cookie_consent_enabled}
                                    onCheckedChange={(v) => updateField("cookie_consent_enabled", v)}
                                />
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <Label htmlFor="cookieMessage">Consent Message</Label>
                                <Textarea
                                    id="cookieMessage"
                                    value={formData.cookie_consent_message}
                                    onChange={(e) => updateField("cookie_consent_message", e.target.value)}
                                    placeholder="We use cookies..."
                                    rows={2}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cookiePolicy">Cookie Policy URL</Label>
                                <Input
                                    id="cookiePolicy"
                                    value={formData.cookie_policy_url}
                                    onChange={(e) => updateField("cookie_policy_url", e.target.value)}
                                    placeholder="/privacy"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Maintenance Tab */}
                <TabsContent value="maintenance" className="space-y-6">
                    <Card className={formData.maintenance_mode ? "border-yellow-500" : ""}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className={`h-5 w-5 ${formData.maintenance_mode ? "text-yellow-500" : ""}`} />
                                Maintenance Mode
                                {formData.maintenance_mode && (
                                    <Badge variant="destructive">ACTIVE</Badge>
                                )}
                            </CardTitle>
                            <CardDescription>
                                Enable maintenance mode to show a coming soon page to visitors.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                <div>
                                    <Label className="text-base">Enable Maintenance Mode</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Visitors will see a maintenance page instead of your store
                                    </p>
                                </div>
                                <Switch
                                    checked={formData.maintenance_mode}
                                    onCheckedChange={(v) => updateField("maintenance_mode", v)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                                <Textarea
                                    id="maintenanceMessage"
                                    value={formData.maintenance_message}
                                    onChange={(e) => updateField("maintenance_message", e.target.value)}
                                    placeholder="We're currently performing scheduled maintenance..."
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Social Proof Settings</CardTitle>
                            <CardDescription>
                                Configure trust signals and urgency indicators.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Show Low Stock Warning</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Display &quot;Only X left&quot; on product pages
                                    </p>
                                </div>
                                <Switch
                                    checked={formData.show_stock_warning}
                                    onCheckedChange={(v) => updateField("show_stock_warning", v)}
                                />
                            </div>
                            {formData.show_stock_warning && (
                                <div className="space-y-2">
                                    <Label htmlFor="stockThreshold">Low Stock Threshold</Label>
                                    <Input
                                        id="stockThreshold"
                                        type="number"
                                        value={formData.low_stock_threshold}
                                        onChange={(e) => updateField("low_stock_threshold", parseInt(e.target.value) || 5)}
                                        min={1}
                                        max={100}
                                    />
                                </div>
                            )}
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Show Sold Count</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Display &quot;X sold&quot; on product pages
                                    </p>
                                </div>
                                <Switch
                                    checked={formData.show_sold_count}
                                    onCheckedChange={(v) => updateField("show_sold_count", v)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Chat Tab */}
                <TabsContent value="chat" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageCircle className="h-5 w-5" />
                                Live Chat Widgets
                            </CardTitle>
                            <CardDescription>
                                Add live chat support to your store (only one will be active).
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="tawkTo">Tawk.to Property ID</Label>
                                <Input
                                    id="tawkTo"
                                    value={formData.tawk_to_id}
                                    onChange={(e) => updateField("tawk_to_id", e.target.value)}
                                    placeholder="XXXXXXXXXXXXXXXXXXXXXXXX/XXXXXXXXXX"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Free live chat widget. Get your ID from tawk.to dashboard.
                                </p>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <Label htmlFor="crisp">Crisp Website ID</Label>
                                <Input
                                    id="crisp"
                                    value={formData.crisp_website_id}
                                    onChange={(e) => updateField("crisp_website_id", e.target.value)}
                                    placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
                                />
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <Label htmlFor="intercom">Intercom App ID</Label>
                                <Input
                                    id="intercom"
                                    value={formData.intercom_app_id}
                                    onChange={(e) => updateField("intercom_app_id", e.target.value)}
                                    placeholder="XXXXXXXX"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>WhatsApp Button</CardTitle>
                            <CardDescription>
                                Add a floating WhatsApp chat button.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                                <Input
                                    id="whatsapp"
                                    value={formData.whatsapp_number}
                                    onChange={(e) => updateField("whatsapp_number", e.target.value)}
                                    placeholder="+233200000000"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Include country code without spaces or dashes.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="whatsappMsg">Default Message</Label>
                                <Input
                                    id="whatsappMsg"
                                    value={formData.whatsapp_message}
                                    onChange={(e) => updateField("whatsapp_message", e.target.value)}
                                    placeholder="Hello! I have a question..."
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Performance Tab */}
                <TabsContent value="performance" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5" />
                                Image Optimization
                            </CardTitle>
                            <CardDescription>
                                Improve page load speed with image optimizations.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Lazy Load Images</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Load images only when they enter the viewport
                                    </p>
                                </div>
                                <Switch
                                    checked={formData.lazy_load_images}
                                    onCheckedChange={(v) => updateField("lazy_load_images", v)}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Enable Image Optimization</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Automatically optimize and serve WebP images
                                    </p>
                                </div>
                                <Switch
                                    checked={formData.enable_image_optimization}
                                    onCheckedChange={(v) => updateField("enable_image_optimization", v)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Email Integrations</CardTitle>
                                    <CardDescription>
                                        Connect email marketing services.
                                    </CardDescription>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowApiKeys(!showApiKeys)}
                                >
                                    {showApiKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    {showApiKeys ? "Hide" : "Show"} Keys
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="mailchimpKey">Mailchimp API Key</Label>
                                <Input
                                    id="mailchimpKey"
                                    type={showApiKeys ? "text" : "password"}
                                    value={formData.mailchimp_api_key}
                                    onChange={(e) => updateField("mailchimp_api_key", e.target.value)}
                                    placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX-usX"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mailchimpList">Mailchimp List ID</Label>
                                <Input
                                    id="mailchimpList"
                                    value={formData.mailchimp_list_id}
                                    onChange={(e) => updateField("mailchimp_list_id", e.target.value)}
                                    placeholder="XXXXXXXXXX"
                                />
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <Label htmlFor="sendgridKey">SendGrid API Key</Label>
                                <Input
                                    id="sendgridKey"
                                    type={showApiKeys ? "text" : "password"}
                                    value={formData.sendgrid_api_key}
                                    onChange={(e) => updateField("sendgrid_api_key", e.target.value)}
                                    placeholder="SG.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Google reCAPTCHA</CardTitle>
                            <CardDescription>
                                Protect forms from spam and abuse.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="recaptchaSite">Site Key</Label>
                                <Input
                                    id="recaptchaSite"
                                    value={formData.recaptcha_site_key}
                                    onChange={(e) => updateField("recaptcha_site_key", e.target.value)}
                                    placeholder="Running on v2 Checkbox or v3"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="recaptchaSecret">Secret Key</Label>
                                <Input
                                    id="recaptchaSecret"
                                    type={showApiKeys ? "text" : "password"}
                                    value={formData.recaptcha_secret_key}
                                    onChange={(e) => updateField("recaptcha_secret_key", e.target.value)}
                                    placeholder="Private key"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Button type="submit" disabled={isLoading} size="lg" className="w-full md:w-auto">
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                    </>
                ) : (
                    <>
                        <Save className="mr-2 h-4 w-4" />
                        Save All Advanced Settings
                    </>
                )}
            </Button>
        </form>
    );
}
