"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Loader2, Plus, Trash2, Facebook, Instagram, Twitter, MessageCircle, Palette } from "lucide-react";
import { updateCMSContent, CMSContent, FooterContent } from "@/lib/actions/cms-actions";

interface FooterEditorProps {
    section: CMSContent;
}

export function FooterEditor({ section }: FooterEditorProps) {
    const router = useRouter();
    const content = section.content as unknown as FooterContent;
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState<FooterContent>({
        companyName: content.companyName || "",
        tagline: content.tagline || "",
        copyrightText: content.copyrightText || "",
        socialLinks: content.socialLinks || {},
        quickLinks: content.quickLinks || [],
        customerService: content.customerService || [],
        contactInfo: content.contactInfo || {},
        backgroundColor: content.backgroundColor || "#09090b",
        textColor: content.textColor || "#d4d4d8",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await updateCMSContent(section.section_key, formData as unknown as Record<string, unknown>);

        setIsLoading(false);

        if (result.success) {
            toast.success("Footer updated!");
            router.refresh();
        } else {
            toast.error(result.error || "Failed to update");
        }
    };

    const addQuickLink = () => {
        setFormData({
            ...formData,
            quickLinks: [...formData.quickLinks, { label: "", href: "" }],
        });
    };

    const removeQuickLink = (index: number) => {
        setFormData({
            ...formData,
            quickLinks: formData.quickLinks.filter((_, i) => i !== index),
        });
    };

    const updateQuickLink = (index: number, field: 'label' | 'href', value: string) => {
        const updated = [...formData.quickLinks];
        updated[index][field] = value;
        setFormData({ ...formData, quickLinks: updated });
    };

    const addServiceLink = () => {
        setFormData({
            ...formData,
            customerService: [...formData.customerService, { label: "", href: "" }],
        });
    };

    const removeServiceLink = (index: number) => {
        setFormData({
            ...formData,
            customerService: formData.customerService.filter((_, i) => i !== index),
        });
    };

    const updateServiceLink = (index: number, field: 'label' | 'href', value: string) => {
        const updated = [...formData.customerService];
        updated[index][field] = value;
        setFormData({ ...formData, customerService: updated });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="h-5 w-5" /> Appearance
                            </CardTitle>
                            <CardDescription>
                                Customize the footer colors.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="bgColor">Background Color</Label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={formData.backgroundColor}
                                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                                        className="w-12 h-10 rounded border cursor-pointer"
                                    />
                                    <Input
                                        id="bgColor"
                                        value={formData.backgroundColor}
                                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="txtColor">Text Color</Label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={formData.textColor}
                                        onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                                        className="w-12 h-10 rounded border cursor-pointer"
                                    />
                                    <Input
                                        id="txtColor"
                                        value={formData.textColor}
                                        onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Company Info</CardTitle>
                            <CardDescription>
                                Your business name and description.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="companyName">Company Name</Label>
                                <Input
                                    id="companyName"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    placeholder="Moolre Commerce"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tagline">Tagline</Label>
                                <Textarea
                                    id="tagline"
                                    value={formData.tagline}
                                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                                    placeholder="Your trusted online shopping destination"
                                    rows={2}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="copyright">Copyright Text</Label>
                                <Input
                                    id="copyright"
                                    value={formData.copyrightText}
                                    onChange={(e) => setFormData({ ...formData, copyrightText: e.target.value })}
                                    placeholder="© 2024 Company Name. All rights reserved."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                            <CardDescription>
                                How customers can reach you.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.contactInfo.email || ""}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        contactInfo: { ...formData.contactInfo, email: e.target.value }
                                    })}
                                    placeholder="hello@store.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={formData.contactInfo.phone || ""}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        contactInfo: { ...formData.contactInfo, phone: e.target.value }
                                    })}
                                    placeholder="+233 20 000 0000"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    value={formData.contactInfo.address || ""}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        contactInfo: { ...formData.contactInfo, address: e.target.value }
                                    })}
                                    placeholder="Accra, Ghana"
                                    rows={2}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Social Media Links</CardTitle>
                            <CardDescription>
                                Connect your social media accounts.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Facebook className="h-4 w-4" /> Facebook
                                </Label>
                                <Input
                                    value={formData.socialLinks.facebook || ""}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        socialLinks: { ...formData.socialLinks, facebook: e.target.value }
                                    })}
                                    placeholder="https://facebook.com/yourpage"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Instagram className="h-4 w-4" /> Instagram
                                </Label>
                                <Input
                                    value={formData.socialLinks.instagram || ""}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                                    })}
                                    placeholder="https://instagram.com/yourpage"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Twitter className="h-4 w-4" /> Twitter / X
                                </Label>
                                <Input
                                    value={formData.socialLinks.twitter || ""}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                                    })}
                                    placeholder="https://twitter.com/yourpage"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <MessageCircle className="h-4 w-4" /> WhatsApp
                                </Label>
                                <Input
                                    value={formData.socialLinks.whatsapp || ""}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        socialLinks: { ...formData.socialLinks, whatsapp: e.target.value }
                                    })}
                                    placeholder="https://wa.me/233200000000"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Links */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Quick Links</CardTitle>
                                <CardDescription>
                                    Main navigation links in footer.
                                </CardDescription>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={addQuickLink}>
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {formData.quickLinks.map((link, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <Input
                                        value={link.label}
                                        onChange={(e) => updateQuickLink(index, 'label', e.target.value)}
                                        placeholder="Label"
                                        className="flex-1"
                                    />
                                    <Input
                                        value={link.href}
                                        onChange={(e) => updateQuickLink(index, 'href', e.target.value)}
                                        placeholder="/page"
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeQuickLink(index)}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                            {formData.quickLinks.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No quick links added. Click &quot;Add&quot; to create one.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Customer Service Links</CardTitle>
                                <CardDescription>
                                    Support and policy links.
                                </CardDescription>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={addServiceLink}>
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {formData.customerService.map((link, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <Input
                                        value={link.label}
                                        onChange={(e) => updateServiceLink(index, 'label', e.target.value)}
                                        placeholder="Label"
                                        className="flex-1"
                                    />
                                    <Input
                                        value={link.href}
                                        onChange={(e) => updateServiceLink(index, 'href', e.target.value)}
                                        placeholder="/page"
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeServiceLink(index)}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                            {formData.customerService.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No service links added. Click &quot;Add&quot; to create one.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Button type="submit" disabled={isLoading} size="lg">
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                    </>
                ) : (
                    <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Footer
                    </>
                )}
            </Button>
        </form>
    );
}
