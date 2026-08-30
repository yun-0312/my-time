"use client";

import { useState, useTransition, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { createSchedule } from "@/app/actions/schedule-actions";
import type { Profile } from "@/types/dashboard";
import { toast } from "sonner";
import { formatForDatetimeLocal } from "@/utils/format";

interface AddScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    familyId: string;
    members: Profile[];
    initialDate: string;
}

export function AddScheduleModal({
    isOpen,
    onClose,
    familyId,
    members = [],
    initialDate,
}: AddScheduleModalProps) {
    const [isPending, startTransition] = useTransition();
    const [assignedTo, setAssignedTo] = useState<string>("");

    const [startAt, setStartAt] = useState("");
    const [endAt, setEndAt] = useState("");

    useEffect(() => {
        if (initialDate) {
            const formattedStart = formatForDatetimeLocal(initialDate);
            setStartAt(formattedStart);

            const [datePart, timePart] = formattedStart.split("T");
            if (timePart) {
                const [hours, minutes] = timePart.split(":");
                const nextHour = String(Number(hours) + 1).padStart(2, "0");
                setEndAt(`${datePart}T${nextHour}:${minutes}`);
            } else {
                setEndAt("");
            }
        }
    }, [initialDate]);

    const selectedMember = members.find((m) => m.id === assignedTo);

    function handleSubmit(formData: FormData) {
        const startValue = formData.get("start_at") as string;
        const endValue = formData.get("end_at") as string;

        if (startValue && endValue) {
            const startDate = new Date(startValue);
            const endDate = new Date(endValue);

            if (endDate <= startDate) {
                toast.error("終了日時は開始日時より後の時間を指定してください！");
                return;
            }
        }

        startTransition(async () => {

            try {
                const result = await createSchedule(formData);
                if (result?.success) {
                    toast.success("スケジュールを追加しました！");
                    onClose();
                }
            } catch (e) {
                toast.error("スケジュールの追加に失敗しました。");
            }
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                    <DialogTitle className="font-display text-lg font-bold text-ink">
                        予定を追加
                    </DialogTitle>
                </DialogHeader>

                <form action={handleSubmit} className="flex flex-col gap-4 py-2">
                    <input type="hidden" name="family_id" value={familyId} />
                    <input type="hidden" name="target_user_id" value={assignedTo} />

                    {/* タイトル */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-ink/70">
                            予定名 <span className="text-coral">*</span>
                        </label>
                        <Input
                            name="title"
                            placeholder="例:家族でお出かけ"
                            required
                            className="w-full"
                        />
                    </div>

                    {/* 開始日時・終了日時 */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-ink/70">開始日時</label>
                            <Input
                                type="datetime-local"
                                name="start_at"
                                value={startAt}
                                onChange={(e) => setStartAt(e.target.value)}
                                className="w-full text-xs text-ink/70"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-ink/70">終了日時</label>
                            <Input
                                type="datetime-local"
                                name="end_at"
                                value={endAt}
                                onChange={(e) => setEndAt(e.target.value)}
                                className="w-full text-xs text-ink/70"
                            />
                        </div>
                    </div>

                    {/* 担当者 */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-ink/70">
                            対象メンバー
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