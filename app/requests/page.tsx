import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { getHexColor } from "@/utils/thema";
import { formatToJST } from "@/utils/format";

export default async function RequestsPage() {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        redirect("/login");
    }

    const { data: currentProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    const familyId = currentProfile.family_id;

    const { data: familyMembers } = await supabase
        .from("profiles")
        .select("*")
        .eq("family_id", familyId)
        .order('role', { ascending: false });

    const { data: requests } = await supabase
        .from("requests")
        .select(`
            id,
            content,
            status,
            created_at,
            requested_by_profile:profiles!requests_requested_by_fkey(full_name),
            requested_to_profile:profiles!requests_requested_to_fkey(full_name)
            `)
        .eq("family_id", familyId)
        .in("status", ["approved", "rejected"])
        .order("created_at", { ascending: false })
        .limit(20);

    return (
        <div className="min-h-screen bg-sky font-body text-ink">
            <div className="mx-auto max-w-5xl space-y-10 p-6 ms:p-10">
                <main className="mx-auto max-w-5xl space-y-10 p-6 sm:p-10">
                    <div>
                        <p className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-mint">
                            History
                        </p>
                        <h1 className="font-display text-3xl font-bold text-ink">
                            リクエスト履歴
                        </h1>
                    </div>

                    <Card className="border-none bg-cloud shadow-sm">
                        <CardContent className="divide-y divide-ink/10 p-0">
                            {requests?.length === 0 && (
                                <p className="p-6 text-center text-sm text-ink/50">
                                    過去の履歴はありません。
                                </p>
                            )}

                            {requests?.map((request) => {
                                const byProfile = request.requested_by_profile
                                    ? request.requested_by_profile[0]
                                    : request.requested_by_profile;

                                const member = familyMembers?.find((m) => m.id === request.requested_by_profile);
                                const accentColor = getHexColor(member?.avatar_color);

                                return (
                                    <div
                                        key={request.id}
                                        className="flex items-center justify-between p-4"
                                        style={{
                                                borderLeft: `4px solid ${accentColor}`,
                                            }}
                                        >
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-ink">
                                                {request.content}
                                            </p>
                                            <div className="flex items-center gap-2 font-mono text-[11px] text-ink/40">
                                                <span style={{ color: accentColor }} className="font-semibold">
                                                    {byProfile?.full_name ?? "子ども"} さん
                                                </span>
                                                <span>・ {formatToJST(request.created_at)}</span>
                                            </div>
                                        </div>

                                        {/* ステータスバッジ */}
                                        <span
                                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${request.status === "approved"
                                                    ? "bg-mint-20 text-int"
                                                    : "bg-coral/10 text-coral"
                                            }`}
                                        >
                                            {request.status === "approved" ? "承認済み" : "却下"}
                                        </span>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}