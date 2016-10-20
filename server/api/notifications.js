import koa_router from 'koa-router';
import koa_body from 'koa-body';
import tarantool from 'db/tarantool';

function toResArray(result) {
    if (!result || result.length < 1) return null;
    return result[0].slice(1);
}

export default function useNotificationsApi(app) {
    const router = koa_router({prefix: '/api/v1'});
    app.use(router.routes());

    // get all account's notifications
    router.get('/notifications/:account', function *() {
        const account = this.params.account;
        // TODO: make sure account name matches session
        console.log('-- account -->', account);
        const res = yield tarantool.select('notifications', 0, 1, 0, 'eq', account);
        this.body = toResArray(res);
        return;
    });

    // mark notification as read
    router.put('/notifications/:account/:id', function *() {
        const {account, id} = this.params;
        if (!id || id < 0) {
            body = ''; return;
        }
        console.log('-- account put -->', account, id);
        const res = yield tarantool.call('notification_read', account, id);
        this.body = toResArray(res);
        return;
    });
}
