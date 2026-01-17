import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const metadata = {
    title: "Admin Dashboard | Moolre Commerce",
};

async function getEnabledModules(): Promise<string[]> {
    const { data: modules } = await supabaseAdmin
        .from('store_modules')
        .select('module_key')
        .eq('is_enabled', true);

    return modules?.map((m: { module_key: string }) => m.module_key) || [];
}

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const enabledModules = await getEnabledModules();

    return (
        <div className="min-h-screen bg-secondary/30">
            <AdminSidebar enabledModules={enabledModules} />
            <div className="lg:pl-64">
                <AdminHeader />
                <main className="p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
