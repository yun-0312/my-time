"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { parseLocalDateTimeToUTC } from "@/utils/date";

//共通で再検証したいパスのリスト
function revalidateSchedulePaths() {
    revalidatePath("/dashboard");
    revalidatePath("/schedules");
}

export async function createSchedule(formData: FormData) {
    const supabase = await createClient();

    const title = formData.get("title") as string;
    const rawStartAt = formData.get("start_at") as string;
    const rawEndAt = formData.get("end_at") as string;
    const rawTargetUserId = formData.get("target_user_id") as string;
    const familyId = formData.get("family_id") as string;

    if (!title || !familyId) return;

    const targetUserId = rawTargetUserId && rawTargetUserId !== "UNASSIGNED" ? rawTargetUserId : null;

    const { error } = await supabase.from("schedules").insert({
        title,
        start_at: rawStartAt ? parseLocalDateTimeToUTC(rawStartAt) : null,
        end_at: rawEndAt ? parseLocalDateTimeToUTC(rawEndAt) : null,
        target_user_id: targetUserId ? targetUserId : null,
        family_id: familyId,
    });

    if (error) {
        console.error("スケジュールの作成に失敗しました:", error.message);
        throw new Error(error.message);
    }
    revalidateSchedulePaths();
    return { success: true };
}

export async function updateSchedule(scheduleId: string, formData: FormData) {
    const supabase = await createClient();

    const title = formData.get("title") as string;
    const rawStartAt = formData.get("start_at") as string;
    const rawEndAt = formData.get("end_at") as string;
    const rawTargetUserId = formData.get("target_user_id") as string;

    if (!title) return;

    const targetUserId = rawTargetUserId && rawTargetUserId !== "UNASSIGNED" ? rawTargetUserId : null;

    const { error } = await supabase
        .from("schedules")
        .update({
            title,
            start_at: rawStartAt ? parseLocalDateTimeToUTC(rawStartAt) : null,
            end_at: rawEndAt ? parseLocalDateTimeToUTC(rawEndAt) : null,
            target_user_id: targetUserId,
            updated_at: new Date().toISOString(),
        })
        .eq("id", scheduleId);

    if (error) {
        console.error("スケジュールの更新に失敗しました:", error.message);
        throw new Error(error.message);
    }

    revalidateSchedulePaths();
    return { success: true };
}

export async function deleteSchedule(scheduleId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("schedules")
        .delete()
        .eq("id", scheduleId);

    if (error) {
        console.error("スケジュールの削除に失敗しました:", error.message);
        throw new Error(error.message);
    }

    revalidateSchedulePaths();
    return { success: true };
}