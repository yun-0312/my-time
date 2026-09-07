import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');

    const next = searchParams.get('next') ?? '/dashboard';

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            const { data: { user } } = await supabase.auth.getUser();

            let nextUrl = next;

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('family_id')
                    .eq('id', user.id)
                    .single();

                console.log("【callbackデバッグ】紐づくプロフィール:", profile);

                if (!profile || !profile.family_id) {
                    nextUrl = '/setup-family';
                }
            }

            const forwardeHost = request.headers.get("x-forwarded-host");
            const isLocalEnv = process.env.NODE_ENV === 'development';

            if (isLocalEnv) {
                //ローカル開発環境の場合
                return NextResponse.redirect(`${origin}${nextUrl}`);
            } else if (forwardeHost) {
                //本番環境の場合
                return NextResponse.redirect(`https://${forwardeHost}${nextUrl}`);
            } else {
                return NextResponse.redirect(`${origin}${nextUrl}`);
            }
        }
    }
    return NextResponse.redirect(`${origin}/login?message=Could not authenticate user`);
}