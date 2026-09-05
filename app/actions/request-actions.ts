"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createRequest(formData: FormData) {
    const content = formData.get("content") as string;
    if (!content || content.trim() === "") {
        return { error: "内容を確認してください。" };
    }

    const requestedTo = formData.get("requested_to") as string;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { errlr: "ログインしてください" };
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("family_id")
        .eq("id", user.id)
        .single();

    if (profileError || !profile?.family_id) {
        return { error: "家族の情報が見つかりませんでした。" };
    }

    const { error: insertError } = await supabase
        .from("requests")
        .insert({
            family_id: profile.family_id,
            requested_by: user.id,
            requested_to: requestedTo || null,
            content: content.trim(),
            status: "pending",
        });

    if (insertError) {
        console.error("Request insert error:", insertError);
        return { error: "リクエストの送信に失敗しました。" };
    }

    revalidatePath("/requests");
    return { success: true };

}

export async function updateRequestStatus(requestId: number, status: "approved" | "rejected") {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "ログインしてください。" };
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "parent") {
        return { error: "権限がありません。" };
    }

    const { error: updateError } = await supabase
        .from("requests")
        .update({ status })
        .eq("id", requestId);

    if (updateError) {
        console.error("Request update error:", updateError);
        return { error: "ステータスの更新に失敗しました" };
    }

    revalidatePath("/dashboard");
    return { success: true };

}