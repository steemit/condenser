import koa_router from 'koa-router';
import React from 'react';
import {routeRegex} from "app/ResolveRoute";
import {api} from 'golos-js';

export default function usePostJson(app) {
    const router = koa_router();
    app.use(router.routes());

    router.get(routeRegex.PostJson, function *() {
        // validate and build post details in JSON
        const author = this.url.match(/(\@[\w\d\.-]+)/)[0].replace('@', '');
        const permalink = this.url.match(/(\@[\w\d\.-]+)\/?([\w\d-]+)/)[2];
        let status = "";
        let post = yield api.getContentAsync(author, permalink);

        if (post.author) {
            status = "200";
            // try parse for post metadata
            try {
                post.json_metadata = JSON.parse(post.json_metadata);
            } catch(e) {
                post.json_metadata = "";
            }
        } else {
            post = "No post found";
            status = "404";
        }
        // return response and status code
        this.body = {post, status};
    });
}
