'use client';

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/auth-shell";
import { signup } from "./actions";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";

export default function SignupPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [userEmail, setUserEmail] = useState("");

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const emailValue = formData.get('email') as string;

        try {
            const result = await signup(formData);

            if (result?.error) {
                toast.error(result.error);
                setIsLoading(false);
                return;
            }

            if (result?.success) {
                setUserEmail(emailValue);
                setIsSubmitted(true);
                toast.success("確認メールを送信しました！");

            }
        } catch (error) {
            toast.error("予期せぬエラーが発生しました。");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <AuthShell
                eyebrow="確認メール送信完了"
                title="メールをご確認ください"
                description={`${userEmail}宛てに確認用のメールを送信しました。`}
                footer={
                    <Link
                        href="/login"
                        className="font-medium text-mint underline underline-offset-4 hover:text-mint/80"
                    >
                        ログイン画面に戻る
                    </Link>
                }
            >
                <div className="space-y-6 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-mint/20 text-mint">
                        <MailCheck className="h-6 w-6" />
                    </div>
                    <div className="space-y-2 text-sm text-ink/80">
                        <p className="cont-bold text-ink">{userEmail}</p>
                        <p>宛てに確認用のメールを送信しました。</p>
                        <p className="text-xs text-ink/60">
                            メールに記載されているリンクをクリックすると、アカウントの登録が完了し、おうちの設定に進むことができます。
                        </p>
                    </div>
                </div>
            </AuthShell>
        )
    }

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
