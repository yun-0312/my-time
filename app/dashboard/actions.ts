"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/utils/supabase/admin";

export async function addFamilyMember(formData: FormData) {
    const adminSupabase = await createAdminClient();

    const familyId = formData.get("familyId")?.toString();
    const fullName = formData.get("fullName")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString();
    const avatarColor = formData.get("avatarColor")?.toString() || "mint";
    const role = formData.get("role")?.toString() || "child";

    if (!familyId || !fullName || !email || !password) {
        throw new Error("すべての項目を入力してください。");
    }

    //Supabase Authに子供のログインアカウントを新規作成
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
    });

    if (authError || !authData.user) {
        console.error("Auth Error:", authError);
        throw new Error("ログイン情報の作成に失敗しました（すでに使われているメールアドレスの可能性があります）。");
    }

    const userId = authData.user.id;

    const { error: profileError } = await adminSupabase.from("profiles").insert({
        id: userId,
        family_id: familyId,
        full_name: fullName,
        role: role as "parent" | "child",
        avatar_color: avatarColor,
    })

    if (profileError) {
        console.error("Profile Error:", profileError);
        throw new Error("メンバーの追加に失敗しました。");
    }

    revalidatePath("/dashboard");
    return { success: true };
}
