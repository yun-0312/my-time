'use client';

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/auth-shell";
import { login } from "./actions";
import { toast } from "sonner";

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);

        try {
            const result = await login(formData);

            if (result?.error) {
                toast.error(result.error);
                setIsLoading(false);
            }

        } catch (error) {
            if ((error as Error).message === "NEXT_REDIRECT") {
                toast.success("ログインしました!");
                return;
            }

            console.error(error);
            toast.error("予期せぬエラーが発生しました。");
            setIsLoading(false);
        }
    };

    return (
        <AuthShell
        eyebrow="おかえりなさい"
        title="ログイン"
        description="メールアドレスとパスワードを入力してね。"
        footer={
            <>
            はじめての方は{" "}
            <Link
                href="/signup"
                className="font-medium text-mint underline underline-offset-4 hover:text-mint/80"
            >
                アカウントをつくる
            </Link>
            </>
        }
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="email">メールアドレス</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="taro@example.com"
                        autoComplete="email"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">パスワード</Label>
                        <Link
                        href="/forgot-password"
                        className="text-xs text-ink/50 underline underline-offset-4 hover:text-ink/70"
                        >
                        わすれた方はこちら
                        </Link>
                    </div>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        required
                    />
                </div>

                <Button
                type="submit"
                className="w-full bg-sunshine font-display font-bold text-ink hover:bg-sunshine/90"
                >
                    {isLoading ? "ログイン中..." : "ログインする"}
                </Button>
            </form>
        </AuthShell>
    );
}
