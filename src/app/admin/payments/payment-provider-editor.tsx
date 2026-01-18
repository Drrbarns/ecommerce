"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
    Save,
    Loader2,
    CreditCard,
    Eye,
    EyeOff,
    CheckCircle,
    AlertCircle,
    Star,
    Smartphone,
    Globe,
    Shield
} from "lucide-react";
import {
    updatePaymentProviderCredentials,
    togglePaymentProvider,
    setPrimaryProvider,
    toggleTestMode
} from "@/lib/actions/payment-actions";

interface PaymentProvider {
    id: string;
    provider: string;
    display_name: string;
    is_enabled: boolean;
    is_primary: boolean;
    is_test_mode: boolean;
    supported_currencies: string[];
    credentials: Record<string, string>;
}

interface PaymentProviderEditorProps {
    providers: PaymentProvider[];
}

// Provider-specific credential fields
const PROVIDER_FIELDS: Record<string, { key: string; label: string; placeholder: string; isSecret?: boolean }[]> = {
    moolre: [
        { key: 'api_user', label: 'API Username', placeholder: 'Your Moolre username' },
        { key: 'api_pubkey', label: 'Public API Key', placeholder: 'Your public API key', isSecret: true },
        { key: 'account_number', label: 'Account Number', placeholder: 'Your Moolre account number' },
    ],
    paystack: [
        { key: 'public_key', label: 'Public Key', placeholder: 'pk_test_xxx or pk_live_xxx' },
        { key: 'secret_key', label: 'Secret Key', placeholder: 'sk_test_xxx or sk_live_xxx', isSecret: true },
    ],
    flutterwave: [
        { key: 'public_key', label: 'Public Key', placeholder: 'FLWPUBK-xxx' },
        { key: 'secret_key', label: 'Secret Key', placeholder: 'FLWSECK-xxx', isSecret: true },
    ],
};

// Provider icons
const PROVIDER_ICONS: Record<string, React.ReactNode> = {
    moolre: <Smartphone className="h-5 w-5" />,
    paystack: <CreditCard className="h-5 w-5" />,
    flutterwave: <Globe className="h-5 w-5" />,
};

