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
            const forwardeHost = request.headers.get('x-forwarded-host');
            const isLocalEnv = process.env.Node_ENV === 'development';

            if (isLocalEnv) {
                //ローカル開発環境の場合
                return NextResponse.redirect(`${origin}${next}`);
            } else if (forwardeHost) {
                //本番環境の場合
                return NextResponse.redirect(`https://${forwardeHost}${next}`);
            } else {
                return NextResponse.redirect(`${origin}${next}`);
            }
        }
    }
    return NextResponse.redirect(`${origin}/login?message=Could not authenticate user`);
}