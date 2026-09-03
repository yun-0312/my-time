import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { FamilyMemberList } from "@/components/dashboard/family-member-list";
import { TodoList } from "@/components/todo-list";
import { ScheduleList } from "@/components/dashboard/schedule-list";
import { NextScheduleTimerWidget } from "@/components/next-schedule-timer-widget";
import { getTodayJSTRange } from "@/utils/date";

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        redirect("/login");
    }

    // 1. 自分のプロフィールを取得（family_id を知るために先に必要）
    const { data: currentProfile, error: profileError } = await supabase
        .from("profiles")
        .select('*')
        .eq("id", user.id)
        .single();

    if (profileError || !currentProfile || !currentProfile?.family_id) {
        // まだ家族グループを作成していないユーザー向けの導線
        redirect("/setup-family");
    }

    const familyId = currentProfile.family_id;

    // 2. 家族の名前を取得
    const { data: familyData } = await supabase
        .from("families")
        .select("name")
        .eq('id', familyId)
        .limit(1);

    // 3. 家族一覧を取得
    const { data: familyMembers } = await supabase
        .from('profiles')
        .select('*')
        .eq('family_id', familyId)
        .order('role', { ascending: false })
        .order('created_at', { ascending: true });

    //今日の日付を取得
    const { startOfTodayUTC, endOfTodayUTC } = getTodayJSTRange();

    //4. 今日の家族のタスク一覧を取得
    const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('family_id', familyId)
        .or(`and(due_at.gte.${startOfTodayUTC},due_at.lte.${endOfTodayUTC}),and(due_at.lt.${startOfTodayUTC},is_completed.eq.false),due_at.is.null`)
        .order('due_at', { ascending: true, nullsFirst: false });

    //5. 今日の家族のスケジュール一覧を取得
    const { data: schedules } = await supabase
        .from('schedules')
        .select('*')
        .eq('family_id', familyId)
        .gte('start_at', startOfTodayUTC)
        .lte('start_at', endOfTodayUTC)
        .order('start_at', { ascending: true });

    return (
        <div className="min-h-screen bg-sky font-body text-ink">
            <div className="mx-auto max-w-5xl space-y-10 p-6 sm:p-10">
                <main className="mx-auto max-w-5xl space-y-10 p-6 sm:p-10">
                    <p className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-mint">
                        ファミリーダッシュボード
                    </p>
                    <h1 className="font-display text-3xl font-bold text-ink">
                        ダッシュボード
                    </h1>

                    <NextScheduleTimerWidget
                        familyId={familyId}
                        currentUserId={user.id}
                        isChildView={false}
                    />

                    <FamilyMemberList
                        familyId={familyId}
                        members={familyMembers}
                        currentUserId={user.id}
                    />

                    <ScheduleList
                        familyId={familyId}
                        members={familyMembers || []}
                        initialSchedules={schedules || []}
                        currentUserId={user.id}
                    />

                    <TodoList
                        familyId={familyId}
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