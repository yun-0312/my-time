import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        'mailto:your-email@example.com',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    // Supabaseから「未通知かつ時間が来たスケジュール」を検索する処理
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('VAPID CHECK:', {
  hasPublic: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  hasPrivate: !!process.env.VAPID_PRIVATE_KEY,
  privateKeyLength: process.env.VAPID_PRIVATE_KEY?.length
});

    const now = new Date().toISOString();
    console.log("【デバッグ】現在時刻（比較用）:", now);

    const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('status', false)
        .lte('notify_at', now);

    if (error || !notifications) {
        console.error("【デバッグ】notifications取得エラー:", error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }

    console.log(`【デバッグ】条件に合致した未通知データ数: ${notifications?.length || 0}`);
    let processedCount = 0;

    for (const notification of notifications || []) {
        console.log(`【デバッグ】通知ID ${notification.id} の処理を開始します`, notification);

        let targetTitle = 'まもなくの予定があります';
        let scheduleTargetUserId: string | null = null;

        if (notification.target_type === 'schedule') {
            const { data: schedule } = await supabase
                .from('schedules')
                .select('title, target_user_id')
                .eq('id', notification.target_id)
                .single();

            if (schedule) {
                targetTitle = `予定：${schedule.title}`;
                scheduleTargetUserId = schedule.target_user_id;
            }
        }
        // } else if (notification.target_type === 'task') {
        //     const { data: task } = await supabase
        //         .from('tasks')
        //         .select('title')
        //         .eq('id', notification.target_id)
        //         .single();

        //     if (task) {
        //         targetTitle = `タスク：${task.title}`;
        //     }
        // }

        let targetUserIds: string[] = [];

        if (scheduleTargetUserId) {
            const { data: familyMembers } = await supabase
                .from('profiles')
                .select('id, role')
                .eq('family_id', notification.family_id);

            if (familyMembers) {
                targetUserIds = familyMembers
                    .filter(member => member.id === scheduleTargetUserId || member.role === 'parent')
                    .map(member => member.id);
            }
        } else {
            const { data: familyMembers } = await supabase
                .from('profiles')
                .select('id')
                .eq('family_id', notification.family_id);

            if (familyMembers) {
                targetUserIds = familyMembers.map(member => member.id);
            }
        }

        targetUserIds = Array.from(new Set(targetUserIds));
        console.log(`【デバッグ】通知を送信する対象のユーザーIDs:`, targetUserIds);

        if (targetUserIds.length > 0) {
            const { data: subscriptions } = await supabase
                .from('push_subscriptions')
                .select('*')
                .in('user_id', targetUserIds);

            console.log(`【デバッグ】取得できたプッシュ購読数: ${subscriptions?.length || 0}`);

            if (subscriptions && subscriptions.length > 0) {
                const payload = JSON.stringify({
                    title: '予定の時間です！',
                    body: `${targetTitle}の時間まで約30分です。`,
                });

                for (const sub of subscriptions) {
                    const pushSubscription = {
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: sub.p256dh,
                            auth: sub.auth,
                        },
                    };

                    try {
                        await webpush.sendNotification(pushSubscription, payload);
                        console.log(`【デバッグ】プッシュ通知送信成功: endpoint = ${sub.endpoint.slice(0, 30)}...`);
                    } catch (err) {
                        // console.error('Push send error:', err);
                        console.error("【デバッグ】Push send error:", err);
                    }
                }
            }
        }


        await supabase
            .from('notifications')
            .update({
                status: true,
                sent_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', notification.id);

        processedCount++;
    }
    return NextResponse.json({ success: true, processed: processedCount });
}