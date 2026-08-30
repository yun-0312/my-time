"use client";

import React, { useEffect, useState, useTransition, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Trash2, CheckSquare } from "lucide-react";
import { updateSchedule, deleteSchedule } from "@/app/actions/schedule-actions";
import { getTasksByScheduleId } from "@/app/actions/task-actions";
import type { Profile, Schedule, Task } from "@/types/dashboard";
import { toast } from "sonner";
import { formatForDatetimeLocal } from "@/utils/format";
import { TodoList } from "./todo-list";


interface EditScheduleModalProps {
    schedule: Schedule | null;
    members: Profile[];
    isOpen: boolean;
    onClose: () => void;
    tasks?: Task[];
    currentUserId: string;
}

export function EditScheduleModal({
    schedule,
    members,
    isOpen,
    onClose,
    tasks = [],
    currentUserId,
}: EditScheduleModalProps) {
    const [isPending, startTransition] = useTransition();

    const [title, setTitle] = useState("");
    const [startAt, setStartAt] = useState("");
    const [endAt, setEndAt] = useState("");
    const [targetUserId, setTargetUserId] = useState("");

    const [scheduleTasks, setScheduleTasks] = useState<Task[]>([]);

    const fetchScheduleTasks = useCallback(async () => {
        if (!schedule) return;
        try {
            const tasksData = await getTasksByScheduleId(schedule.id);
            setScheduleTasks(tasksData);
        } catch (error) {
            console.error("タスクの取得に失敗しました", error);
        }
    }, [schedule]);

    useEffect(() => {
        if (!schedule) return;

        setTitle(schedule.title || "");
        setStartAt(formatForDatetimeLocal(schedule.start_at));
        setEndAt(formatForDatetimeLocal(schedule?.end_at));
        setTargetUserId(schedule.target_user_id || "");

        async function fetchScheduleTasks() {
            try {
                const tasksData = await getTasksByScheduleId(schedule!.id);
                setScheduleTasks(tasksData);
            } catch (error) {
                console.error("タスクの取得に失敗しました", error);
            }
        }
        fetchScheduleTasks();
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
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg bg-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-display text-lg font-bold text-ink">
                        予定の詳細と準備タスク
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleUpdate} className="flex flex-col gap-4 py-2">
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
                    <div className="flex justify-between items-center pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            disabled={isPending}
                            onClick={handleDelete}
                            className="text-coral hover:bg-coral/10 hover:text-coral"
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

                {/* 紐づく準備タスクセクション */}
                <div className="mt-4 border-t border-ink/10 pt-4">
                    <h3 className="flex items-center gap2 font-display text-sm font-bold text-ink mb-3">
                        <CheckSquare className="h-4 w-4 text-mint" />
                        <span>この予定の準備・やること</span>
                    </h3>

                    <TodoList
                        familyId={schedule.family_id}
                        members={members}
                        initialTasks={scheduleTasks}
                        currentUserId={schedule.target_user_id || currentUserId}
                        scheduleId={schedule.id}
                        hideHeader={true}
                        defaultDueAt={schedule.start_at}
                        onTaskChanged={fetchScheduleTasks}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}