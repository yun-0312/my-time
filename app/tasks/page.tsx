import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Header } from "@/components/layout/header";
import { TodoList } from "@/components/todo-list";

export default async function TasksPage() {
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

    const familyName = familyData && familyData.length > 0 ? familyData[0].name : '我が家';

    // 3. 家族一覧を取得
    const { data: familyMembers } = await supabase
        .from('profiles')
        .select('*')
        .eq('family_id', familyId)
        .order('role', { ascending: false })
        .order('created_at', { ascending: true });

    //4. 家族のタスク一覧を取得
    const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('family_id', familyId)
        .order('created_at', { ascending: false });

    return (
        <div className="min-h-screen bg-sky font-body text-ink">
            <Header familyName={familyName} />
            <div className="mx-auto max-w-5xl space-y-10 p-6 sm:p-10">
                <main className="mx-auto max-w-5xl space-y-10 p-6 sm:p-10">
                    <p className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-mint">
                        ファミリータスク一覧
                    </p>
                    <h1 className="font-display text-3xl font-bold text-ink">
                        タスク一覧
                    </h1>

                    <TodoList
                        familyId={familyId}
                        members={familyMembers || []}
                        initialTasks={tasks || []}
                        title="全てのタスク"
                    />
                </main>

            </div>
        </div>
    );
}