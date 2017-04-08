import koa_router from 'koa-router';

const redirects = [
    // example: [/\/about(\d+)-(.+)/, '/about?$0:$1', 302],
    [/^\/ico\/?$/, '/about'],
    [/^\/recent\/?$/, '/created']
];

export default function useRedirects(app) {
    const router = koa_router();

    app.use(router.routes());

    redirects.forEach(r => {
        router.get(r[0], function *() {
            const dest = Object.keys(this.params).reduce((value, key) => value.replace('$' + key, this.params[key]), r[1]);
            console.log(`server redirect: [${r[0]}] ${this.request.url} -> ${dest}`);
            this.status = r[2] || 301;
            this.redirect(dest);
        });
    });
}
