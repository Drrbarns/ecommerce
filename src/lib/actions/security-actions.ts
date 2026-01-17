"use server";

import { getAdvancedSettings } from "./cms-advanced-actions";

export async function verifyRecaptcha(token: string) {
    const settings = await getAdvancedSettings();
    const secret = settings?.recaptcha_secret_key;

    if (!secret) return { success: true }; // Bypass if not configured (dev mode or setup phase)

    try {
        const res = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`, {
            method: "POST",
        });
        const data = await res.json();

        if (data.success) {
            return { success: true };
        } else {
            console.error("ReCAPTCHA validation failed:", data);
            return { success: false, error: "Captcha verification failed" };
        }
    } catch (error) {
        console.error("ReCAPTCHA error:", error);
        return { success: false, error: "Failed to verify captcha" };
    }
}
