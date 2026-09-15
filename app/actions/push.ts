'use server';

import { createClient } from '@/utils/supabase/server';
import webpush from 'web-push';

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        'mailto:your-email@example.com',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

export async function savePushSubscription(sub: any) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "認証されていません" };
    }

    const data = JSON.parse(JSON.stringify(sub));

    const endpoint = sub?.endpoint;
    const p256dh = sub?.keys?.p256dh;
    const auth = sub?.keys?.auth;

    console.log("安全に再構築した値 -> endpoint:", !!endpoint, "p256dh:", !!p256dh, "auth:", !!auth);

    if (!endpoint || !p256dh || !auth) {
        return { error: "不正なサブスクリプション情報です" };
    }

    const { error } = await supabase
        .from('push_subscriptions')
        .upsert(
            {
                user_id: user.id,
                endpoint: endpoint,
                p256dh: p256dh,
                auth: auth,
            },
            { onConflict: 'user_id, endpoint' }
    );

    if (error) {
        console.error('Push Subscription Save Error:', error);
        return { error: "プッシュ通知の登録に失敗しました" };
    }

    return { success: true };
}

export async function sendPushNotification(userId: string, title: string, body: string) {

    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
        throw new Error("VAPID keys are not configured in environment variables.");
    }

    const supabase = await createClient();

    const { data: subscriptions, error } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', userId);

    if (error || !subscriptions || subscriptions.length === 0) {
        return { success: false, message: "通知の宛先が見つかりませんでした" };
    }

    const payload = JSON.stringify({ title, body });

    const results = await Promise.allSettled(
        subscriptions.map(async (sub) => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth,
                },
            };

            try {
                await webpush.sendNotification(pushSubscription, payload);
                return { success: true };
            } catch (err: any) {
                console.error('Push send error:', err);
                if (err.statusCode === 410 || err.statusCode === 404) {
                    await supabase
                        .from('push_subscriptions')
                        .delete()
                        .eq('id', sub.id);
                }
                throw err;
            }
        })
    );
    return { success: true, results };
}