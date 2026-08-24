"use client";

import React, { useMemo, useOptimistic, useRef, useState, useTransition, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select";
import { SlidersHorizontal, Trash2 } from "lucide-react";
import { CheckSquare } from "lucide-react";
import { createTask, toggleTaskCompletion, deleteTask } from "@/app/actions/task-actions"
import type { Profile, Task } from "@/types/dashboard";
import { formatToJST } from "@/utils/format";
import { toast } from "sonner";
import { getHexColor } from "@/utils/thema";
import { AddTodoModal } from "@/components/add-todo-modal";
import { getTodayJSTRange } from "@/utils/date";

type Filter = "open" | "done" | "all";

interface TodoListProps {
    familyId: string;
    members: Profile[];
    initialTasks: Task[];
    title?: string;
    currentUserId: string;
}

export function TodoList({ familyId, members, initialTasks, title= "タスク", currentUserId }: TodoListProps) {
    const [tasks, setTasks] = useState(initialTasks);
    const [optimisticTasks, setOptimisticDone] = useOptimistic(
        tasks,
        (state, { id, isCompleted }: { id: string; isCompleted: boolean }) =>
        state.map((t) => (t.id === id ? { ...t, is_completed: isCompleted } : t)),
    );
    const [isPending, startTransition] = useTransition();
    const [filter, setFilter] = useState<Filter>("open");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const [quickTitle, setQuickTitle] = useState("");

    useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    const memberMap = useMemo(
        () => new Map(members.map((m) => [m.id, m])),
        [members],
    );

    const visibleTasks = optimisticTasks.filter((t) => {
        if (filter === "open") return !t.is_completed;
        if (filter === "done") return t.is_completed;
        return true;
    });

    function handleToggle(task: Task) {
        const nextCompleted = !task.is_completed;

        startTransition(async () => {
            setOptimisticDone({ id: task.id, isCompleted: nextCompleted });

            try {
                await toggleTaskCompletion(task.id, nextCompleted);

                if (nextCompleted) {
                    toast.success("タスクを完了しました！🎉");
                } else {
                    toast.info("タスクを未完了に戻しました。");
                }
            } catch (e) {
                console.error("Toggle error:", e);
                toast.error("タスクの更新に失敗しました。")
            }
        });
    }

    function handleDelete(taskId: string) {
        startTransition(async () => {
            try {
                await deleteTask(taskId);
                setTasks((prev) => prev.filter((t) => t.id !== taskId));
                toast.success("タスクを削除しました");
            } catch (error) {
                console.error("Delete error:", error);
                toast.error("タスクの削除に失敗しました");
            }
        });
    }

    function handleQuickSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!quickTitle.trim()) return;

        const formData = new FormData();
        formData.append("title", quickTitle.trim());
        formData.append("family_id", familyId);

        const { endOfTodayUTC } = getTodayJSTRange();
        formData.append("due_at", endOfTodayUTC);

        if (currentUserId) {
            formData.append("assigned_to", currentUserId);
        }

        startTransition(async () => {
            try {
                const result = await createTask(formData);
                if (result?.success) {
                    setQuickTitle("");
                    toast.success("タスクを追加しました！");
                }
            } catch (e) {
                toast.error("タスクの追加に失敗しました。");
            }
        });
    }

    return (
        <section>
            <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 font-display text-xl font-bold text-ink">                        <CheckSquare className="h-5 w-5 text-mint" />{title}
                </h2>
                <div className="flex gap-1 rounded-full bg-cloud p-1 text-xs">
                {(["open", "done", "all"] as const).map((key) => (
                    <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`rounded-full px-3 py-1 font-medium transition-colors ${
                        filter === key
                        ? "bg-sunshine text-ink"
                        : "text-ink/50 hover:text-ink"
                    }`}
                    >
                    {key === "open" ? "未完了" : key === "done" ? "完了" : "すべて"}
                    </button>
                ))}
                </div>
            </div>

            {/* クイック入力 ＋ 詳しく追加ボタン */}
            <div className="mb-4 flex gap-2">
                <form onSubmit={handleQuickSubmit} className="flex flex-1 gap-2">
                    <Input
                        value={quickTitle}
                        onChange={(e) => setQuickTitle(e.target.value)}
                        placeholder="＋ やること（例: プールの準備）を入力してEnter"
                        disabled={isPending}
                        className="h-11 rounded-2xl bg-white border-none shadow-sm px-4 text-sm"
                    />
                </form>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddModalOpen(true)}
                    className="h-11 rounded-2xl border-none bg-cloud px-4 text-ink hover:bg-cloud/80 shadow-sm"
                    title="担当者や期限を指定して追加"
                >
                    <SlidersHorizontal className="h-4 w-4 mr-1" />
                    詳細を設定
                </Button>
            </div>

            <Card className="border-none bg-cloud shadow-sm">
                <CardContent className="divide-y divide-ink/10 p-0">
                    {visibleTasks.length === 0 && (
                        <p className="p-6 text-center text-sm text-ink/50">
                        タスクはまだありません。
                        </p>
                    )}

                    {visibleTasks.map((task) => {
                        const assignee = task.assigned_to
                            ? memberMap.get(task.assigned_to)
                            : undefined;

                        const accentColor = getHexColor(assignee?.avatar_color);

                        return (
                            <div
                                key={task.id}
                                className="flex items-center gap-3 p-4"
                                style={{
                                        borderLeft: `4px solid ${accentColor}`,
                                    }}
                                >
                                <Checkbox
                                    checked={task.is_completed}
                                    disabled={isPending}
                                    onCheckedChange={() => handleToggle(task)}
                                />
                                <div className="flex-1">
                                    <p
                                        className={`text-sm font-medium ${
                                            task.is_completed ? "text-ink/40 line-through" : "text-ink"
                                        }`}
                                    >
                                        {task.title}
                                    </p>
                                    {task.description && (
                                        <p className="text-xs text-int/60">
                                            {task.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 font-mono text-[11px] text-ink/40">
                                        <span style={{ color: assignee ? accentColor : undefined }} className="font-semibold">
                                            {assignee?.full_name ?? "だれか"}
                                        </span>
                                        {task.due_at && (
                                            <span>・ 期限: {formatToJST(task.due_at)}</span>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={isPending}
                                    onClick={() => handleDelete(task.id)}
                                    className="h-8 w-8 text-ink/40 hover:text-coral hover:bg-coral/10"
                                    title="タスクを削除"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            <AddTodoModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                familyId={familyId}
                members={members}
            />
        </section>
    );
}

function AddTaskForm({
    familyId,
    members,
}: {
    familyId: string;
    members: Profile[];
}) {
    const formRef = useRef<HTMLFormElement>(null);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const [assignedTo, setAssignedTo] = useState<string>("");
    const selectedMember = members.find((m) => m.id === assignedTo);

    function handleSubmit(formData: FormData) {
        setError(null);
        startTransition(async () => {
            try {
                const result = await createTask(formData);
                if (result?.success) {
                    formRef.current?.reset();
                    setAssignedTo("");
                    toast.success("タスクを追加しました！");
                }
            } catch (e) {
                setError(
                    e instanceof Error ? e.message : "タスクの追加に失敗しました。",
                );
            }
        });
    }

    return (
        <form
            ref={formRef}
            action={handleSubmit}
            className="mt-4 flex flex-col gap-3 rounded-2xl bg-cloud p-4 shadow-sm"
        >
            <input type="hidden" name="family_id" value={familyId} />
            <input type="hidden" name="assigned_to" value={assignedTo} />

            {/* タスク名 */}
            <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-ink/70">
                    タスク名 <span className="text-coral">*</span>
                </label>
                <Input
                    name="title"
                    placeholder="例：宿題をやる"
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

            {/* 期限 と 担当者（スマホ：縦積み、PC：横並び） */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* 期限（日時） */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-ink/70">
                        期限（任意）
                    </label>
                    <Input
                        type="datetime-local"
                        name="due_at"
                        className="w-full text-xs text-ink/70"
                    />
                </div>

                {/* 担当者 */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-ink/70">担当する人</label>
                    <Select
                        value={assignedTo}
                        onValueChange={(value) => {
                            const newValue = !value || value === "UNASSIGNED" ? "" : value;
                            setAssignedTo(newValue);
                        }}
                    >
                        <SelectTrigger className="w-full">
                            <span className="truncate">
                                {selectedMember ? selectedMember.full_name : "みんな（指定なし）"}
                            </span>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="UNASSIGNED">みんな（指定なし）</SelectItem>
                            {members.map((member) => (
                                <SelectItem key={member.id} value={member.id}>
                                    {member.full_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-sunshine font-display font-bold text-ink hover:bg-sunshine/90 sm:w-auto"
            >
                {isPending ? "追加中…" : "＋ 追加"}
            </Button>
            {error && <p className="text-sm text-coral">{error}</p>}
        </form>
    );
}
