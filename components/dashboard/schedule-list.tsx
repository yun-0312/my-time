"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { CalendarDays } from "lucide-react";
import type { Schedule, Profile } from "@/types/dashboard";
import { AddScheduleModal } from "@/components/add-schedule-modal";
import { getHexColor } from "@/utils/thema";
import { EditScheduleModal } from "@/components/edit-schedule-modal";
import { deleteSchedule } from "@/app/actions/schedule-actions";
import { toast } from "sonner";
import { formatToJST } from "@/utils/format";
import { getTodayDefaultDatetime } from "@/utils/date";

interface ScheduleListProps {
    familyId: string;
    members: Profile[];
    initialSchedules: Schedule[];
}

export function ScheduleList({ familyId, members, initialSchedules }: ScheduleListProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [schedules, setSchedules] = useState(initialSchedules);
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        setSchedules(initialSchedules);
    }, [initialSchedules]);

    const memberMap = useMemo(() => {
        return new Map(members.map((m) => [m.id, m]));
    }, [members]);

    const todaySchedules = useMemo(() => {
        const todayStr = new Date().toDateString();

        return schedules.filter((schedule) => {
            if (!schedule.start_at) return false;
            const scheduleDate = new Date(schedule.start_at).toDateString();
            return scheduleDate === todayStr;
        });
    }, [schedules]);

    function handleDelete(scheduleId: string, e: React.MouseEvent) {
        e.stopPropagation();
        startTransition(async () => {
            try {
                await deleteSchedule(scheduleId);
                setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
                toast.success("スケジュールを削除しました");
            } catch (error) {
                console.error("Delete error:", error);
                toast.error("スケジュールの削除に失敗しました");
            }
        });
    }

    return (
        <section>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-display text-xl font-bold text-ink"><CalendarDays className="h-5 w-5 text-sunshine" />今日の予定</h2>
                <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-sunshine font-display font-bold text-ink hover:bg-sunshine/90"
                >
                    ＋ スケジュールを追加する
                </Button>
            </div>

            <Card className="border-none bg-cloud shadow-sm">
                <CardContent className="divide-y divide-ink/10 p-0">
                    {schedules.length === 0 && (
                        <p className="p-6 text-center text-sm text-ink/50">
                        予定はまだありません。
                        </p>
                    )}

                    {schedules.map((schedule) => {
                        const targetUser = schedule.target_user_id
                            ? memberMap.get(schedule.target_user_id)
                            : undefined;

                        const accentColor = getHexColor(targetUser?.avatar_color);

                        return (
                            <div
                                key={schedule.id}
                                onClick={() => setSelectedSchedule(schedule)}
                                className="flex items-center gap-3 p-4"
                                style={{
                                    borderLeft: `4px solid ${accentColor}`,
                                }}
                            >
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-ink">{schedule.title}</p>
                                    <div className="flex items-center gap-2 font-mono text-[11px] text-ink/40">
                                        <span style={{ color: targetUser ? accentColor : undefined }}className="font-semibold">
                                            {targetUser?.full_name ?? "だれか"}
                                        </span>
                                        <span>
                                            ・時間： {formatToJST(schedule.start_at)}
                                        </span>
                                            {schedule.end_at && (
                                                <span> ～ {formatToJST(schedule.end_at)}</span>
                                            )}
                                    </div>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={isPending}
                                    onClick={(e) => handleDelete(schedule.id, e)}
                                    className="h-8 w-8 text-ink/40 hover:text-coral hover:bg-coral/10"
                                    title="スケジュールを削除"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            <AddScheduleModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                familyId={familyId}
                members={members}
                initialDate={getTodayDefaultDatetime()}
            />

            <EditScheduleModal
                schedule={selectedSchedule}
                members={members}
                isOpen={selectedSchedule !== null}
                onClose={() => setSelectedSchedule(null)}
            />
        </section>
    );
}