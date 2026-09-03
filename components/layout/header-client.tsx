"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckSquare, CalendarDays, Menu, LogOut } from "lucide-react";
import { useState } from "react";
import { logout } from "@/app/logout/actions";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface HeaderClientProps {
    familyName: String;
    profile: {
        full_name: string | null;
        role: "parent" | "child";
        avatar_color: string | null;
    } | null;
    dashboardHref: string;
    schedulesHref: string;
    tasksHref: string;
}

export function HeaderClient({
    familyName,
    profile,
    dashboardHref,
    schedulesHref,
    tasksHref,
}: HeaderClientProps) {
    const [open, setOpen] = useState(false);
    const isParent = profile?.role === "parent";

    return (
        <header className="sticky top-0 z-50 bg-cloud/90 backdrop-blur-md border-b border-ink/10 shadow-sm">
<div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">

                {/* 左側：アプリロゴ & ファミリー名 */}
                <Link href={dashboardHref} className="flex items-center gap-3 group">
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

                {/* PC表示（md以上） */}
                <div className="hidden md:flex items-center gap-3">
                    <Link
                        href={schedulesHref}
                        className="flex items-center gap-1.5 rounded-xl bg-sunshine/15 px-3.5 py-2 text-xs font-bold text-sunshine transition hover:bg-sunshine/25"
                    >
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span>スケジュール</span>
                    </Link>
                    <Link
                        href={tasksHref}
                        className="flex items-center gap-1.5 rounded-xl bg-mint/15 px-3.5 py-2 text-xs font-bold text-mint transition hover:bg-mint/25"
                    >
                        <CheckSquare className="h-3.5 w-3.5" />
                        <span>全てのタスク</span>
                    </Link>

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

                    <form action={logout}>
                        <button
                            type="submit"
                            className="rounded-xl bg-coral/10 px-3.5 py-2 text-xs font-bold text-coral transition hover:bg-coral/20"
                        >
                            ログアウト
                        </button>
                    </form>
                </div>

                {/* モバイル */}
                <div className="flex md:hidden items-center gap-2">
                    <div className="rounded-xl bg-sky/60 px-2.5 py-1 text-right">
                        <p className="text-[11px] font-bold text-ink leading-tight">
                            {profile?.full_name || "ゲスト"}
                        </p>
                    </div>

                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger
                            render={
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-xl bg-ink/5 text-ink hover:bg-ink/10 h-9 w-9"
                                    aria-label="メニューを開く"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            }>

                        </SheetTrigger>

                        <SheetContent side="right" className="bg-cloud flex flex-col justify-between">
                            <div>
                                <SheetHeader className="text-left mb-6">
                                    <SheetTitle className="font-display text-lg text-ink">
                                        メニュー
                                    </SheetTitle>
                                    <SheetDescription className="text-ink/60 text-xs">
                                        {profile?.full_name}さん（{isParent ? "おうちの人" : "Kids"}）
                                    </SheetDescription>
                                </SheetHeader>

                                <div className="flex flex-col gap-3">
                                    <Link
                                        href={schedulesHref}
                                        onClick={() => setOpen(false)}
                                        className="flex items-center gap-2.5 rounded-xl bg-sunshine/15 px-4 py-3 text-sm font-bold text-sunshine transition"
                                    >
                                        <CalendarDays className="h-4 w-4" />
                                        <span>スケジュール</span>
                                    </Link>

                                    <Link
                                        href={tasksHref}
                                        onClick={() => setOpen(false)}
                                        className="flex items-center gap-2.5 rounded-xl bg-mint/15 px-4 py-3 text-sm font-bold text-mint transition"
                                    >
                                        <CheckSquare className="h-4 w-4" />
                                        <span>全てのタスク</span>
                                    </Link>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-ink/10">
                                <form action={logout}>
                                    <button
                                        type="submit"
                                        className="flex items-center justify-center gap-2 w-full rounded-xl bg-coral/10 px-4 py-3 text-sm font-bold text-coral transition hover:bg-coral/20"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>ログアウト</span>
                                    </button>
                                </form>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

            </div>
        </header>
    );
}