import config from '../config';
import webPush from 'web-push';
import Tarantool from '../db/tarantool';

webPush.setGCMAPIKey(config.gcm_key);

function notify(account, nparams, title, body, url, pic) {
     var payload = JSON.stringify({
        title,
        body,
        url,
        icon: pic || 'https://steemit.com/favicon.ico'
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
                    console.error('-- error in notify -->', account, err);
                }
            }
        }
        // console.log('-- run.run -->', queue);
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

