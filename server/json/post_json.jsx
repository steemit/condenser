import koa_router from 'koa-router';
import React from 'react';
import {routeRegex} from "app/ResolveRoute";
import Apis from 'shared/api_client/ApiInstances'

export default function usePostJson(app) {
    const router = koa_router();
    app.use(router.routes());

    router.get(routeRegex.PostJson, function *() {
        // validate and build post details in JSON
        const segments = this.url.split('/');
        const user_name = segments[1].match(routeRegex.UserNameJson)[0].replace('@', '');
        let user = "";
        let status = "";

        const [chainAccount] = yield Apis.db_api('get_accounts', [user_name]);

        if (chainAccount) {
            user = chainAccount;
            try {
                user.json_metadata = JSON.parse(user.json_metadata);
            } catch (e) {
                user.json_metadata = "";
            }
            status = "200";
        } else {
            user = "No account found";
            status = "404";
        }
        // return response and status code
        this.body = {user, status};
    });
}
