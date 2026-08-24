import { ReactNode } from "react";
import { DayDial } from "./day-dial";

interface AuthShellProps {
    eyebrow: string;
    title: string;
    description: string;
    children: ReactNode;
    footer?: ReactNode;
}

export function AuthShell({
    eyebrow,
    title,
    description,
    children,
    footer,
    }: AuthShellProps) {
    return (
        <div className="flex min-h-screen bg-sky font-body text-ink">
        {/* イラストパネル */}
        <aside className="hidden flex-col justify-between bg-gradient-to-b from-cloud to-sky p-10 md:flex md:w-1/2 lg:w-2/5 lg:p-14">
            <div className="font-display text-xl font-bold tracking-tight">
            じぶん時間
            </div>

            <div className="flex flex-1 flex-col items-center justify-center gap-8 py-10">
            <DayDial currentHour={new Date().getHours()} />
            <p className="max-w-[22rem] text-center text-sm leading-relaxed text-ink/70">
                あさ・まなぶ・あそぶ・やすむ。じぶんの1日を、じぶんの色でぬろう。
            </p>
            </div>

            <p className="text-xs text-ink/50">
            © {new Date().getFullYear()} じぶん時間
            </p>
        </aside>

        {/* フォームパネル */}
        <main className="flex flex-1 items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-sm">
            <div className="mb-8 font-display text-lg font-bold text-ink md:hidden">
                じぶん時間
            </div>

            <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-mint">
                {eyebrow}
            </p>
            <h1 className="mb-2 font-display text-3xl font-bold text-ink">
                {title}
            </h1>
            <p className="mb-8 text-sm text-ink/60">{description}</p>

            {children}

            <div className="mt-8 text-center text-sm text-ink/60">{footer}</div>
            </div>
        </main>
        </div>
    );
}
