'use server';

import { createClient } from '@/utils/supabase/server';

export async function signup(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        console.error('Signup Error:', error.message);
        return { error: "アカウントの作成に失敗しました。すでに入力されたメールアドレスが使われている可能性があります。" };
    }

    return { success: true };
}