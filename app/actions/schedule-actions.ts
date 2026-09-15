"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { parseLocalDateTimeToUTC } from "@/utils/date";

//共通で再検証したいパスのリスト
function revalidateSchedulePaths() {
    revalidatePath("/dashboard");
    revalidatePath("/schedules");
}

function calculateNotifyAt(startAtUtc: string): string {
    const startDate = new Date(startAtUtc);
    const notifyDate = new Date(startDate.getTime() - 30 * 60 * 1000);
    return notifyDate.toISOString();
}

export async function createSchedule(formData: FormData) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const title = formData.get("title") as string;
    const rawStartAt = formData.get("start_at") as string;
    const rawEndAt = formData.get("end_at") as string;
    const rawTargetUserId = formData.get("target_user_id") as string;
    const familyId = formData.get("family_id") as string;

    if (!title || !familyId || !rawStartAt) return;

    const targetUserId = rawTargetUserId && rawTargetUserId !== "UNASSIGNED" ? rawTargetUserId : null;
    const startAtUtc = parseLocalDateTimeToUTC(rawStartAt);

    const { data: newSchedule, error: scheduleError } = await supabase
        .from("schedules")
        .insert({
            title,
            start_at: startAtUtc,
            end_at: rawEndAt ? parseLocalDateTimeToUTC(rawEndAt) : null,
            target_user_id: targetUserId ? targetUserId : null,
            family_id: familyId,
        })
        .select()
        .single();

    if (scheduleError || !newSchedule) {
        console.error("スケジュールの作成に失敗しました:", scheduleError?.message);
        throw new Error(scheduleError?.message || "Faild to create schedule");
    }

    const notifyAt = calculateNotifyAt(startAtUtc!);

    const { error: notificationError } = await supabase.from("notifications").insert({
        family_id: familyId,
        target_type: "schedule",
        target_id: newSchedule.id,
        notify_at: notifyAt,
        status: false,
    });

    if (notificationError) {
        console.error("通知の登録に失敗しました:", notificationError.message);
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

    if (!title || !rawStartAt) return;

    const targetUserId = rawTargetUserId && rawTargetUserId !== "UNASSIGNED" ? rawTargetUserId : null;
    const startAtUtc = parseLocalDateTimeToUTC(rawStartAt);

    const { error: scheduleError } = await supabase
        .from("schedules")
        .update({
            title,
            start_at: startAtUtc,
            end_at: rawEndAt ? parseLocalDateTimeToUTC(rawEndAt) : null,
            target_user_id: targetUserId,
            updated_at: new Date().toISOString(),
        })
        .eq("id", scheduleId);

    if (scheduleError) {
        console.error("スケジュールの更新に失敗しました:", scheduleError.message);
        throw new Error(scheduleError.message);
    }

    const notifyAt = calculateNotifyAt(startAtUtc!);

    const { data: existingNotification } = await supabase
        .from("notifications")
        .select("id")
        .eq("target_type", "schedule")
        .eq("target_id", scheduleId)
        .eq("status", false)
        .single();

    if (existingNotification) {
        await supabase
            .from("notifications")
            .update({
                notify_at: notifyAt,
                updated_at: new Date().toISOString(),
            })
            .eq("id", existingNotification.id);
    } else {
        await supabase.from("notifications").insert({
            family_id: formData.get("family_id") as string,
            target_user_id: targetUserId,
            target_type: "schedule",
            target_id: scheduleId,
            notify_at: notifyAt,
            status: false,
        });
    }

    revalidateSchedulePaths();
    return { success: true };
}

export async function deleteSchedule(scheduleId: string) {
    const supabase = await createClient();

    const { error: notificationError } = await supabase
        .from("notifications")
        .delete()
        .eq("target_type", "schedule")
        .eq("target_id", scheduleId);

    if (notificationError) {
        console.error("関連する通知の削除に失敗しました:", notificationError.message);
        throw new Error(notificationError.message);
    }

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

export async function getNextSchedule(familyId: string, targetUserId?: string) {
    const supabase = await createClient();
    const nowIso = new Date().toISOString();

    const threeHoursLater = new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString();

    let query = supabase
        .from("schedules")
        .select("*")
        .eq("family_id", familyId)
        .gte("start_at", nowIso)
        .lte("start_at", threeHoursLater)
        .order("start_at", { ascending: true })
        .limit(1);

    if (targetUserId) {
        query = query.or(`target_user_id.eq.${targetUserId},target_user_id.is.null`);
    }

    const { data, error } = await query.single();

    if (error && error.code !== "PGRST116") {
        console.error("次のスケジュールの取得に失敗しました:", error.message);
    }

    return data || null;
}