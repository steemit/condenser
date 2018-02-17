import koa_router from 'koa-router';
import React from 'react';
import { routeRegex } from 'app/Routes';
import { api } from '@steemit/steem-js';

export default function useUserJson(app) {
    const router = koa_router();
    app.use(router.routes());

    router.get(routeRegex.UserJson, function*() {
        // validate and build user details in JSON
        let user = '';
        let status = '';

        const [chainAccount] = yield api.getAccountsAsync([this.params['0']]);

        if (chainAccount) {
            user = chainAccount;
            try {
                user.json_metadata = JSON.parse(user.json_metadata);
            } catch (e) {
                user.json_metadata = '';
            }
            status = '200';
        } else {
            user = 'No account found';
            status = '404';
        }
        // return response and status code
        this.body = { user, status };
    });
}
