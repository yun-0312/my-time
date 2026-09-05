interface RequestItem {
    id: number;
    content: string;
    status: string;
    created_at: string;
}

interface RequestHistoryListProps {
    requests: RequestItem[];
}

export function RequestHistoryList({ requests }: RequestHistoryListProps) {
    if (requests.length === 0) return null;

    return (
        <div className="rounded-3xl bg-white/60 p-4 backdrop-blur-md border border-ink/5 space-y-3 w-full">
            <h3 className="text-xs font-bold text-ink/70">送ったおねがい</h3>
            <div className="space-y-2">
                {requests.map((req) => (
                    <div
                        key={req.id}
                        className="flex items-center justify-between rounded-xl bg-white/80 p-3 border border-ink/5 text-sm"
                    >
                        <span className="text-ink font-medium truncate flex-1">{req.content}</span>
                        <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                req.status === "approved"
                                    ? "bg-mint/20 text-mint"
                                    : req.status === "rejected"
                                    ? "bg-coral/10 text-coral"
                                    : "bg-sunshine/30 text-ink"
                                }`}
                        >
                            {req.status === "approved" ? "承認済み" : req.status === "rejected" ? "却下" : "確認中"}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}