"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client"; // ブラウザ用クライアントを使用

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    useEffect(() => {
        async function handleRecoveryToken() {
            const token = searchParams.get("token");
            const type = searchParams.get("type");

            if (token && type === "recovery") {
                const { data: { session } } = await supabase.auth.getSession();
                
                if (!session) {
                    const { error: verifyError } = await supabase.auth.verifyOtp({
                        token_hash: token,
                        type: "recovery",
                    });

                    if (verifyError) {
                        toast.error("リンクの有効期限が切れているか、無効なトークンです。");
                    }
                }
            }
            setVerifying(false);
        }

        handleRecoveryToken();
    }, [searchParams, supabase]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!password.trim()) return;

        setLoading(true);
        // クライアント側から直接パスワードを更新する
        const { error } = await supabase.auth.updateUser({
            password: password,
        });
        setLoading(false);

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("パスワードを更新しました！ログインしてください。");
            router.push("/login");
        }
    }

    if (verifying) {
        return (
            <div className="min-h-screen bg-sky font-body text-ink flex items-center justify-center p-6">
                <p className="text-sm text-ink/60">認証を確認しています...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-sky font-body text-ink flex items-center justify-center p-6">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="font-display text-3xl font-bold text-ink">新しいパスワードの設定</h1>
                    <p className="text-sm text-ink/60">新しいパスワードを入力してください。</p>
                </div>

                <Card className="border-none bg-cloud shadow-sm">
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-ink/70">新しいパスワード</label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="6文字以上で入力"
                                    required
                                    minLength={6}
                                    className="bg-white"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading || !password.trim()}
                                className="w-full bg-sunshine font-bold text-ink hover:bg-sunshine/90"
                            >
                                {loading ? "更新中..." : "パスワードを更新する"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}