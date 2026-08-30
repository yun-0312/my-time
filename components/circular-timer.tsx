"use client";

import React, { useEffect, useRef, useState } from "react";

interface CircularTimerProps {
    targetDate?: string; // 目的の時刻（ISO文字列など、スケジュール開始時間など）
    onComplete?: () => void;
    onTick?: (remainingSeconds: number) => void;
    size?: number; // タイマーの直径（px）
    isChildView?: boolean;
}

export function CircularTimer({
    targetDate,
    onComplete,
    onTick,
    size = 180,
    isChildView = false,
}: CircularTimerProps) {
    const [timeLeft, setTimeLeft] = useState<number>(0); // 残り秒数
    const [totalTime, setTotalTime] = useState<number>(1); // 全体の秒数（プログレスバー計算用）
    const hasCompletedRef = useRef(false);

    // タイマーの初期化
    useEffect(() => {
        if (!targetDate) {
            setTimeLeft(0);
            setTotalTime(1);
            return;
        }

        const targetTime = new Date(targetDate).getTime();
        const initialSeconds = Math.max(
            0,
            Math.floor((targetTime - Date.now()) / 1000)
        );
        hasCompletedRef.current = false;

        setTimeLeft(initialSeconds);
        setTotalTime(initialSeconds > 0 ? initialSeconds : 1);
    }, [targetDate]);

    // カウントダウン
    useEffect(() => {
        if (timeLeft <= 0) {
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    useEffect(() => {
        if (timeLeft > 0) {
            onTick?.(timeLeft);
        }
    }, [timeLeft, onTick]);

    // 完了処理
    useEffect(() => {
        if (
            timeLeft === 0 &&
            totalTime > 1 &&
            !hasCompletedRef.current
        ) {
            hasCompletedRef.current = true;
            onComplete?.();
        }
    }, [timeLeft, totalTime, onComplete]);

    // 時間・分・秒のフォーマット
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    const formattedTime = hours > 0
        ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
        : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    // SVG円形プログレスバーの計算
    const strokeWidth = isChildView ? 14 : 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = totalTime > 0 ? timeLeft / totalTime : 0;
    const strokeDashoffset = circumference * (1 - progress);

    // 残り時間に応じたカラー変化（子ども用はよりダイナミックに！）
    let progressColor = "#5FCFA0";
    let isUrgent = false;

    if (progress < 0.2) {
        progressColor = "#FF6B5D";
        isUrgent = true;
    } else if (progress < 0.5) {
        progressColor = "#FFB84D";
    }

    return (
        <div
            className={`relative flex flex-col items-center justify-center rounded-full transition-all duration-500 ${
                isUrgent ? "animate-pulse bg-coral/10" : ""
            }`}
            style={{ width: size, height: size }}
        >
            {/* SVG円形プログレスバー */}
            <svg className="absolute -rotate-95" width={size} height={size}>
                {/* 背景の薄い円 */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    className="stroke-ink/10"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                {/* 減っていくプログレス円 */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    style={{ stroke: progressColor }}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                />
            </svg>

            {/* 真ん中のデジタル表示 */}
            <div className="z-10 flex flex-col items-center justify-center text-center">
                <span className={`font-mono font-bold tracking-tight ${isChildView ? "text-2xl" : "text-xl"} text-ink`}>
                    {timeLeft > 0 ? formattedTime : "時間だよ！"}
                </span>
                {isChildView && timeLeft > 0 && (
                    <span className="text-[10px] text-ink/50 uppercase tracking-widest font-semibold mt-0.5">
                        残り時間
                    </span>
                )}
            </div>
        </div>
    );
}