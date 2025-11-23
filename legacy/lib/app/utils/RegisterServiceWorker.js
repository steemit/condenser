'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.default = registerServiceWorker;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function registerServiceWorker() {
    if (!navigator.serviceWorker) return _promise2.default.resolve(false);
    return navigator.serviceWorker.register('/service-worker.js', { scope: '/' }).then(function (registration) {
        navigator.serviceWorker.ready.catch(function (e) {
            return console.error('-- registerServiceWorker error -->', e);
        });
        return navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
            var subscription = serviceWorkerRegistration.pushManager.getSubscription();
            return subscription.then(function (subscription) {
                if (subscription) {
                    return subscription;
                }
                return serviceWorkerRegistration.pushManager.subscribe({
                    userVisibleOnly: true
                });
            });
        });
    }).then(function (subscription) {
        var rawKey = subscription.getKey ? subscription.getKey('p256dh') : '';
        var key = rawKey ? btoa(String.fromCharCode.apply(null, new Uint8Array(rawKey))) : '';
        var rawAuthSecret = subscription.getKey ? subscription.getKey('auth') : '';
        var authSecret = rawAuthSecret ? btoa(String.fromCharCode.apply(null, new Uint8Array(rawAuthSecret))) : '';
        return {
            endpoint: subscription.endpoint,
            keys: {
                p256dh: key,
                auth: authSecret
            }
        };
    });
}