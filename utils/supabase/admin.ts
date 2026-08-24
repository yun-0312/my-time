import { createClient } from '@supabase/supabase-js';

// 注意: このクライアントは絶対にブラウザ（Client Component）側で使ってはいけません（秘密のキーが漏れるため）
export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            }
        }
    );
}