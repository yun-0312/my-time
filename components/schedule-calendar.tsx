"use client";

import { useState, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import jaLocale from "@fullcalendar/core/locales/ja";
import type { EventInput, EventClickArg, DateSelectArg } from "@fullcalendar/core";
import type { Schedule, Profile } from "@/types/dashboard";
import { AddScheduleModal } from "./add-schedule-modal";
import { getHexColor } from "@/utils/thema";
import { EditScheduleModal } from "./edit-schedule-modal";
import type { Task } from "@/types/dashboard";


interface ScheduleCalendarProps {
    familyId: string;
    members: Profile[];
    schedules: Schedule[];
    tasks: Task[];
    currentUserId: string;
}

export function ScheduleCalendar({ familyId, members, schedules, tasks, currentUserId }: ScheduleCalendarProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

    const memberMap = useMemo(() => {
        return new Map(members.map((m) => [m.id, m]));
    }, [members]);

    const calendarEvents: EventInput[] = schedules.map((schedule) => {
        const member = schedule.target_user_id ? memberMap.get(schedule.target_user_id) : null;

        const rawColor = member?.avatar_color;
        const bgColor = getHexColor(rawColor);

        return {
            id: String(schedule.id),
            title: schedule.title,
            start: schedule.start_at,
            end: schedule.end_at ?? undefined,
            backgroundColor: bgColor,
            borderColor: bgColor,
            textColor: "#1E293B",
            className: "rounded-md px-1 font-medium text-xs transition-opacity hover:opacity-80",
        };

    })

    function handleDateSelect(selectInfo: DateSelectArg) {
        setSelectedDate(selectInfo.startStr);
        setIsAddModalOpen(true);
    }

    function handleEventClick(clickInfo: EventClickArg) {
        const clickedScheduleId = clickInfo.event.id;
        const targetSchedule = schedules.find((s) => String(s.id) === clickedScheduleId);

        if (targetSchedule) {
            setSelectedSchedule(targetSchedule);
        }
    }

    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-ink/10">
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale={jaLocale}
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                height="auto"
                events={calendarEvents}
                selectable={true}
                select={handleDateSelect}
                eventClick={handleEventClick}
            />

            {/* 新規作成モーダル */}
            <AddScheduleModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                familyId={familyId}
                members={members}
                initialDate={selectedDate}
            />

            {/* 編集・削除用モーダル */}
            <EditScheduleModal
                schedule={selectedSchedule}
                members={members}
                isOpen={selectedSchedule !== null}
                onClose={() => setSelectedSchedule(null)}
                tasks={tasks}
                currentUserId={currentUserId}
            />
        </div>
    );
}