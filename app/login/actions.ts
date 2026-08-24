'use server';

import { createClient } from '@/utils/supabase/server';

export async function login(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error('Login Error:', error.message);
        return { error: "ログインに失敗しました。メールアドレスまたはパスワードが間違っています。" };
    }

    return { success: true };
}