import { getAllCMSContent, getActiveTheme } from "@/lib/actions/cms-actions";
import { getAdvancedSettings } from "@/lib/actions/cms-advanced-actions";
import { CMSDashboard } from "./cms-dashboard";

export const dynamic = 'force-dynamic';

export default async function AdminCMSPage() {
    const [sections, theme, advancedSettings] = await Promise.all([
        getAllCMSContent(),
        getActiveTheme(),
        getAdvancedSettings(),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
                <p className="text-muted-foreground">
                    Customize your online store's appearance and content blocks.
                </p>
            </div>

            <CMSDashboard
                sections={sections}
                theme={theme}
                advancedSettings={advancedSettings}
            />
        </div>
    );
}
