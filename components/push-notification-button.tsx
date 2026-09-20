'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { urlBase64ToUint8Array } from '@/utils/push';
import { savePushSubscription } from '@/app/actions/push';
import { toast } from "sonner";

export function PushNotificationButton() {
    const [isLoading, setIsLoading] = useState(false);

    const handleEnablePush = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            toast.error('お使いのブラウザはプッシュ通知をサポートしていません。');
            return;
        }

        setIsLoading(true);

        try {
            // 1. ブラウザに通知の許可を求める
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                toast.error("通知の許可が拒否されました。ブラウザの設定から許可してください。");
                setIsLoading(false);
                return;
            }

            // 2. Service Workerを登録する
            const registration = await navigator.serviceWorker.register('/sw.js');
            await navigator.serviceWorker.ready;

            // 3. プッシュマネージャーからサブスクリプション（宛先）を取得する
            const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!publicVapidKey) {
                throw new Error("VAPIDの公開鍵が設定されていません。");
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
            });

            // 4. サーバーに送信してDBに保存する
            const result = await savePushSubscription(subscription.toJSON());
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("プッシュ通知の登録が完了しました！");
            }
        } catch (error) {
            console.error('Push registration error:', error);
            toast.error("プッシュ通知の登録に失敗しました。");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleEnablePush}
            disabled={isLoading}
            variant="outline"
        >
            {isLoading ? "設定中..." : "プッシュ通知を受け取る"}
        </Button>
    );
}