"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AddMemberDialog } from "./add-member-dialog";
import { UpdateMemberDialog } from "./update-member-dialog";
import { Pencil } from "lucide-react";
import type { Profile } from "@/types/dashboard";

const AVATAR_COLORS: Record<string, string> = {
    mint: "bg-mint",
    sunshine: "bg-sunshine",
    lavender: "bg-lavender",
    peach: "bg-peach",
    babyblue: "bg-babyblue",
};

const ROLE_LABEL: Record<Profile["role"], string> = {
    parent: "おうちの人",
    child: "こども",
};

interface FamilyMemberListProps {
    familyId: string;
    members: Profile[] | null;
    currentUserId: string;
}

export function FamilyMemberList({
    familyId,
    members,
    currentUserId,
}: FamilyMemberListProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Profile | null>(null);

    if (!members || members.length === 0) {
        return (
            <section>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-display text-xl font-bold text-ink">かぞく</h2>
                    <Button
                        onClick={() => setIsDialogOpen(true)}
                        className="bg-sunshine font-display font-bold text-ink hover:bg-sunshine/90"
                    >
                        ＋ 家族（メンバー）を追加する
                    </Button>
                </div>
                <div className="rounded-xl bg-cloud p-6 text-center text-ink/60">
                    家族メンバーがまだ登録されていません。「家族を追加する」ボタンからメンバーを登録してね！
                </div>
                <AddMemberDialog
                    familyId={familyId}
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                />
            </section>
        );
    }

    return (
        <section>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-ink">かぞく</h2>
                <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-sunshine font-display font-bold text-ink hover:bg-sunshine/90"
                >
                    ＋ 家族を追加する
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {members.map((member) => (
                    <Card key={member.id} className="relative border-none bg-cloud shadow-sm">

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedMember(member)}
                            className="absolute right-2 top-2 h-7 text-ink/40 hover:text-ink hover:bg-ink/5"
                            title="メンバーを編集"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </Button>

                    <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                        <div
                            className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-ink ${
                            AVATAR_COLORS[member.avatar_color ?? "mint"] ?? "bg-mint"
                            }`}
                        >
                            {member.full_name?.[0] ?? "？"}
                        </div>
                        <div>
                            <p className="font-display text-sm font-bold text-ink">
                                {member.full_name}
                                {member.id === currentUserId && (
                                    <span className="ml-1 font-body text-xs font-normal text-ink/50">
                                    (あなた)
                                    </span>
                                )}
                            </p>
                            <p className="font-mono text-[11px] uppercase tracking-wide text-ink/50">
                            {ROLE_LABEL[member.role]}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                ))}
            </div>

            <AddMemberDialog
                familyId={familyId}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
            />

            <UpdateMemberDialog
                member={selectedMember}
                open={selectedMember !== null}
                onOpenChange={(open) => !open && setSelectedMember(null)}
            />
        </section>
    );
}
