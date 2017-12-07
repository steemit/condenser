import koa_router from 'koa-router';
import React from 'react';
import { routeRegex } from 'app/Routes';
import { api } from '@steemit/steem-js';

export default function usePostJson(app) {
    const router = koa_router();
    app.use(router.routes());

    router.get(routeRegex.PostJson, function*() {
        // validate and build post details in JSON
        let status = '';
        let post = yield api.getContentAsync(
            this.params['0'],
            this.params['1']
        );

        if (post.author) {
            status = '200';
            // try parse for post metadata
            try {
                post.json_metadata = JSON.parse(post.json_metadata);
            } catch (e) {
                post.json_metadata = '';
            }
        } else {
            post = 'No post found';
            status = '404';
        }
        // return response and status code
        this.body = { post, status };
    });
}
