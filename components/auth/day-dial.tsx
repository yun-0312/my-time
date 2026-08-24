"use client";

/**
 * 「デイダイヤル」
 * 1日を4つの時間帯に色分けした円形イラスト。
 * ログイン/新規登録画面の共通ブランド要素として使用する。
 */

interface DayDialProps {
  /** 0-23の現在時刻。指定すると針を表示する */
    currentHour?: number;
}

const SEGMENTS = [
    { label: "あさ", start: 6, end: 9, color: "hsl(var(--color-mint))" },
    { label: "まなぶ", start: 9, end: 15, color: "hsl(var(--color-sunshine))" },
    { label: "あそぶ", start: 15, end: 19, color: "hsl(var(--color-lavender))" },
    { label: "やすむ", start: 19, end: 6, color: "hsl(220 30% 88%)" },
];

function hourToDeg(hour: number) {
  return (hour / 24) * 360;
}

export function DayDial({ currentHour }: DayDialProps) {
    const gradientStops = SEGMENTS.flatMap((seg) => {
        const startDeg = hourToDeg(seg.start);
        const endDeg = seg.end > seg.start ? hourToDeg(seg.end) : 360;
        return [`${seg.color} ${startDeg}deg`, `${seg.color} ${endDeg}deg`];
    }).join(", ");

    const handDeg =
        currentHour !== undefined ? hourToDeg(currentHour) : undefined;

    return (
        <div className="relative mx-auto w-full max-w-xs select-none">
        <div className="relative aspect-square">
            {/* 外周：時間帯ごとの色分け */}
            <div
            className="absolute inset-0 rounded-full shadow-[0_12px_32px_-8px_hsl(var(--color-ink)/0.35)]"
            style={{ background: `conic-gradient(${gradientStops})` }}
            />

            {/* 針（現在時刻を指す） */}
            {handDeg !== undefined && (
            <div
                className="absolute inset-0 flex items-center justify-center motion-safe:transition-transform motion-safe:duration-1000"
                style={{ transform: `rotate(${handDeg}deg)` }}
            >
                <div className="h-[38%] w-1.5 -translate-y-[19%] rounded-full bg-ink/80" />
            </div>
            )}

            {/* 中心の顔 */}
            <div className="absolute inset-[16%] flex flex-col items-center justify-center rounded-full bg-cloud shadow-inner">
            <span className="font-display text-3xl font-bold text-ink">◕‿◕</span>
            <span className="mt-1 font-mono text-xs text-ink/60">
                {currentHour !== undefined
                ? `${String(currentHour).padStart(2, "0")}:00`
                : "きょうの じかん"}
            </span>
            </div>
        </div>

        {/* 凡例 */}
        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 font-body text-sm text-ink/80">
            {SEGMENTS.map((seg) => (
            <li key={seg.label} className="flex items-center gap-2">
                <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: seg.color }}
                />
                {seg.label}
            </li>
            ))}
        </ul>
        </div>
    );
}
