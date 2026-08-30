"use client";

import React, { useEffect, useState, useTransition, useRef } from "react";
import { CircularTimer } from "@/components/circular-timer";
import { getNextSchedule } from "@/app/actions/schedule-actions";
import { getTasksByScheduleId, toggleTaskCompletion } from "@/app/actions/task-actions";
import type { Schedule, Task } from "@/types/dashboard";
import { Clock, CheckCircle2, Circle, Sparkles, Play } from "lucide-react";

interface NextScheduleTimerWidgetProps {
    familyId: string;
    currentUserId?: string;
    isChildView?: boolean;
}

export function NextScheduleTimerWidget({
    familyId,
    currentUserId,
    isChildView = false,
}: NextScheduleTimerWidgetProps) {
    const [nextSchedule, setNextSchedule] = useState<Schedule | null>(null);
    const [scheduleTasks, setScheduleTasks] = useState<Task[]>([]);
    const [manualTargetDate, setManualTargetDate] = useState<string | null>(null);
    const [bannerMessage, setBannerMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [_, startTransition] = useTransition();

    const audioCtxRef = useRef<AudioContext | null>(null);

    // ページ内が最初にクリックされたときにAudioContextをレジュームする設定
    useEffect(() => {
        const initAudio = () => {
            if (!audioCtxRef.current) {
                const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
                if (AudioContextClass) {
                    audioCtxRef.current = new AudioContextClass();
                }
            }
            if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
                audioCtxRef.current.resume();
            }
        };

        const handleUserGesture = () => {
            initAudio();
            window.removeEventListener("click", handleUserGesture);
            window.removeEventListener("touchstart", handleUserGesture);
        };

        window.addEventListener("click", handleUserGesture);
        window.addEventListener("touchstart", handleUserGesture);

        return () => {
            window.removeEventListener("click", handleUserGesture);
            window.removeEventListener("touchstart", handleUserGesture);
            if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
                audioCtxRef.current.close();
            }
        };
    }, []);

    const playSound = (type: "start" | "countdown" | "complete") => {
        try {
            if (!audioCtxRef.current) {
                const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
                if (AudioContextClass) {
                    audioCtxRef.current = new AudioContextClass();
                }
            }

            const audioCtx = audioCtxRef.current;
            if (!audioCtx) return;

            if (audioCtx.state === "suspended") {
                audioCtx.resume();
            }

            if (type === "start") {
                const notes = [523.25, 659.25, 783.99, 1046.5];

                notes.forEach((freq, index) => {
                    const delay = index * 0.7;
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = "square";
                    osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);

                    gain.gain.setValueAtTime(0.15, audioCtx.currentTime + delay);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + 0.6);

                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start(audioCtx.currentTime + delay);
                    osc.stop(audioCtx.currentTime + delay + 0.6);
                });
            } else if (type === "countdown") {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = "square";
                osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
                gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(audioCtx.currentTime);
                osc.stop(audioCtx.currentTime + 0.1);
            } else {
                [0, 0.12, 0.24].forEach((delay, index) => {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = "square";
                    const freqs = [523.25, 659.25, 783.99];
                    osc.frequency.setValueAtTime(freqs[index], audioCtx.currentTime + delay);
                    gain.gain.setValueAtTime(0.12, audioCtx.currentTime + delay);
                    gain.gain.exponentialRampToValueAtTime(
                        0.001,
                        audioCtx.currentTime + delay + 0.2,
                    );
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start(audioCtx.currentTime + delay);
                    osc.stop(audioCtx.currentTime + delay + 0.2);
                });
            }
        } catch (e) {
            console.error("音声の再生に失敗しました", e);
        }
    };

    const handleStartManualTimer = (minutes: number) => {
        playSound("start");
        const targetTime = new Date(Date.now() + minutes * 60 * 1000).toISOString();
        setManualTargetDate(targetTime);
    };

    const handleTick = (remainingSeconds: number) => {
        let newMessage: string | null = null;

        if (remainingSeconds <= 3600 && remainingSeconds > 3590) {
            newMessage = "あと1時間で出発だよ！準備しよう！";
        } else if (remainingSeconds <= 1800 && remainingSeconds > 1790) {
            newMessage = "あと30分だよ！そろそろ支度してね！";
        } else if (remainingSeconds <= 600 && remainingSeconds > 590) {
            newMessage = "あと10分だよ！いそごう！";
        } else if (remainingSeconds <= 10 && remainingSeconds > 0) {
            playSound("countdown");
        }

        // 変更がある場合のみ安全にセット
        if (newMessage) {
            setBannerMessage((prev) => (prev !== newMessage ? newMessage : prev));
        }
    };

    useEffect(() => {
        async function fetchNextData() {
            try {
                const schedule = await getNextSchedule(familyId, currentUserId);
                setNextSchedule(schedule);

                if (schedule) {
                    const tasks = await getTasksByScheduleId(schedule.id);
                    setScheduleTasks(tasks || []);
                } else {
                    setScheduleTasks([]);
                }
            } catch (e) {
                console.error("スケジュールの取得に失敗しました", e);
            } finally {
                setIsLoading(false);
            }
        }
        fetchNextData();

        const interval = setInterval(fetchNextData, 60000);
        return () => clearInterval(interval);
    }, [familyId, currentUserId]);

    const handleToggleTask = (taskId: string, currentCompleted: boolean) => {
        startTransition(async () => {
            setScheduleTasks((prev) =>
                prev.map((t) => (t.id === taskId ? { ...t, is_completed: !currentCompleted } : t))
            );
            await toggleTaskCompletion(taskId, !currentCompleted);
        });
    };

    if (isLoading) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center justify-center h-48 animate-pulse">
                <span className="text-sm text-ink/40 font-mono">タイマーを準備中...</span>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-2xl p-6 shadow-sm border border-ink/5 flex flex-col items-center justify-center relative overflow-hidden ${isChildView ? "border-2 border-mint/40 bg-sky/30" : ""}`}>

            {/* バナー通知エリア */}
            {bannerMessage && (
                <div className="absolute top-2 inset-x-2 z-20 bg-sunshine text-ink px-3 py-2 rounded-xl text-xs font-bold shadow-md flex items-center justify-between animate-bounce">
                    <span>⚠️ {bannerMessage}</span>
                    <button
                        onClick={() => setBannerMessage(null)}
                        className="text-ink/60 hover:text-ink text-[10px] ml-2 px-1 bg-white/50 rounded"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* ヘッダータイトル */}
            <div className="flex items-center gap-2 mb-4">
                <Clock className={`h-4 w-4 ${isChildView ? "text-mint animate-bounce" : "text-ink/60"}`} />
                <span className="font-display text-xs font-bold uppercase tracking-widest text-ink/60">
                    {manualTargetDate !== null ? "集中タイマー発動中！" : nextSchedule ? "次の予定まで" : "予定はありません"}
                </span>
            </div>

            {/* メインの円形タイマー */}
            <div className="my-2">
                {manualTargetDate !== null ? (
                    <CircularTimer
                        targetDate={manualTargetDate || nextSchedule?.start_at}
                        size={isChildView ? 160 : 140}
                        isChildView={isChildView}
                        onTick={handleTick}
                        onComplete={() => {
                            playSound("complete");
                            setManualTargetDate(null);
                        }}
                    />
                ) : nextSchedule ? (
                    <CircularTimer
                        targetDate={nextSchedule.start_at}
                        size={isChildView ? 160 : 140}
                        isChildView={isChildView}
                        onTick={handleTick}
                        onComplete={() => {
                            playSound("complete");
                            async function refreshNext() {
                                const schedule = await getNextSchedule(familyId, currentUserId);
                                setNextSchedule(schedule);
                            }
                            refreshNext();
                        }}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-[140px] text-center px-4">
                        <Sparkles className="h-8 w-8 text-sunshine mb-2" />
                        <p className="text-xs font-medium text-ink/70">
                            今のところ予定はないよ！自由時間です✨
                        </p>
                    </div>
                )}
            </div>

            {/* 予定のタイトル表示 */}
            {nextSchedule && manualTargetDate === null && (
                <div className="mt-3 text-center">
                    <span className="inline-block bg-mint/10 text-mint px-3 py-1 rounded-full text-xs font-bold truncate max-w-[240px]">
                        {nextSchedule.title}
                    </span>
                </div>
            )}

            {/* スケジュールに紐づくタスクリスト */}
            {nextSchedule && manualTargetDate === null && scheduleTasks.length > 0 && (
                <div className="mt-4 w-full bg-sky/40 rounded-xl p-3 border border-ink/5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink/50 mb-2">
                        出発・開始までにやること ({scheduleTasks.filter(t => t.is_completed).length}/{scheduleTasks.length})
                    </p>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                        {scheduleTasks.map((task) => (
                            <div
                                key={task.id}
                                onClick={() => handleToggleTask(task.id, task.is_completed)}
                                className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium cursor-pointer transition ${
                                    task.is_completed ? "bg-white/50 text-ink/40 line-through" : "bg-white text-ink hover:bg-mint/10"
                                }`}
                            >
                                {task.is_completed ? (
                                    <CheckCircle2 className="h-4 w-4 text-mint shrink-0" />
                                ) : (
                                    <Circle className="h-4 w-4 text-ink/35 shrink-0" />
                                )}
                                <span className="truncate">{task.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 手動タイマー起動ボタン */}
            <div className="mt-4 pt-3 border-t border-ink/10 w-full flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink/40">
                    今すぐ集中タイマーを起動
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleStartManualTimer(15)}
                        className="px-3 py-1.5 bg-sky text-ink rounded-xl text-xs font-bold hover:bg-mint/20 transition flex items-center gap-1"
                    >
                        <Play className="h-3 w-3 fill-ink" /> 15分
                    </button>
                    <button
                        onClick={() => handleStartManualTimer(30)}
                        className="px-3 py-1.5 bg-sky text-ink rounded-xl text-xs font-bold hover:bg-mint/20 transition flex items-center gap-1"
                    >
                        <Play className="h-3 w-3 fill-ink" /> 30分
                    </button>
                    <button
                        onClick={() => handleStartManualTimer(60)}
                        className="px-3 py-1.5 bg-sky text-ink rounded-xl text-xs font-bold hover:bg-mint/20 transition flex items-center gap-1"
                    >
                        <Play className="h-3 w-3 fill-ink" /> 60分
                    </button>
                </div>
            </div>

            {/* 手動タイマーリセット */}
            {manualTargetDate !== null && (
                <button
                    onClick={() => setManualTargetDate(null)}
                    className="mt-4 text-[10px] text-coral underline font-bold"
                >
                    タイマーを解除する
                </button>
            )}
        </div>
    );
}