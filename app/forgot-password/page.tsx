"use client";

import React, { useState } from "react";
import { resetPasswordForEmail } from "@/app/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email.trim()) return;

        setLoading(true);
        const result = await resetPasswordForEmail(email);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            setSubmitted(true);
            toast.success("パスワード再設定用のメールを送信しました！");
        }
    }

    return (
        <div className="min-h-screen bg-sky font-body text-ink flex items-center justify-center p-6">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="font-display test-3xl font-bold text-ink">パスワードを忘れた方</h1>
                    <p className="text-sm text-ink/60">ご登録のメールアドレス宛てに、再設定用のリンクをお送りします。</p>
                </div>

                <Card className="border-none bg-cloud shadow-sm">
                    <CardContent className="p-6">
                        {submitted ? (
                            <div className="space-y-4 text-center">
                                <p className="text-sm text-ink font-medium">
                                    <span className="font-bold">{email}</span>
                                </p>
                                <Link href="/login">
                                    <Button className="w-full bg-sunshine font-bold text-ink hover:bg-sunshine/90">
                                        ログイン画面に戻る
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-ink/70">メールアドレス</label>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="例： family@example.com"
                                        required
                                        className="bg-white"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading || !email.trim()}
                                    className="w-full bg-sunshine font-bold text-ink hover:bg-sunshine/90"
                                >
                                    {loading ? "送信中" : "再設定メールを送る"}
                                </Button>

                                <div className="text-center pt-2">
                                    <Link href="/login" className="text-xs text-ink/60 hover:underline">
                                        ログイン画面に戻る
                                    </Link>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}