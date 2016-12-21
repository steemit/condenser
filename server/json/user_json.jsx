import koa_router from 'koa-router';
import React from 'react';
import {routeRegex} from "app/ResolveRoute";
import Apis from 'shared/api_client/ApiInstances'

export default function useUserJson(app) {
    const router = koa_router();
    app.use(router.routes());

    router.get(routeRegex.UserJson, function *() {
        // validate and build user details in JSON
        const segments = this.url.split('/');
        const user_name = segments[1].replace('@','');
        let user = "";
        let status = "";

        const [chainAccount] = yield Apis.db_api('get_accounts', [user_name]);

        if(chainAccount) {
            user = chainAccount;
            status = "200";
        } else {
            user = "No account found";
            status = "404";
        }
        // return response and status code
        this.body = {user, status};
    });

}
