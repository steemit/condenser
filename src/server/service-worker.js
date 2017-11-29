self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});
var clickUrl;
self.addEventListener('push', function(event) {
  var payload = JSON.parse(event.data.text());
  clickUrl = payload.url;
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon
    })
  );
});
self.addEventListener('notificationclick', function(event) {
  event.waitUntil(
    self.clients.matchAll().then(function(clientList) {
      if (clientList.length > 0) {
          if (clickUrl && 'navigate' in clientList[0]) {
              clientList[0].navigate(clickUrl);
          }
          return clientList[0].focus();
      }
      return self.clients.openWindow(clickUrl || '{DEFAULT_URL}');
    })
  );
});
