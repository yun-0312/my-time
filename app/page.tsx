import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 未ログインならログイン画面へ
  if (!user) {
    redirect("/login");
  }

  // ログイン済みならプロフィールから役割（role）を判定
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // 親なら親用ダッシュボード、子どもなら子ども用ダッシュボードへ
  if (profile?.role === "parent") {
    redirect("/dashboard");
  } else {
    redirect("/child/dashboard");
  }
}
