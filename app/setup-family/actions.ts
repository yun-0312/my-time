'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function setupFamily(formData: FormData) {
    const familyName = formData.get('familyName') as string;
    const fullName = formData.get('fullName') as string;

    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        return { error: "ログインセッションが切れました。再度ログインして下さい。" };
    }

    // 1. families テーブルに新しい家族グループを作成(SupabaseのRPC（ストアドファンクション）を使ってトランザクション実行)
    const { data: familyId, error: rpcError } = await supabase.rpc('create_family_and_profile', {
        p_family_name: familyName,
        p_user_id: user.id,
        p_full_name: fullName,
    });

    if (rpcError || !familyId) {
        console.error('Transaction Error:', rpcError?.message);
        return { error: "おうちとプロフィールの作成に失敗しました。もう一度お試しください" };
    }

    redirect('/dashboard');
}