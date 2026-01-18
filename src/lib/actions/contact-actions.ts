"use server";

import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";

const ContactFormSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    email: z.string().email("Invalid email address"),
    message: z.string().min(10, "Message must be at least 10 characters").max(5000),
});

export async function submitContactForm(formData: FormData) {
    const rawData = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        message: formData.get("message") as string,
    };

    // Validate input
    const result = ContactFormSchema.safeParse(rawData);
    if (!result.success) {
        return {
            success: false,
            error: result.error.issues[0]?.message || "Invalid input"
        };
    }

    const { name, email, message } = result.data;

    try {
        // Store in database
        const { error: dbError } = await supabaseAdmin
            .from("contact_submissions")
            .insert({
                name,
                email,
                message,
                status: "new",
            } as any);

        if (dbError) {
            console.error("Failed to store contact submission:", dbError);
            // Don't fail entirely if DB storage fails - we still want to handle the contact
        }

        // TODO: Send email notification to admin
        // For now, just log it
        console.log("New contact submission:", { name, email, message: message.substring(0, 100) });

        return { success: true };
    } catch (error) {
        console.error("Contact form error:", error);
        return { success: false, error: "Failed to submit. Please try again." };
    }
}
