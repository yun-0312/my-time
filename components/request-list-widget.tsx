"use client";

import { useState } from "react";
import { updateRequestStatus } from "@/app/actions/request-actions";
import { toast } from "sonner";
import { Check, X, Mail } from "lucide-react";

interface ProfileRelation {
    full_name: string | null;
}

interface RequestItem {
    id: number;
    content: string;
    status: string;
    created_at: string;
    requested_by_profile: ProfileRelation | ProfileRelation[] | null;
    requested_to_profile: ProfileRelation | ProfileRelation[] | null;
}

interface RequestListWidgetProps {
    requests: RequestItem[];
}

export function RequestListWidget({ requests }: RequestListWidgetProps) {
    const [loadingId, setLoadingId] = useState<number | null>(null);

    const pendingRequests = requests.filter((r) => r.status === "pending");

    const handleAction = async (id: number, status: "approved" | "rejected") => {
        setLoadingId(id);
        const result = await updateRequestStatus(id, status);
        setLoadingId(null);

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success(status === "approved" ? "リクエストを承認しました！" : "リクエストを却下しました。");
        }
    };

    if (pendingRequests.length === 0) {
        return (
            <div className="rounded-3xl bg-shine/60 p-6 backdrop-blur-md border border-ink/5 space-y-3">
                <h2 className="font-display text-lg font-bold text-ink">おねがい・リクエスト</h2>
                <p className="text-xs text-ink/60">現在、未対応のリクエストはありません。</p>
            </div>
        );
    }

    return (
        <div className="rounded-3xl bg-white/60 p-6 backdrop-blur-md border border-ink/5 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                    <Mail className="h-5 w-5 text-lavender" />
                    <span>おねがい・リクエスト</span>
                </h2>
                <span className="rounded-full bg-sunshine/30 px-2.5 py-0.5 text-xs font-bold text-ink">
                    未対応 {pendingRequests.length}件
                </span>
            </div>

            <div className="space-y-3">
                {pendingRequests.map((req) => (
                    <div
                        key={req.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl bg-white p-4 border border-ink/5 shadow-xs"
                    >
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="rounded-lg bg-sky/60 px-2 py-0.5 text-[10px] font-bold text-ink">
                                    {(Array.isArray(req.requested_by_profile)
                                        ? req.requested_by_profile[0]?.full_name
                                        : req.requested_by_profile?.full_name) || "子ども"} さんから
                                </span>
                            宛先: {(Array.isArray(req.requested_to_profile)
                                ? req.requested_to_profile[0]?.full_name
                                : req.requested_to_profile?.full_name) || "おうちの人"}
                            </div>
                            <p className="text-sm font-bold text-ink">{req.content}</p>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <button
                                onClick={() => handleAction(req.id, "approved")}
                                disabled={loadingId === req.id}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-1 rounded-xl bg-mint/20 px-3.5 py-2 text-xs font-bold text-mint transition hover:bg-mint/30 disabled:opacity-50"
                            >
                                <Check className="h-4 w-4" />
                                <span>承認する</span>
                            </button>
                            <button
                                onClick={() => handleAction(req.id, "rejected")}
                                disabled={loadingId === req.id}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-1 rounded-xl bg-coral/10 px-3.5 py-2 text-xs font-bold text-coral transition hover:bg-coral/20 disabled:opacity-50"
                            >
                                <X className="h-4 w-4" />
                                <span>却下</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
