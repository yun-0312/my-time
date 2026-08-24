"use client";

import { useRef, useState, useTransition } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addFamilyMember } from "@/app/dashboard/actions";
import { toast } from "sonner";

const AVATAR_COLOR_OPTIONS = [
    { value: "mint", className: "bg-mint" },
    { value: "sunshine", className: "bg-sunshine" },
    { value: "lavender", className: "bg-lavender" },
    { value: "peach", className: "bg-peach"},
    { value: "babyblue", className: "bg-babyblue" },
];

interface AddMemberDialogProps {
    familyId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ROLE_OPTIONS = [
    { value: "child", label: "こども" },
    { value: "parent", label: "おうちの人" },
];

export function AddMemberDialog({
    familyId,
    open,
    onOpenChange,
}: AddMemberDialogProps) {
    const formRef = useRef<HTMLFormElement>(null);
    const [selectedColor, setSelectedColor] = useState("mint");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [selectedRole, setSelectedRole] = useState("child");

    function handleSubmit(formData: FormData) {
        setError(null);
        startTransition(async () => {
            try {
                await addFamilyMember(formData);
                formRef.current?.reset();
                setSelectedColor("mint");
                onOpenChange(false);

                toast.success("家族を追加しました！")
            } catch (e) {
                setError(
                e instanceof Error ? e.message : "メンバーの追加に失敗しました。",
                );
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-cloud">
                <DialogHeader>
                    <DialogTitle className="font-display text-xl text-ink">
                        家族メンバーを追加する
                    </DialogTitle>
                    <DialogDescription className="text-ink/60">
                        なまえ、役割、ログイン情報などを入力してね。
                    </DialogDescription>
                </DialogHeader>

                <form ref={formRef} action={handleSubmit} className="space-y-4">
                    <input type="hidden" name="role" value={selectedRole} />
                    <input type="hidden" name="familyId" value={familyId} />
                    <input type="hidden" name="avatarColor" value={selectedColor} />

                    <div className="space-y-2">
                        <Label>役割</Label>
                        <div className="flex gap-4">
                            {ROLE_OPTIONS.map((opt) => (
                                <label key={opt.value} className="flex items-center gap-2 text-sm font-medium">
                                    <input
                                        type="radio"
                                        name="roleRadio"
                                        checked={selectedRole === opt.value}
                                        onChange={() => setSelectedRole(opt.value)}
                                        className="accent-mint"
                                    />
                                    {opt.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="fullName">なまえ</Label>
                        <Input
                        id="fullName"
                        name="fullName"
                        placeholder="はなこ"
                        required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">メールアドレス</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="child@example.com"
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

                    <div className="space-y-2">
                        <Label>アイコンの色</Label>
                        <div className="flex gap-3">
                        {AVATAR_COLOR_OPTIONS.map((option) => (
                            <button
                            key={option.value}
                            type="button"
                            onClick={() => setSelectedColor(option.value)}
                            className={`h-9 w-9 rounded-full ${option.className} ${
                                selectedColor === option.value
                                ? "ring-2 ring-ink ring-offset-2"
                                : ""
                            }`}
                            aria-label={option.value}
                            />
                        ))}
                        </div>
                    </div>

                    {error && <p className="text-sm text-coral">{error}</p>}

                    <DialogFooter>
                        <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-sunshine font-display font-bold text-ink hover:bg-sunshine/90"
                        >
                        {isPending ? "追加中…" : "追加する"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
