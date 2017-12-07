export default function registerServiceWorker() {
    if (!navigator.serviceWorker) return Promise.resolve(false);
    return navigator.serviceWorker
        .register('/service-worker.js', { scope: '/' })
        .then(function(registration) {
            navigator.serviceWorker.ready.catch(e =>
                console.error('-- registerServiceWorker error -->', e)
            );
            return navigator.serviceWorker.ready.then(function(
                serviceWorkerRegistration
            ) {
                let subscription = serviceWorkerRegistration.pushManager.getSubscription();
                return subscription.then(function(subscription) {
                    if (subscription) {
                        return subscription;
                    }
                    return serviceWorkerRegistration.pushManager.subscribe({
                        userVisibleOnly: true,
                    });
                });
            });
        })
        .then(function(subscription) {
            const rawKey = subscription.getKey
                ? subscription.getKey('p256dh')
                : '';
            const key = rawKey
                ? btoa(String.fromCharCode.apply(null, new Uint8Array(rawKey)))
                : '';
            const rawAuthSecret = subscription.getKey
                ? subscription.getKey('auth')
                : '';
            const authSecret = rawAuthSecret
                ? btoa(
                      String.fromCharCode.apply(
                          null,
                          new Uint8Array(rawAuthSecret)
                      )
                  )
                : '';
            return {
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: key,
                    auth: authSecret,
                },
            };
        });
}
