'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from "next/cache";

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
    });

    if (profileError) {
        console.error("Profile Error:", profileError);
        throw new Error("メンバーの追加に失敗しました。");
    }

    revalidatePath("/dashboard");
    return { success: true };
}

export async function updateMember(memberId: string, formData: FormData) {
    const supabase = await createClient();

    const fullName = formData.get("fullName") as string;
    const avatarColor = formData.get('avatarColor') as string;

    const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, avatar_color: avatarColor })
        .eq('id', memberId);

    if (error) {
        return { error: "メンバー情報の更新に失敗しました。" };
    }

    revalidatePath('/dashboard');
    return { success: true };
}

export async function removeMember(userId: string) {
    const adminSupabase = await createAdminClient();

    await adminSupabase
        .from("schedules")
        .update({ target_user_id: null })
        .eq("target_user_id", userId);

    await adminSupabase
        .from("tasks")
        .update({ assigned_to: null })
        .eq("assigned_to", userId);

    const { error: authError } = await adminSupabase.auth.admin.deleteUser(userId);

    if (authError) {
        console.error("Delete Auth Error:", authError);
        throw new Error("メンバーの削除に失敗しました。");
    }

    revalidatePath("/dashboard");
    return { success: true };
}



