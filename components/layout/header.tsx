import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import { logout } from "@/app/logout/actions";
import Link from "next/link";
import { CheckSquare, CalendarDays } from "lucide-react";

export async function Header({ familyName }: { familyName: string }) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("full_name, role, avatar_color")
        .eq("id", user?.id)
        .single();

    const isParent = profile?.role === "parent";

return (
        <header className="sticky top-0 z-50 bg-cloud/90 backdrop-blur-md border-b border-ink/10 shadow-sm">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">

                {/* 左側：アプリロゴ & ファミリー名 */}
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-sky/50 p-1 transition group-hover:scale-105">
                        <Image
                            src="/logo-v4.png"
                            alt="MyTimeのロゴ"
                            fill
                            sizes="48px"
                            className="object-contain"
                        />
                    </div>
                    <div>
                        <h1 className="font-display text-base font-bold text-ink">
                            {familyName}
                        </h1>
                    </div>
                </Link>

                {/* 右側：ユーザー情報とアクションをまとめたグループ */}
                <div className="flex items-center gap-3">

                {/* リンク */}
                    <Link
                        href="/schedules"
                        className="flex items-center gap-1.5 rounded-xl bg-sunshine/15 px-3.5 py-2 text-xs font-bold text-sunshine transition hover:bg-sunshine/25"
                    >
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span>スケジュール</span>
                    </Link>
                    <Link
                        href="/tasks"
                        className="flex items-center gap-1.5 rounded-xl bg-mint/15 px-3.5 py-2 text-xs font-bold text-mint transition hover:bg-mint/25"
                    >
                        <CheckSquare className="h-3.5 w-3.5" />
                        <span>全てのタスク</span>
                    </Link>


                    {/* ユーザー情報カード */}
                    <div className="flex items-center gap-2 rounded-2xl bg-sky/60 px-3.5 py-1.5 border border-ink/5">
                        <div className="text-right">

                            <span className="text-[10px] font-bold text-ink/60">
                                {isParent ? "おうちの人" : "Kids"}
                        </span>
                            <p className="text-xs font-bold text-ink leading-tight">
                                {profile?.full_name || "ゲスト"}
                            </p>
                        </div>

                        {isParent && (
                            <span className="ml-1 rounded-full bg-sunshine/30 px-2 py-0.5 text-[10px] font-bold text-ink">
                                管理者
                            </span>
                        )}
                    </div>

                    {/* ログアウトボタン */}
                    <form action={logout}>
                        <button
                            type="submit"
                            className="rounded-xl bg-coral/10 px-3.5 py-2 text-xs font-bold text-coral transition hover:bg-coral/20"
                        >
                            ログアウト
                        </button>
                    </form>
                </div>

            </div>
        </header>
    );
    return (
        <header className="sticky top-0 z-50 bg-cloud/90 backdrop-blur-md border-b border-ink/10 shadow-sm">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
            {/* 左側：アプリロゴ & ファミリー名 */}
            <Link href="/dashboard" className="flex items-center gap-3 group">
                <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-sky/50 p-1 transition group-hover:scale-105">
                <Image
                    src="/logo-v4.png"
                    alt="MyTimeのロゴ"
                    fill
                    className="object-contain"
                />
                </div>
                <div>
                <h1 className="font-display text-base font-bold text-ink">
                    {familyName}
                </h1>
                <p className="text-[10px] font-mono uppercase tracking-widest text-mint font-bold">
                    MyTime
                </p>
                </div>
            </Link>

            {/* 右側：ユーザー情報とアクションをまとめたグループ */}
            <div className="flex items-center gap-3">
                {/* ユーザー情報カード */}
                <div className="flex items-center gap-2 rounded-2xl bg-sky/60 px-3.5 py-1.5 border border-ink/5">
                <div className="text-right">
                    <p className="text-xs font-bold text-ink leading-tight">
                    {profile?.full_name || "ゲスト"}
                    </p>
                    <span className="text-[10px] font-bold text-ink/60">
                    {isParent ? "おうちの人" : "こども"}
                    </span>
                </div>

                {/* 親のときの管理者バッジ（控えめなドットやアイコン風にするのもおしゃれ） */}
                {isParent && (
                    <span className="ml-1 rounded-full bg-sunshine/30 px-2 py-0.5 text-[10px] font-bold text-ink">
                    管理者
                    </span>
                )}
                </div>

                {/* ログアウトボタン */}
                <form action={logout}>
                <button
                    type="submit"
                    className="rounded-xl bg-coral/10 px-3.5 py-2 text-xs font-bold text-coral transition hover:bg-coral/20"
                >
                    ログアウト
                </button>
                </form>
            </div>
            </div>
        </header>
    );
}