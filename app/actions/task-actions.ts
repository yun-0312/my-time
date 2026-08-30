"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { parseLocalDateTimeToUTC } from "@/utils/date";
import { Task } from "@/types/dashboard";

function revalidateTaskPaths() {
    revalidatePath("/dashboard");
    revalidatePath("/tasks");
}

//schedule-calendar用
export async function getTasks(familyId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("family_id", familyId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("タスクの取得に失敗しました:", error.message);
        throw new Error(error.message);
    }
    return data as Task[];
}

//dashboard用
export async function getTasksByScheduleId(scheduleId: string | null) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("schedule_id", scheduleId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("スケジュール用タスクの取得に失敗しました:", error.message);
        throw new Error(error.message);
    }
    return data as Task[];
}

export async function createTask(formData: FormData) {
    const supabase = await createClient();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const rawDueAt = formData.get("due_at") as string;
    const rawAssignedTo = formData.get("assigned_to") as string;
    const familyId = formData.get("family_id") as string;
    const scheduleId = formData.get("schedule_id") as string;

    if (!title || !familyId) return;

    const assignedTo = rawAssignedTo && rawAssignedTo !== "UNASSIGNED" ? rawAssignedTo : null;

    const { error } = await supabase.from("tasks").insert({
        title,
        description: description ? description : null,
        family_id: familyId,
        due_at: rawDueAt ? parseLocalDateTimeToUTC(rawDueAt) : null,
        assigned_to: assignedTo ? assignedTo : null,
        is_completed: false,
        schedule_id: scheduleId ? Number(scheduleId) : null,
    }).select().single();

    if (error) {
        console.error("タスクの作成に失敗しました:", error.message);
        throw new Error(error.message);
    }
    revalidateTaskPaths();
    return { success: true };
}

export async function toggleTaskCompletion(taskId: string, isCompleted: boolean) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("tasks")
        .update({ is_completed: isCompleted })
        .eq("id", taskId);

    if (error) {
        console.error("タスクの更新に失敗しました:", error.message);
        throw new Error(error.message);
    }

    revalidateTaskPaths();
    return { success: true };
}

export async function deleteTask(taskId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

    if (error) {
        console.error("タスクの削除に失敗しました:", error.message);
        throw new Error(error.message);
    }

    revalidateTaskPaths();
    return { success: true };
}