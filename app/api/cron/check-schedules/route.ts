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

    const now = new Date().toISOString();

    const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('status', false)
        .lte('notify_at', now);

    if (error || !notifications) {
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }

    let processedCount = 0;

    for (const notification of notifications || []) {

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

        if (targetUserIds.length > 0) {
            const { data: subscriptions } = await supabase
                .from('push_subscriptions')
                .select('*')
                .in('user_id', targetUserIds);


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
                    } catch (err) {
                        console.error('Push send error:', err);
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