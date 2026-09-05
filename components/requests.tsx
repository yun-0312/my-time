"use client";

import React, { useState } from "react";
import { createRequest } from "@/app/actions/request-actions";
import { toast } from "sonner";
import { Send, Mail } from "lucide-react";

interface Member {
    id: string;
    full_name: string | null;
    role: "parent" | "child";
}

interface RequestFormProps {
    familyId: string;
    members: Member[];
}


export function RequestForm({ familyId, members }: RequestFormProps) {
    const [content, setContent] = useState("");
    const [requestedTo, setRequestedTo] = useState("");
    const [loading, setLoading] = useState(false);

    const parents = members.filter((m) => m.role === "parent");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);
        const formData = new FormData();
        formData.append("content", content);
        if (requestedTo) {
            formData.append("requested_to", requestedTo);
        }

        const result = await createRequest(formData);
        setLoading(false);

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("リクエストを送信しました！");
            setContent("");
            setRequestedTo("");
        }
    };

    return (
        <div className="space-y-3 w-full">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-ink">
                <Mail className="h-5 w-5 text-lavender" />おうちの人におねがいを送る
            </h2>
            <div className="mb-4 flex gap-2">
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full">
                    <select
                        value={requestedTo}
                        onChange={(e) => setRequestedTo(e.target.value)}
                        className="w-full sm:w-auto h-11 rounded-2xl border-none bg-cloud px-4 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-sunshine shadow-sm"
                    >
                        <option value="">おうちの人みんな（指定なし）</option>
                        {parents.map((parent) => (
                            <option key={parent.id} value={parent.id}>
                                {parent.full_name || "おうちの人"}宛て
                            </option>
                        ))}
                    </select>

                    <div className="flex gap-2 flex-1">
                        <input
                            type="text"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="おねがいを入力してね（例： ノート買ってきて！）"
                            className="w-full flex-1 h-11 rounded-2xl border-none bg-cloud px-4 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-sunshine shadow-sm"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !content.trim()}
                            className="h-11 flex items-center justify-center gap-1.5 shrink-0 rounded-2xl bg-sunshine px-5 text-xs font-bold text-ink transition hover:bg-sunshine/80 disabled:opacity-50 whitespace-nowrap shadow-sm"
                        >
                            <Send className="h-4 w-4 " />
                            <span>{loading ? "送信中..." : "送る"}</span>
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}