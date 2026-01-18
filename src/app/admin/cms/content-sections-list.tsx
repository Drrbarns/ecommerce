"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    Edit,
    ChevronDown,
    ChevronUp,
    Sparkles,
    Layout,
    Bell,
    Award,
    Megaphone,
    Palette,
    Loader2
} from "lucide-react";
import { toggleCMSContentActive, seedSectionColors, CMSContent } from "@/lib/actions/cms-actions";
import { SectionEditor } from "./section-editor";

interface ContentSectionsListProps {
    sections: CMSContent[];
}

const sectionIcons: Record<string, React.ElementType> = {
    features: Sparkles,
    promo_banner: Megaphone,
    newsletter_section: Bell,
    about_section: Layout,
    trust_badges: Award,
    featured_collections: Layout,
    featured_products: Sparkles
};

export function ContentSectionsList({ sections }: ContentSectionsListProps) {
    const router = useRouter();
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [loadingToggle, setLoadingToggle] = useState<string | null>(null);
    const [isSeeding, setIsSeeding] = useState(false);

    const handleToggleActive = async (section: CMSContent) => {
        setLoadingToggle(section.section_key);
        const result = await toggleCMSContentActive(section.section_key, !section.is_active);
        setLoadingToggle(null);

        if (result.success) {
            toast.success(`Section ${section.is_active ? 'disabled' : 'enabled'}!`);
            router.refresh();
        } else {
            toast.error(result.error || "Failed to toggle section");
        }
    };

    const handleSeedColors = async () => {
        setIsSeeding(true);
        const result = await seedSectionColors();
        setIsSeeding(false);

        if (result.success) {
            toast.success("Section color controls initialized!");
            router.refresh();
        } else {
            toast.error("Failed to initialize colors");
        }
    };

    const toggleExpand = (key: string) => {
        setExpandedSection(expandedSection === key ? null : key);
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                        <CardTitle>Homepage Sections</CardTitle>
                        <CardDescription>
                            Enable, disable, and customize content sections on your homepage.
                        </CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSeedColors}
                        disabled={isSeeding}
                    >
                        {isSeeding ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Palette className="mr-2 h-4 w-4" />
                        )}
                        Initialize Colors
                    </Button>
                </CardHeader>
                <CardContent className="divide-y pt-4">
                    {sections.length === 0 ? (
                        <div className="text-center py-8 space-y-4">
                            <p className="text-muted-foreground">
                                No content sections found. Initialize them to start customizing.
                            </p>
                            <Button onClick={handleSeedColors} disabled={isSeeding}>
                                {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Initialize Sections"}
                            </Button>
                        </div>
                    ) : (
                        sections.map((section) => {
                            const Icon = sectionIcons[section.section_key] || Layout;
                            const isExpanded = expandedSection === section.section_key;

                            return (
                                <div key={section.section_key} className="py-4 first:pt-0 last:pb-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-muted">
                                                <Icon className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium">{section.section_name}</h3>
                                                    <Badge variant={section.is_active ? "default" : "secondary"}>
                                                        {section.is_active ? "Active" : "Inactive"}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Key: {section.section_key}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={section.is_active}
                                                onCheckedChange={() => handleToggleActive(section)}
                                                disabled={loadingToggle === section.section_key}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleExpand(section.section_key)}
                                            >
                                                <Edit className="h-4 w-4 mr-1" />
                                                Edit
                                                {isExpanded ? (
                                                    <ChevronUp className="h-4 w-4 ml-1" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4 ml-1" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Expanded Editor */}
                                    {isExpanded && (
                                        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                                            <SectionEditor
                                                section={section}
                                                onSave={() => setExpandedSection(null)}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
