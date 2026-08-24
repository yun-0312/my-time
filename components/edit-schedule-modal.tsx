"use client";

import React, { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { updateSchedule, deleteSchedule } from "@/app/actions/schedule-actions";
import type { Profile, Schedule } from "@/types/dashboard";
import { toast } from "sonner";
import { formatForDatetimeLocal } from "@/utils/format";


interface EditScheduleModalProps {
    schedule: Schedule | null;
    members: Profile[];
    isOpen: boolean;
    onClose: () => void;
}

export function EditScheduleModal({
    schedule,
    members,
    isOpen,
    onClose,
}: EditScheduleModalProps) {
    const [isPending, startTransition] = useTransition();

    const [title, setTitle] = useState("");
    const [startAt, setStartAt] = useState("");
    const [endAt, setEndAt] = useState("");
    const [targetUserId, setTargetUserId] = useState("");

    useEffect(() => {
        if (schedule) {
            setTitle(schedule.title || "");
            setStartAt(formatForDatetimeLocal(schedule.start_at));
            setEndAt(formatForDatetimeLocal(schedule?.end_at));
            setTargetUserId(schedule.target_user_id || "");
        }
    }, [schedule])

    if (!isOpen || !schedule) return null;

    const selectedMember = members.find((m) => m.id === targetUserId);

    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault();
        const formData = new FormData();

        formData.append("title", title);
        formData.append("start_at", startAt);
        if (endAt) formData.append("end_at", endAt);
        formData.append("target_user_id", targetUserId);

        startTransition(async () => {
            try {
                await updateSchedule(String(schedule!.id), formData);
                toast.success("スケジュールを更新しました！");
                onClose();
            } catch (error) {
                console.error("Update error:", error);
                toast.error("スケジュールの更新に失敗しました。");
            }
        });
    }

    async function handleDelete() {
        if (!confirm("本当にこのスケジュールを削除しますか？")) return;

        startTransition(async() => {
            try {
                await deleteSchedule(String(schedule!.id));
                toast.success("スケジュールを削除しました。");
                onClose();
            } catch (error) {
                console.error("Delete error:", error);
                toast.error("スケジュールの削除に失敗しました。");
            }
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-display text-xl font-bold text-ink">予定の編集・削除</h2>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        ✕
                    </Button>
                </div>

                <form onSubmit={handleUpdate} className="flex flex-col gap-4">
                    {/*タイトル*/}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-ink/70">タイトル</label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    {/*日時*/}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-ink/70">開始日時</label>
                            <Input
                                type="datetime-local"
                                value={startAt}
                                onChange={(e) => setStartAt(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-ink/70">終了日時</label>
                            <Input
                                type="datetime-local"
                                value={endAt}
                                onChange={(e) => setEndAt(e.target.value)}
                            />
                        </div>
                    </div>

                    {/*担当者*/}
                    <div className="flex flex-col gap-1">
                        <label className="text-sx font-medium text-ink/70">対象メンバー</label>
                        <Select
                            value={targetUserId || "UNASSIGNED"}
                            onValueChange={(val) => {
                                const newValue = !val || val === "UNASSIGNED" ? "" : val;
                                setTargetUserId(newValue)
                            }}
                        >
                            <SelectTrigger className="w-full">
                                <span className="truncate">
                                    {selectedMember ? selectedMember.full_name : "みんな（指定なし）"}
                                </span>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="UNASSIGNED">みんな（指定なし）</SelectItem>
                                {members.map((m) => (
                                    <SelectItem key={m.id} value={m.id}>
                                        {m.full_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/*ボタン類*/}
                    <div className="mt-4 flex items-center justify-between">
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={isPending}
                            onClick={handleDelete}
                            className="bg-coral/10 text-coral hover:bg-coral/20"
                        >
                            <Trash2 className="mr-1 h-4 w-4" />
                            削除
                        </Button>

                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={onClose}>
                                キャンセル
                            </Button>
                            <Button type="submit" disabled={isPending} className="bg-sunshine text-ink">
                                {isPending ? "保存中..." : "変更を保存"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}