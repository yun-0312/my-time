'use client';

import { useEffect, useRef, useState, useTransition } from "react";
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
import { updateMember, removeMember } from "@/app/actions/member-actions";
import { toast } from "sonner";
import type { Profile } from "@/types/dashboard";


const AVATAR_COLOR_OPTIONS = [
    { value: "mint", className: "bg-mint" },
    { value: "sunshine", className: "bg-sunshine" },
    { value: "lavender", className: "bg-lavender" },
    { value: "peach", className: "bg-peach" },
    { value: "babyblue", className: "bg-babyblue" },
];

interface updateMemberDialogProps {
    member: Profile | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UpdateMemberDialog({
    member,
    open,
    onOpenChange,
}: updateMemberDialogProps) {
    const [selectedColor, setSelectedColor] = useState("mint");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (member?.avatar_color) {
            setSelectedColor(member.avatar_color);
        } else {
            setSelectedColor("mint");
        }
    }, [member?.id]);

    if (!member) return null;

    function handleSubmit(formData: FormData) {
        if (!member?.id) {
            return;
        };

        setError(null);
        startTransition(async () => {
            try {
                const result = await updateMember(member!.id, formData);

                if (result?.error) {
                    setError(result.error);
                    return;
                }

                onOpenChange(false);
                toast.success("メンバー情報を更新しました！");
            } catch (e) {
                setError(
                    e instanceof Error ? e.message : "更新に失敗しました。",
                );
            }
        });
    }

    function handleDelete() {
        if (!member?.id) return;

        if (!confirm(`${member.full_name}さんを削除してもよろしいですか？`)) return;

        setError(null);
        startTransition(async () => {
            try {
                await removeMember(String(member!.id));
                onOpenChange(false);
                toast.success("メンバーを削除しました。");
            } catch (e) {
                setError(
                    e instanceof Error ? e.message : "メンバーの削除に失敗しました。",
                );
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-cloud">
                <DialogHeader>
                    <DialogTitle className="font-display text-xl text-ink">
                        家族メンバーの編集
                    </DialogTitle>
                    <DialogDescription className="text-ink/60">
                        なまえやアイコンの色を変更できます。
                    </DialogDescription>
                </DialogHeader>

                <form action={handleSubmit} className="space-y-4">
                    <input type="hidden" name="avatarColor" value={selectedColor} />

                    <div className="space-y-2">
                        <Label htmlFor="fullName">なまえ</Label>
                        <Input
                            id="fullName"
                            name="fullName"
                            defaultValue={member.full_name}
                            required
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

                    <DialogFooter className="flex items-center justify-between sm:justify-between">
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={isPending}
                            onClick={handleDelete}
                            className="bg-coral text-white hover:bg-coral/90"
                        >
                            {isPending ? "削除中..." : "削除する"}
                        </Button>

                        <Button
                            type="submit"
                            disabled={isPending}
                            className="bg-sunshine font-display font-bold text-ink hover:bg-sunshine/90"
                        >
                            {isPending ? "更新中..." : "変更を保存する"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}