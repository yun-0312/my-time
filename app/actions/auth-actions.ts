"use server";

import { createClient } from "@/utils/supabase/server";

export async function resetPasswordForEmail(email: string) {
    const supabase = await createClient();

    const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/update-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
    });

    if (error) {
        return { error: error.message };
    }

    return { success: true };
}

export async function updatePassword(newPassword: string) {
    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
        password: newPassword,
    });

    if (error) {
        return { error: error.message };
    }

    return { success: true };
}