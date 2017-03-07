import config from 'config';
import webPush from 'web-push';
import Tarantool from '../db/tarantool';

webPush.setGCMAPIKey(config.get('notify.gcm_key'));

function notify(account, nparams, title, body, url, pic) {
    if (!nparams.keys || !nparams.keys.auth) return Promise.resolve(false);
     var payload = JSON.stringify({
        title,
        body,
        url,
        icon: pic || 'https://steemit.com/favicon.ico'  //FIXME domain name from config
    });
    return new Promise((resolve, reject) => {
        webPush.sendNotification(nparams, payload).then(function() {
            resolve(account);
        }, function(err) {
            reject(err);
        });
    });
}

async function process_queue() {
    try {
        const queue = await Tarantool.instance().call('webpush_get_delivery_queue');
        console.log('processing web push notifications queue, length: ', queue.length);
        for (const n of queue) {
            if (n.length === 0) return;
            const [account, nparams_array, title, body, url, pic] = n;
            console.log('notification: ', account, body, url, pic);
            for (const nparams of nparams_array) {
                try {
                    await notify(account, nparams, title, body, url, pic);
                } catch (err) {
                    console.error('-- error in notify -->', account, nparams, err);
                    if (err.statusCode && err.statusCode == 410) {
                        await Tarantool.instance().call('webpush_unsubscribe', account, nparams.keys.auth);
                    }
                }
            }
        }
    } catch (error) {
        console.error('-- process_queue error -->', error);
    }
}

function run() {
    process_queue().then(() => {
       setTimeout(run, 30000);
    });
}

run();
