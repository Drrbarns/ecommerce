"use client";

import { useState } from "react";
import {
    LayoutDashboard,
    Palette,
    Type,
    Image,
    Settings,
    LayoutTemplate,
    Layout,
    Globe,
    MousePointerClick,
    Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Editors
import { HeroEditor } from "./hero-editor";
import { FooterEditor } from "./footer-editor";
import { ThemeEditor } from "./theme-editor";
import { ContentSectionsList } from "./content-sections-list";
import { AdvancedSettingsEditor } from "./advanced-settings-editor";
import { HomepageEditor } from "./homepage-editor";
import { CMSContent } from "@/lib/actions/cms-actions";

interface CMSDashboardProps {
    sections: CMSContent[];
    theme: any;
    advancedSettings: any;
}

type TabType =
    | "overview"
    | "layout"
    | "theme"
    | "hero"
    | "sections"
    | "footer"
    | "advanced";

export function CMSDashboard({ sections, theme, advancedSettings }: CMSDashboardProps) {
    const [activeTab, setActiveTab] = useState<TabType>("layout");

    const homepageSettings = sections.find(s => s.section_key === 'homepage_settings');
    const heroSection = sections.find(s => s.section_key === 'hero');
    const footerSection = sections.find(s => s.section_key === 'footer');

    // Filter sections that are not handled by dedicated editors
    const contentSections = sections.filter(s =>
        !['hero', 'footer', 'homepage_settings'].includes(s.section_key)
    );

    const renderContent = () => {
        switch (activeTab) {
            case "layout":
                return homepageSettings ? (
                    <div className="max-w-5xl space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold tracking-tight">Homepage Layout</h2>
                            <p className="text-muted-foreground">Choose the structural foundation of your store.</p>
                        </div>
                        <HomepageEditor section={homepageSettings} />
                    </div>
                ) : <EmptyState />;

            case "theme":
                return (
                    <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold tracking-tight">Theme & Branding</h2>
                            <p className="text-muted-foreground">Manage your store's colors, branding, and visual identity.</p>
                        </div>
                        {theme ? <ThemeEditor theme={theme} /> : <EmptyState />}
                    </div>
                );

            case "hero":
                return heroSection ? (
                    <div className="max-w-5xl space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold tracking-tight">Hero Section</h2>
                            <p className="text-muted-foreground">Customize the main banner of your homepage.</p>
                        </div>
                        <HeroEditor section={heroSection} />
                    </div>
                ) : <EmptyState />;

            case "sections":
                return (
                    <div className="max-w-5xl space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold tracking-tight">Page Sections</h2>
                            <p className="text-muted-foreground">Manage individual content blocks on your homepage.</p>
                        </div>
                        <ContentSectionsList sections={contentSections} />
                    </div>
                );

            case "footer":
                return footerSection ? (
                    <div className="max-w-5xl space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold tracking-tight">Footer Area</h2>
                            <p className="text-muted-foreground">Edit the footer links, newsletter, and simplified navigation.</p>
                        </div>
                        <FooterEditor section={footerSection} />
                    </div>
                ) : <EmptyState />;

            case "advanced":
                return (
                    <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold tracking-tight">Advanced Settings</h2>
                            <p className="text-muted-foreground">Technical configurations and developer tools.</p>
                        </div>
                        <AdvancedSettingsEditor settings={advancedSettings} />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 min-h-[80vh]">
            {/* Sidebar Navigation */}
            <aside className="w-full lg:w-64 flex-shrink-0 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="sticky top-6 space-y-8">

                    <div className="hidden lg:block">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Design</p>
                        <nav className="space-y-1">
                            <NavButton
                                active={activeTab === "layout"}
                                onClick={() => setActiveTab("layout")}
                                icon={LayoutTemplate}
                                label="Layout System"
                            />
                            <NavButton
                                active={activeTab === "theme"}
                                onClick={() => setActiveTab("theme")}
                                icon={Palette}
                                label="Theme Colors"
                            />
                        </nav>
                    </div>

                    <div className="hidden lg:block">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Content</p>
                        <nav className="space-y-1">
                            <NavButton
                                active={activeTab === "hero"}
                                onClick={() => setActiveTab("hero")}
                                icon={Image}
                                label="Hero Banner"
                            />
                            <NavButton
                                active={activeTab === "sections"}
                                onClick={() => setActiveTab("sections")}
                                icon={LayoutDashboard}
                                label="Page Sections"
                            />
                            <NavButton
                                active={activeTab === "footer"}
                                onClick={() => setActiveTab("footer")}
                                icon={Type}
                                label="Footer"
                            />
                        </nav>
                    </div>

                    <div className="hidden lg:block">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">System</p>
                        <nav className="space-y-1">
                            <NavButton
                                active={activeTab === "advanced"}
                                onClick={() => setActiveTab("advanced")}
                                icon={Settings}
                                label="Settings"
                            />
                        </nav>
                    </div>

                    {/* Mobile Navigation (Simple Select or Tabs) */}
                    <div className="lg:hidden">
                        <select
                            className="w-full p-2 rounded-md border bg-background"
                            value={activeTab}
                            onChange={(e) => setActiveTab(e.target.value as TabType)}
                        >
                            <option value="layout">Layout System</option>
                            <option value="theme">Theme Colors</option>
                            <option value="hero">Hero Banner</option>
                            <option value="sections">Page Sections</option>
                            <option value="footer">Footer</option>
                            <option value="advanced">Advanced Settings</option>
                        </select>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0">
                {renderContent()}
            </main>
        </div>
    );
}

function NavButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
        >
            <Icon className={cn("h-4 w-4", active ? "text-primary-foreground" : "text-muted-foreground")} />
            {label}
        </button>
    );
}

function EmptyState() {
    return (
        <div className="p-8 border-2 border-dashed rounded-lg text-center">
            <p className="text-muted-foreground">Content not initialized. Please check your database.</p>
        </div>
    );
}
