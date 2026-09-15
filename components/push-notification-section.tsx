'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { urlBase64ToUint8Array } from '@/utils/push';
import { savePushSubscription, sendPushNotification } from "@/app/actions/push";
import { toast } from "sonner";

export function PushNotificationSection({ currentUserId }: { currentUserId: string }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleEnablePush = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            toast.error("お使いのブラウザはプッシュ通知をサポートしていません。");
            return;
        }

        setIsLoading(true);

        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                toast.error("通知の許可が拒否されました。");
                setIsLoading(false);
                return;
            }

            const registration = await navigator.serviceWorker.register('/sw.js');
            await navigator.serviceWorker.ready;

            const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!publicVapidKey) {
                throw new Error("VAPIDの公開鍵が設定されていません。");
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
            });

            const subscriptionJSON = subscription.toJSON();

            const result = await savePushSubscription(subscriptionJSON);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("プッシュ通知の登録が完了しました！");
            }
        } catch (error) {
            console.error('Push registration error:', error);
            toast.error("プッシュ通知の登録に失敗しました");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestPush = async () => {
        const result = await sendPushNotification(
            currentUserId,
            "テスト通知タイトル",
            "お疲れ様です！プッシュ通知が届きました🎉"
        );

        if (result.success) {
            toast.success("テスト通知を送信しました！");
        } else {
            toast.error(result.message || "送信に失敗しました");
        }
    };

    return (
        <div className="flex flex-wrap items-center justify-center gap-4 rounded-2xl bg--white/60 p-4 shadow-sm backdrop-blur-sm">
            <Button
                onClick={handleEnablePush}
                disabled={isLoading}
                variant="outline"
            >
                {isLoading ? "設定中..." : "🔔 プッシュ通知を受け取る"}
            </Button>
            <Button
                onClick={handleTestPush}
                variant="secondary"
            >
                📤 テスト通知を送る
            </Button>
        </div>
    );
}