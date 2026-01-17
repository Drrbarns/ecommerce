"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { toggleModule } from "@/lib/actions/module-actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function ModuleList({ modules }: { modules: any[] }) {
    if (modules.length === 0) {
        return <div className="p-4 text-center text-muted-foreground">No modules found.</div>;
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((mod) => (
                <ModuleCard key={mod.module_key} module={mod} />
            ))}
        </div>
    );
}

function ModuleCard({ module }: { module: any }) {
    const [isEnabled, setIsEnabled] = useState(module.is_enabled);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async (checked: boolean) => {
        setIsEnabled(checked); // Optimistic update
        setIsLoading(true);
        const result = await toggleModule(module.module_key, checked);
        setIsLoading(false);

        if (!result.success) {
            setIsEnabled(!checked); // Revert
            toast.error("Failed to update module");
        } else {
            toast.success(`${module.display_name} ${checked ? 'enabled' : 'disabled'}`);
        }
    };

    return (
        <div className="flex flex-col justify-between p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
            <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{module.display_name}</h3>
                    <Switch
                        checked={isEnabled}
                        onCheckedChange={handleToggle}
                        disabled={isLoading}
                    />
                </div>
                <p className="text-sm text-muted-foreground">
                    {module.description}
                </p>
            </div>
            <div className="mt-auto pt-4 border-t flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono">{module.module_key}</span>
                <Badge variant={isEnabled ? "default" : "secondary"}>
                    {isEnabled ? "Active" : "Inactive"}
                </Badge>
            </div>
        </div>
    );
}
