'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const supabase = await createClient();

    const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error || !authData.user) {
        console.error('Login Error:', error?.message);
        return { error: "ログインに失敗しました。メールアドレスまたはパスワードが間違っています。" };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

    const isParent = profile?.role === 'parent';
    const redirectPath = isParent ? '/dashboard' : '/child/dashboard';

    redirect(redirectPath);
}