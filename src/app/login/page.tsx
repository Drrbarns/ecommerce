import { getPublicAdvancedSettings } from "@/lib/actions/cms-advanced-actions";
import { LoginForm } from "./login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login | Admin Dashboard",
    description: "Login to access the admin dashboard",
};

export default async function LoginPage() {
    const settings = await getPublicAdvancedSettings();
    const recaptchaSiteKey = settings?.recaptcha_site_key || undefined;

    return <LoginForm recaptchaSiteKey={recaptchaSiteKey} />;
}

