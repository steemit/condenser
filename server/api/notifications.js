import koa_router from 'koa-router';
import koa_body from 'koa-body';
import Tarantool from 'db/tarantool';

function toResArray(result) {
    if (!result || result.length < 1) return null;
    return result[0].slice(1);
}

export default function useNotificationsApi(app) {
    const router = koa_router({prefix: '/api/v1'});
    app.use(router.routes());

    // get all notifications for account
    router.get('/notifications/:account', function *() {
        const account = this.params.account;
        // TODO: make sure account name matches session
        console.log('-- GET /notifications/:account -->', account);
        try {
            const res = yield Tarantool.instance().select('notifications', 0, 1, 0, 'eq', account);
            console.log('-- res -->', res);
            this.body = toResArray(res);
        } catch (error) {
            console.error('-- /notifications/:account error -->', error.message);
            this.body = null;
        }
        return;
    });

    // mark account's notification as read
    router.put('/notifications/:account/:id', function *() {
        const {account, id} = this.params;
        if (!id || id < 0) {
            body = null; return;
        }
        console.log('-- PUT /notifications/:account/:id -->', account, id);
        try {
            const res = yield Tarantool.instance().call('notification_read', account, id);
            this.body = toResArray(res);
        } catch (error) {
            console.error('-- /notifications/:account/:id error -->', error.message);
            this.body = null;
        }
        return;
    });
}
