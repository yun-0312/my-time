import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { TodoList } from "@/components/todo-list";

export default async function ChildTasksPage() {
    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        redirect("/login");
    }

    const { data: currentProfile, error: profileError } = await supabase
        .from("profiles")
        .select('*')
        .eq("id", user.id)
        .single();

    const familyId = currentProfile.family_id;

    const { data: familyMembers } = await supabase
        .from('profiles')
        .select('*')
        .eq('family_id', familyId)
        .order('role', { ascending: false })
        .order('created_at', { ascending: true });

    const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('family_id', familyId)
        .or(`assigned_to.eq.${user.id},assigned_to.is.null`)
        .order('created_at', { ascending: true });

    return (
        <div className="min-h-screen bg-sky font-body text-ink">
            <div className="mx-auto max-w-5xl space-y-10 p-6 ms:p-10">
                <main className="mx-auto max-w-5xl space-y-10 p-6 sm:p-10">
                    <p className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-mint">
                        自分のタスク一覧
                    </p>
                    <h1 className="font-display text-3xl font-bold text-ink">
                        やること一覧
                    </h1>

                    <TodoList
                        familyId={familyId}
                        members={familyMembers || []}
                        initialTasks={tasks || []}
                        title="全てのタスク"
                        currentUserId={""}
                    />
                </main>
            </div>
        </div>
    );
}