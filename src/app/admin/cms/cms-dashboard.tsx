"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Palette,
    Type,
    Image,
    Settings,
    LayoutTemplate,
    Layout,
    Layers,
    ArrowRight,
    Sparkles,
    MousePointerClick,
    Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

    const renderHeader = (title: string, description: string) => (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
        >
            <h2 className="text-3xl font-bold tracking-tight mb-2">{title}</h2>
            <p className="text-muted-foreground text-lg">{description}</p>
            <Separator className="mt-6" />
        </motion.div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case "layout":
                return (
                    <div className="max-w-6xl">
                        {renderHeader("Layout System", "Choose the structural foundation of your store from our premium templates.")}
                        {homepageSettings ? <HomepageEditor section={homepageSettings} /> : <EmptyState />}
                    </div>
                );

            case "theme":
                return (
                    <div className="max-w-5xl">
                        {renderHeader("Theme & Branding", "Manage your store's color palette, typography, and visual identity.")}
                        {theme ? <ThemeEditor theme={theme} /> : <EmptyState />}
                    </div>
                );

            case "hero":
                return (
                    <div className="max-w-6xl">
                        {renderHeader("Hero Banner", "Customize the most important section of your homepage.")}
                        {heroSection ? <HeroEditor section={heroSection} /> : <EmptyState />}
                    </div>
                );

            case "sections":
                return (
                    <div className="max-w-5xl">
                        {renderHeader("Page Sections", "Manage, reorder, and edit individual content blocks.")}
                        <ContentSectionsList sections={contentSections} />
                    </div>
                );

            case "footer":
                return (
                    <div className="max-w-5xl">
                        {renderHeader("Footer Area", "Edit the footer links, newsletter signup, and bottom navigation.")}
                        {footerSection ? <FooterEditor section={footerSection} /> : <EmptyState />}
                    </div>
                );

            case "advanced":
                return (
                    <div className="max-w-4xl">
                        {renderHeader("Advanced Settings", "Technical configurations, SEO defaults, and developer tools.")}
                        <AdvancedSettingsEditor settings={advancedSettings} />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 min-h-[85vh] bg-background">
            {/* Sidebar Navigation */}
            <aside className="w-full lg:w-72 flex-shrink-0">
                <div className="sticky top-6">
                    <div className="bg-card rounded-xl border shadow-sm p-4 space-y-8">
                        <div>
                            <div className="px-4 mb-4">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                    Design Studio
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1">Customize your store's look</p>
                            </div>

                            <nav className="space-y-1">
                                <NavGroup label="Visuals">
                                    <NavButton
                                        active={activeTab === "layout"}
                                        onClick={() => setActiveTab("layout")}
                                        icon={LayoutTemplate}
                                        label="Layout System"
                                        description="Structure & Templates"
                                    />
                                    <NavButton
                                        active={activeTab === "theme"}
                                        onClick={() => setActiveTab("theme")}
                                        icon={Palette}
                                        label="Theme Colors"
                                        description="Brand Identity"
                                    />
                                </NavGroup>

                                <NavGroup label="Content">
                                    <NavButton
                                        active={activeTab === "hero"}
                                        onClick={() => setActiveTab("hero")}
                                        icon={Image}
                                        label="Hero Banner"
                                        description="Main Showcase"
                                    />
                                    <NavButton
                                        active={activeTab === "sections"}
                                        onClick={() => setActiveTab("sections")}
                                        icon={Layers}
                                        label="Page Sections"
                                        description="Content Blocks"
                                    />
                                    <NavButton
                                        active={activeTab === "footer"}
                                        onClick={() => setActiveTab("footer")}
                                        icon={Layout}
                                        label="Footer"
                                        description="Bottom Navigation"
                                    />
                                </NavGroup>

                                <NavGroup label="System">
                                    <NavButton
                                        active={activeTab === "advanced"}
                                        onClick={() => setActiveTab("advanced")}
                                        icon={Settings}
                                        label="Settings"
                                        description="Configuration"
                                    />
                                </NavGroup>
                            </nav>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 pb-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}

function NavGroup({ label, children }: { label: string, children: React.ReactNode }) {
    return (
        <div className="py-3 first:pt-0">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-4">{label}</h4>
            <div className="space-y-1">
                {children}
            </div>
        </div>
    );
}

function NavButton({
    active,
    onClick,
    icon: Icon,
    label,
    description
}: {
    active: boolean,
    onClick: () => void,
    icon: any,
    label: string,
    description: string
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 rounded-lg group",
                active
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "hover:bg-muted text-foreground"
            )}
        >
            <div className={cn(
                "p-2 rounded-md transition-colors",
                active ? "bg-white/20" : "bg-muted group-hover:bg-background border"
            )}>
                <Icon className={cn("h-4 w-4", active ? "text-primary-foreground" : "text-muted-foreground")} />
            </div>
            <div>
                <div className={cn("font-medium text-sm", active ? "text-primary-foreground" : "text-foreground")}>
                    {label}
                </div>
                <div className={cn("text-xs", active ? "text-primary-foreground/80" : "text-muted-foreground")}>
                    {description}
                </div>
            </div>
            {active && (
                <motion.div layoutId="active-indicator" className="ml-auto">
                    <ArrowRight className="h-4 w-4 text-primary-foreground" />
                </motion.div>
            )}
        </button>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-muted/30 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
                <LayoutDashboard className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Content Not Initialized</h3>
            <p className="text-muted-foreground max-w-sm">
                This section hasn't been set up in the database yet. Please run the initialization script or check your database.
            </p>
        </div>
    );
}
