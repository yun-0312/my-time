import { createClient } from "@/utils/supabase/server";
import { Header } from "@/components/layout/header";
import { ScheduleCalendar } from "@/components/schedule-calendar";

export default async function SchedulePage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
        .from("profiles")
        .select("family_id, families(name)")
        .eq("id", user?.id)
        .single();

    const familyId = profile?.family_id;
    // @ts-expect-error type safety check
    const familyName = profile?.families?.name || "我が家";

    const { data: schedules } = await supabase
        .from("schedules")
        .select("*")
        .eq("family_id", familyId);

    const { data: members } = await supabase
        .from("profiles")
        .select("*")
        .eq("family_id", familyId);

    return (
        <div className="min-h-screen bg-sky text-ink">
            <Header familyName={familyName} />
            <main className="mx-auto max-w-5xl px-6 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="font-display text-2xl font-bold">スケジュール管理</h1>
                </div>

                {/* カレンダーコンポーネントの呼び出し */}
                <ScheduleCalendar
                    familyId={familyId}
                    members={members || []}
                    schedules={schedules || []}
                />
            </main>
        </div>
    );
}

