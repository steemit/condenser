import koa_router from 'koa-router';

const redirects = [
    // example: [/\/about(\d+)-(.+)/, '/about?$0:$1', 302],
    [/^\/about.html$/, '/s/about'],
    [/^\/welcome$/, '/s/welcome'],
    [/^\/faq.html$/, '/s/faq'],
    [/^\/about.html$/, '/s/about'],
    [/^\/login.html$/, '/c/login'],
    [/^\/privacy.html$/, '/s/privacy'],
    [/^\/support.html$/, '/s/support'],
    [/^\/tags\/?$/, '/c/tags'],
    [/^\/tos.html$/, '/s/tos'],
    [/^\/change_password$/, '/c/change_password'],
    [/^\/create_account$/, '/c/create_account'],
    [/^\/approval$/, '/c/approval'],
    [/^\/pick_account$/, '/c/pick_account'],
    [/^\/recover_account_step_1$/, '/c/recover_account_step_1'],
    [/^\/recover_account_step_2$/, '/c/recover_account_step_2'],
    [/^\/market$/, '/c/market'],
    [/^\/~witnesses$/, '/c/witnesses'],
    [/^\/submit.html$/, '/c/submit'],
    [/^\/@([\w.\d-]+)\/?$/, '/$0'],
    [/^\/@([\w.\d-]+)\.json$/, '/$0.json'],
    [/^\/@([\w.\d-]+)\/([\w\d-]+)\/?$/, '/$0/$1'],
    [/^\/([\w\d-/]+)\/@([\w.\d-]+)\/([\w\d-]+)\/?$/, '/$1/$2'],
    [/^\/([\w\d-/]+)\/@([\w.\d-]+)\/([\w\d-]+)\.json$/, '/$1/$2.json'],
    [/^\/(hot|votes|responses|trending|trending30|promoted|cashout|payout|payout_comments|created|active)\/?$/, '/t/all/$0'],
    [/^\/(hot|votes|responses|trending|trending30|promoted|cashout|payout|payout_comments|created|active)\/([\w\d-]+)\/?$/, '/t/$1/$0'],
];

export default function useRedirects(app) {
    const router = koa_router();

    app.use(router.routes());

    redirects.forEach(r => {
        router.get(r[0], function *() {
            const dest = Object.keys(this.params).reduce((value, key) => value.replace('$' + key, this.params[key]), r[1]);
            console.log(`server redirect: [${r[0]}] ${this.request.url} -> ${dest}`);
            this.status = r[2] || 302;
            this.redirect(dest);
        });
    });
}
