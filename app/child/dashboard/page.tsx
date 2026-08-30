import { Header } from "@/components/layout/header";
import React from "react";
import { NextScheduleTimerWidget } from "@/components/next-schedule-timer-widget";
import { TodoList } from "@/components/todo-list";
import { ScheduleList } from "@/components/dashboard/schedule-list";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getTodayJSTRange } from "@/utils/date";

export default async function ChildDashboardPage() {
    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("family_id, full_name")
        .eq("id", user.id)
        .single();

    if (!profile) {
        return <div>プロフィールが見つかりません</div>;
    }

    // 2. 家族の名前を取得
    const { data: familyData } = await supabase
        .from("families")
        .select("name")
        .eq('id', profile.family_id)
        .limit(1);

    const familyName = familyData && familyData.length > 0 ? familyData[0].name : "我が家";

    const { data: familyMembers } = await supabase
        .from("profiles")
        .select("*")
        .eq("family_id", profile.family_id);

    //今日の日付を取得
    const { startOfTodayUTC, endOfTodayUTC } = getTodayJSTRange();

    // 今日のスケジュール一覧を取得
    const { data: schedules } = await supabase
        .from('schedules')
        .select('*')
        .eq('family_id', profile.family_id)
        .or(`target_user_id.eq.${user.id},target_user_id.is.null`)
        .gte('start_at', startOfTodayUTC)
        .lte('start_at', endOfTodayUTC)
        .order('start_at', { ascending: true });

    // 今日のタスク一覧を取得
    const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('family_id', profile.family_id)
        .or(`assigned_to.eq.${user.id},assigned_to.is.null`)
        .or(`and(due_at.gte.${startOfTodayUTC},due_at.lte.${endOfTodayUTC}),and(due_at.lt.${startOfTodayUTC},is_completed.eq.false),due_at.is.null`)
        .order('due_at', { ascending: true, nullsFirst: false });


    return (
        <div className="min-h-screen bg-sky font-body text-ink">
            <Header familyName={familyName} />
            <div className="mx-auto max-w-5xl space-y-10 p-6 sm:p-10">
                <main className="mx-auto max-w-5xl space-y-10 p-6 sm:p-10">

                    {/* キッズモードのヘッダー部分 */}
                    <div className="flex flex-col items-center text-center">
                        <span className="bg-mint/20 text-mint font-display px-4 py-1.5 rounded-full text-xs font-bold">
                            キッズモード 🌟
                        </span>
                        <h1 className="text-2xl font-bold font-display text-ink mt-2">
                            こんにちは、{profile.full_name}さん！
                        </h1>
                    </div>

                    {/* メインタイマー */}
                    <NextScheduleTimerWidget
                        familyId={profile.family_id}
                        currentUserId={user.id}
                        isChildView={true}
                    />

                    <ScheduleList
                        familyId={profile.family_id}
                        members={familyMembers || []}
                        initialSchedules={schedules || []}
                    />

                    <TodoList
                        familyId={profile.family_id}
                        members={familyMembers || []}
                        initialTasks={tasks || []}
                        title="今日のタスク"
                        currentUserId={user.id}
                    />
                </main>
            </div>
        </div>
    );
}