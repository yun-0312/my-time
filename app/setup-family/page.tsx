'use client';

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/auth-shell";
import { setupFamily } from "./actions";
import { toast } from "sonner";

export default function SetupFamilyPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);

        try {
            const result = await setupFamily(formData);

            if (result?.error) {
                toast.error(result.error);
                setIsLoading(false);
            }
        } catch (error) {

        }
    };

    return (
        <AuthShell
            eyebrow="最初のステップ"
            title="おうち（家族）をつくる"
            description="アプリのはじめに、おうちの名前とあなたのニックネームを入力してください。"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="familyName">おうちの名前（グループ名）</Label>
                    <Input
                        id="familyName"
                        name="familyName"
                        type="text"
                        placeholder="例: さとう家"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="fullName">あなたのお名前（ニックネーム）</Label>
                    <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="例: ママ / パパ"
                        required
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full bg-sunshine font-display font-bold text-int hover:bg-sunshine/90"
                >
                    {isLoading ? "おうちを作っています..." : "おうちを作る"}
                </Button>
            </form>
        </AuthShell>
    )
}