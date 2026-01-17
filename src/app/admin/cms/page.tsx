import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout, Palette, Type, Image, Settings } from "lucide-react";
import { getAllCMSContent, getActiveTheme } from "@/lib/actions/cms-actions";
import { getAdvancedSettings } from "@/lib/actions/cms-advanced-actions";
import { HeroEditor } from "./hero-editor";
import { FooterEditor } from "./footer-editor";
import { ThemeEditor } from "./theme-editor";
import { ContentSectionsList } from "./content-sections-list";
import { AdvancedSettingsEditor } from "./advanced-settings-editor";

export default async function AdminCMSPage() {
    const [sections, theme, advancedSettings] = await Promise.all([
        getAllCMSContent(),
        getActiveTheme(),
        getAdvancedSettings(),
    ]);

    const heroSection = sections.find(s => s.section_key === 'hero');
    const footerSection = sections.find(s => s.section_key === 'footer');

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
                <p className="text-muted-foreground">
                    Customize your website content, design, and appearance.
                </p>
            </div>

            <Tabs defaultValue="hero" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:w-auto lg:inline-flex">
                    <TabsTrigger value="hero" className="gap-2">
                        <Image className="h-4 w-4" />
                        Hero
                    </TabsTrigger>
                    <TabsTrigger value="sections" className="gap-2">
                        <Layout className="h-4 w-4" />
                        Sections
                    </TabsTrigger>
                    <TabsTrigger value="footer" className="gap-2">
                        <Type className="h-4 w-4" />
                        Footer
                    </TabsTrigger>
                    <TabsTrigger value="theme" className="gap-2">
                        <Palette className="h-4 w-4" />
                        Theme Colors
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="gap-2">
                        <Settings className="h-4 w-4" />
                        Advanced
                    </TabsTrigger>
                </TabsList>

                {/* Hero Tab */}
                <TabsContent value="hero">
                    {heroSection ? (
                        <HeroEditor section={heroSection} />
                    ) : (
                        <Card>
                            <CardContent className="p-6 text-center text-muted-foreground">
                                Hero section not found. Please run the CMS migration.
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Sections Tab */}
                <TabsContent value="sections">
                    <ContentSectionsList sections={sections.filter(s =>
                        !['hero', 'footer'].includes(s.section_key)
                    )} />
                </TabsContent>

                {/* Footer Tab */}
                <TabsContent value="footer">
                    {footerSection ? (
                        <FooterEditor section={footerSection} />
                    ) : (
                        <Card>
                            <CardContent className="p-6 text-center text-muted-foreground">
                                Footer section not found. Please run the CMS migration.
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Theme Tab */}
                <TabsContent value="theme">
                    {theme ? (
                        <ThemeEditor theme={theme} />
                    ) : (
                        <Card>
                            <CardContent className="p-6 text-center text-muted-foreground">
                                Theme not found. Please run the CMS migration.
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Advanced Tab */}
                <TabsContent value="advanced">
                    <AdvancedSettingsEditor settings={advancedSettings} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
