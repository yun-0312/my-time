'use client';

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/auth-shell";
import { signup } from "./actions";
import { toast } from "sonner";

export default function SignupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);

        try {
            const result = await signup(formData);

            if (result?.error) {
                toast.error(result.error);
                setIsLoading(false);
                return;
            }

            if (result?.success) {
                toast.success("アカウントの作成に成功しました！おうちの設定をしましょう。");
                setTimeout(() => {
                    router.push("/setup-family");
                }, 500);
            }
        } catch (error) {

        }
    };

    return (
        <AuthShell
        eyebrow="アカウント作成"
        title="アカウントをつくる"
        description="メールアドレスとパスワードを入力して、アカウントを作成してください。"
        footer={
            <>
            すでにアカウントをお持ちの方は{" "}
            <Link
                href="/login"
                className="font-medium text-mint underline underline-offset-4 hover:text-mint/80"
            >
                ログイン
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
                    placeholder="parent@example.com"
                    autoComplete="email"
                    required
                />
                </div>

                <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="8文字以上"
                    autoComplete="new-password"
                    required
                    minLength={8}
                />
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-sunshine font-display font-bold text-ink hover:bg-sunshine/90"
                >
                    {isLoading ? "アカウントを作成中..." : "アカウントを作成する"}
                </Button>
            </form>
        </AuthShell>
    );
}
