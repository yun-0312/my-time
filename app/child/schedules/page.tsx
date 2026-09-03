import { createClient } from "@/utils/supabase/server";
import { ScheduleCalendar } from "@/components/schedule-calendar";
import { getTasks } from "@/app/actions/task-actions";
import { redirect } from "next/navigation";

export default async function ChildSchedulePage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
    .from("profiles")
    .select("family_id, families(name)")
    .eq("id", user?.id)
    .single();

    const familyId = profile?.family_id;

    const { data: schedules } = await supabase
        .from("schedules")
        .select("*")
        .eq("family_id", familyId)
        .or(`target_user_id.eq.${user.id},target_user_id.is.null`)
        .order('start_at', { ascending: true });

    const { data: members } = await supabase
        .from("profiles")
        .select("*")
        .eq("family_id", familyId);

    const tasks = await getTasks(familyId);

    return (
        <div className="min-h-screen bg-sky text-ink">
            <main className="mx-auto max-w-5xl px-6 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="font-display text-2xl font-bold">スケジュールカレンダー</h1>
                </div>

                <ScheduleCalendar
                    familyId={familyId}
                    members={members || []}
                    schedules={schedules || []}
                    tasks={tasks}
                    currentUserId={user?.id || ""}
                />
            </main>
        </div>
    );

}