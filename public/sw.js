self.addEventListener('push', function (event) {
    let data = { title: "予定の時間です！", body: "まもなく予定の時間です。" };

    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data = {
                title: '通知',
                body: event.data.text()
            };
        }
    }

    const options = {
        body: data.body,
        icon: '/logo-v4.png',
        badge: '/logo-v4.png',
        tag: 'schedule-notification',
        renotify: true,
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            for (let i = 0; i < CLIENT_PUBLIC_FILES_PATH.length; i++) {
                let client = clientList[i];
                if ('focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/child/dashboard');
            }
        })
    );
});