export function PaymentProviderEditor({ providers }: PaymentProviderEditorProps) {
    const router = useRouter();
    const [activeProvider, setActiveProvider] = useState(providers[0]?.provider || 'moolre');
    const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState<string | null>(null);
    const [credentials, setCredentials] = useState<Record<string, Record<string, string>>>(() => {
        const initial: Record<string, Record<string, string>> = {};
        providers.forEach(p => {
            initial[p.provider] = { ...(p.credentials || {}) };
        });
        return initial;
    });

    const handleSaveCredentials = async (provider: string) => {
        setLoading(`save-${provider}`);
        const result = await updatePaymentProviderCredentials(provider, credentials[provider] || {});
        setLoading(null);

        if (result.success) {
            toast.success('Credentials saved successfully!');
            router.refresh();
        } else {
            toast.error(result.error || 'Failed to save credentials');
        }
    };

    const handleToggleEnabled = async (provider: string, enabled: boolean) => {
        setLoading(`toggle-${provider}`);
        const result = await togglePaymentProvider(provider, enabled);
        setLoading(null);

        if (result.success) {
            toast.success(`${provider} ${enabled ? 'enabled' : 'disabled'}`);
            router.refresh();
        } else {
            toast.error(result.error || 'Failed to update');
        }
    };

    const handleSetPrimary = async (provider: string) => {
        setLoading(`primary-${provider}`);
        const result = await setPrimaryProvider(provider);
        setLoading(null);

        if (result.success) {
            toast.success(`${provider} set as primary payment method`);
            router.refresh();
        } else {
            toast.error(result.error || 'Failed to set primary');
        }
    };

    const handleToggleTestMode = async (provider: string, testMode: boolean) => {
        setLoading(`test-${provider}`);
        const result = await toggleTestMode(provider, testMode);
        setLoading(null);

        if (result.success) {
            toast.success(`${testMode ? 'Test' : 'Live'} mode enabled`);
            router.refresh();
        } else {
            toast.error(result.error || 'Failed to update');
        }
    };

    const toggleSecretVisibility = (key: string) => {
        setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const hasCredentials = (provider: PaymentProvider) => {
        const fields = PROVIDER_FIELDS[provider.provider] || [];
        return fields.every(f => provider.credentials?.[f.key]);
    };

    return (
        <div className="space-y-6">
            {/* Provider Tabs */}
            <Tabs value={activeProvider} onValueChange={setActiveProvider}>
                <TabsList className="grid w-full grid-cols-3 mb-6">
                    {providers.map((provider) => (
                        <TabsTrigger
                            key={provider.provider}
                            value={provider.provider}
                            className="relative"
                        >
                            <div className="flex items-center gap-2">
                                {PROVIDER_ICONS[provider.provider]}
                                <span>{provider.display_name.split(' ')[0]}</span>
                            </div>
                            {provider.is_primary && (
                                <Star className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500 fill-yellow-500" />
                            )}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {providers.map((provider) => (
                    <TabsContent key={provider.provider} value={provider.provider}>
                        <div className="space-y-6">
                            {/* Status Card */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-primary/10">
                                                {PROVIDER_ICONS[provider.provider]}
                                            </div>
                                            <div>
                                                <CardTitle className="flex items-center gap-2">
                                                    {provider.display_name}
                                                    {provider.is_primary && (
                                                        <Badge className="bg-yellow-500">Primary</Badge>
                                                    )}
                                                </CardTitle>
                                                <CardDescription>
                                                    Currencies: {provider.supported_currencies?.join(', ') || 'GHS'}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {hasCredentials(provider) ? (
                                                <Badge variant="outline" className="text-green-600 border-green-600">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Configured
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    Not Configured
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        {/* Enable/Disable */}
                                        <div className="flex items-center justify-between p-4 rounded-lg border">
                                            <div>
                                                <Label className="font-medium">Enable Provider</Label>
                                                <p className="text-xs text-muted-foreground">Accept payments with this method</p>
                                            </div>
                                            <Switch
                                                checked={provider.is_enabled}
                                                onCheckedChange={(checked) => handleToggleEnabled(provider.provider, checked)}
                                                disabled={loading?.startsWith('toggle')}
                                            />
                                        </div>

                                        {/* Test Mode */}
                                        <div className="flex items-center justify-between p-4 rounded-lg border">
                                            <div>
                                                <Label className="font-medium">Test Mode</Label>
                                                <p className="text-xs text-muted-foreground">Use sandbox/test environment</p>
                                            </div>
                                            <Switch
                                                checked={provider.is_test_mode}
                                                onCheckedChange={(checked) => handleToggleTestMode(provider.provider, checked)}
                                                disabled={loading?.startsWith('test')}
                                            />
                                        </div>

                                        {/* Set as Primary */}
                                        <div className="flex items-center justify-between p-4 rounded-lg border">
                                            <div>
                                                <Label className="font-medium">Primary Provider</Label>
                                                <p className="text-xs text-muted-foreground">Default payment method</p>
                                            </div>
                                            <Button
                                                variant={provider.is_primary ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handleSetPrimary(provider.provider)}
                                                disabled={provider.is_primary || loading?.startsWith('primary')}
                                            >
                                                {provider.is_primary ? (
                                                    <>
                                                        <Star className="h-3 w-3 mr-1 fill-current" />
                                                        Primary
                                                    </>
                                                ) : (
                                                    'Set Primary'
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Credentials Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        API Credentials
                                    </CardTitle>
                                    <CardDescription>
                                        Enter your {provider.display_name} API keys. These are stored securely.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {(PROVIDER_FIELDS[provider.provider] || []).map((field) => (
                                        <div key={field.key} className="space-y-2">
                                            <Label htmlFor={`${provider.provider}-${field.key}`}>
                                                {field.label}
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id={`${provider.provider}-${field.key}`}
                                                    type={field.isSecret && !showSecrets[`${provider.provider}-${field.key}`] ? 'password' : 'text'}
                                                    value={credentials[provider.provider]?.[field.key] || ''}
                                                    onChange={(e) => {
                                                        setCredentials(prev => ({
                                                            ...prev,
                                                            [provider.provider]: {
                                                                ...prev[provider.provider],
                                                                [field.key]: e.target.value
                                                            }
                                                        }));
                                                    }}
                                                    placeholder={field.placeholder}
                                                    className="pr-10 font-mono text-sm"
                                                />
                                                {field.isSecret && (
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleSecretVisibility(`${provider.provider}-${field.key}`)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                    >
                                                        {showSecrets[`${provider.provider}-${field.key}`] ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    <Button
                                        onClick={() => handleSaveCredentials(provider.provider)}
                                        disabled={loading === `save-${provider.provider}`}
                                        className="mt-4"
                                    >
                                        {loading === `save-${provider.provider}` ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                Save Credentials
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Provider-specific documentation */}
                            {provider.provider === 'moolre' && (
                                <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                                    <CardHeader>
                                        <CardTitle className="text-blue-900 dark:text-blue-100 text-base">
                                            Moolre Setup Guide
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                                        <p><strong>1.</strong> Log in to your <a href="https://moolre.com" className="underline">Moolre Dashboard</a></p>
                                        <p><strong>2.</strong> Navigate to Settings → API Keys</p>
                                        <p><strong>3.</strong> Copy your <strong>Username</strong> and <strong>Public API Key</strong></p>
                                        <p><strong>4.</strong> Find your <strong>Account Number</strong> in your profile settings</p>
                                        <p className="text-xs mt-4 opacity-75">
                                            Note: Use your Public API Key (not Private) for security. The Public Key expires after 5 years.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
