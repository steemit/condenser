import koa_router from 'koa-router';
import koa_body from 'koa-body';
import Tarantool from 'db/tarantool';

function toResArray(result) {
    if (!result || result.length < 1) return [];
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
            this.body = toResArray(res);
        } catch (error) {
            console.error('-- /notifications/:account error -->', error.message);
            this.body = [];
        }
        return;
    });

    // mark account's notification as read
    router.put('/notifications/:account/:ids', function *() {
        const {account, ids} = this.params;
        if (!ids) {
            this.body = []; return;
        }
        console.log('-- PUT /notifications/:account/:id -->', account, ids);
        const fields = ids.split('-');
        try {
            let res;
            for(const id of fields) {
                res = yield Tarantool.instance().call('notification_read', account, id);
            }
            this.body = toResArray(res);
        } catch (error) {
            console.error('-- /notifications/:account/:id error -->', error.message);
            this.body = [];
        }
        return;
    });
}
