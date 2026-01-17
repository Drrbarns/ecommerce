import { getModules } from "@/lib/actions/module-actions";
import { ModuleList } from "./module-list";

export const metadata = {
    title: "Module Management",
    description: "Toggle system features and modules.",
};

export default async function ModulesPage() {
    const modules = await getModules();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Modules</h1>
                <p className="text-muted-foreground">
                    Enable or disable system features.
                </p>
            </div>
            <ModuleList modules={modules} />
        </div>
    );
}
