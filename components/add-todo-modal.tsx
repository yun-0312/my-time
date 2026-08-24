"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { createTask } from "@/app/actions/task-actions";
import type { Profile } from "@/types/dashboard";
import { toast } from "sonner";

interface AddTodoModalProps {
    isOpen: boolean;
    onClose: () => void;
    familyId: string;
    members: Profile[];
}

export function AddTodoModal({
    isOpen,
    onClose,
    familyId,
    members = [],
}: AddTodoModalProps) {
    const [isPending, startTransition] = useTransition();
    const [assignedTo, setAssignedTo] = useState<string>("");

    const selectedMember = members.find((m) => m.id === assignedTo);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        if (assignedTo) {
            formData.set("assigned_to", assignedTo);
        }

        startTransition(async () => {
            try {
                await createTask(formData); // サーバーアクションを呼び出し
                toast.success("タスクを追加しました！");
                onClose();
            } catch (error) {
                console.error("Task add error:", error);
                toast.error("タスクの追加に失敗しました。");
            }
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                    <DialogTitle className="font-display text-lg font-bold text-ink">
                        タスクを詳しく追加
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
                    <input type="hidden" name="family_id" value={familyId} />
                    <input type="hidden" name="assigned_to" value={assignedTo} />

                    {/* タスク名 */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-ink/70">
                            タスク名 <span className="text-coral">*</span>
                        </label>
                        <Input
                            name="title"
                            placeholder="例: 宿題をやる"
                            required
                            className="w-full"
                        />
                    </div>

                    {/* メモや詳細 */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-ink/70">メモ・詳細（任意）</label>
                        <Input
                            name="description"
                            placeholder="例：漢字ドリル"
                            className="w-full text-xs"
                        />
                    </div>

                    {/* 期限 (due_at) */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-ink/70">期限（任意）</label>
                        <Input
                            type="datetime-local"
                            name="due_at"
                            className="w-full text-xs text-ink/70"
                        />
                    </div>

                    {/* 担当者 */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-ink/70">
                            担当する人
                        </label>
                        <Select
                            value={assignedTo}
                            onValueChange={(value) => {
                                const newValue = !value || value === "UNASSIGNED" ? "" : value;
                                setAssignedTo(newValue);
                            }}
                        >
                            <SelectTrigger className="w-full">
                                <span className="truncate">
                                    {selectedMember ? selectedMember.full_name : "指定なし"}
                                </span>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="UNASSIGNED">指定なし</SelectItem>
                                {members.map((member) => (
                                    <SelectItem key={member.id} value={member.id}>
                                        {member.full_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="border-ink/20 text-ink"
                        >
                            キャンセル
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="bg-sunshine font-display font-bold text-ink hover:bg-sunshine/90"
                        >
                            {isPending ? "追加中..." : "追加する"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}