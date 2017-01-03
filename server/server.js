// 4567891123456789212345678931234567894123456789512345678961234567897123456789$

// newrelic is not working with latest npm
// if(process.env.NEW_RELIC_APP_NAME) require('newrelic');

import Grant from 'grant-koa';
import Koa from 'koa';
import config from '../config';
import csrf from 'koa-csrf';
import favicon from 'koa-favicon';
import flash from 'koa-flash';
import helmet from 'koa-helmet';
import isBot from 'koa-isbot';
import log from '../log';
import mount from 'koa-mount';
import path from 'path';
import RequestLogger from './RequestLogger';
import secureRandom from 'secure-random';
import session from '@steem/crypto-session';
import staticCache from 'koa-static-cache';
import useAccountRecoveryApi from './api/account_recovery';
import useEnterAndConfirmEmailPages from './server_pages/enter_confirm_email';
import useEnterAndConfirmMobilePages from './server_pages/enter_confirm_mobile';
import useGeneralApi from './api/general';
import useNotificationsApi from './api/notifications';
import useOauthLogin from './api/oauth';
import useRedirects from './redirects';
import useUserJson from './json/user_json';
import {routeRegex} from 'app/ResolveRoute';

const env = process.env.NODE_ENV || 'development';

const grant = new Grant(config.grant);
// import uploadImage from 'server/upload-image' //medium-editor

const app = new Koa();
app.name = 'steemit.com';

app.use(RequestLogger());

const cacheOpts = { maxAge: 60 * 60 * 24 * 1000, gzip: true}; //1000 dall

// FIXME what does this do?
app.keys = [config.session_key];

const crypto_key = config.server_session_secret;
session(app, {maxAge: 1000 * 3600 * 24 * 60, crypto_key, key: config.session_cookie_key});
csrf(app);

app.use(mount(grant));

app.use(flash({key: 'flash'}));

// some redirects
app.use(function *(next) {

    // redirect / to /@username/feed if logged in
    if (this.method === 'GET' && this.url === '/' && this.session.a) {
        this.status = 302;
        this.redirect(`/@${this.session.a}/feed`);
        return;
    }

    // normalize user name url from cased params
    if (
            this.method === 'GET'
        &&
            (routeRegex.UserProfile1.test(this.url) ||
                routeRegex.PostNoCategory.test(this.url))
    ) {
        const p = this.originalUrl.toLowerCase();
        if(p !== this.originalUrl) {
            this.status = 301;
            this.redirect(p);
            return;
        }
    }

    // normalize top category filtering from cased params
    if (this.method === 'GET' && routeRegex.CategoryFilters.test(this.url)) {
        const p = this.originalUrl.toLowerCase();
        if(p !== this.originalUrl) {
            this.status = 301;
            this.redirect(p);
            return;
        }
    }

    // start registration process if user get to create_account page and has
    // no id in session yet
    if(this.url === '/create_account' && !this.session.user) {
        this.status = 302;
        this.redirect('/enter_email');
        return;
    }

    // remember ch, cn, r url params in the session and remove them from url
    if (this.method === 'GET' && /\?[^\w]*(ch=|cn=|r=)/.test(this.url)) {
        let redir = this.url.replace(/((ch|cn|r)=[^&]+)/gi, r => {
            const p = r.split('=');
            if (p.length === 2) this.session[p[0]] = p[1];
            return '';
        });
        redir = redir.replace(/&&&?/, '');
        redir = redir.replace(/\?&?$/, '');
        log.info(`server redirect ${this.url} -> ${redir}`);
        this.status = 302;
        this.redirect(redir);
    } else {
        yield next;
    }

});

if (env === 'production') {
    // load production middleware
    app.use(require('koa-conditional-get')());
    app.use(require('koa-etag')());
    app.use(require('koa-compressor')());
}

app.use(helmet());

app.use(
    mount(
        '/static',
        staticCache(path.join(__dirname, '../app/assets/static'), cacheOpts)
    )
);

app.use(mount('/robots.txt', function* () {
    this.set('Cache-Control', 'public, max-age=86400000');
    this.type = 'text/plain';
    this.body = "User-agent: *\nAllow: /";
}));

// set user's uid - used to identify users in logs and some other places
app.use(function* (next) {
    const last_visit = this.session.last_visit;
    this.session.last_visit = (new Date()).getTime() / 1000 | 0;
    // FIXME reset session after certain number of days
    if (!this.session.uid) {
        this.session.uid = secureRandom.randomBuffer(13).toString('hex');
        this.session.new_visit = true;
    } else {
        this.session.new_visit = this.session.last_visit - last_visit > 1800;
    }
    yield next;
});

useRedirects(app);
useEnterAndConfirmEmailPages(app);
useEnterAndConfirmMobilePages(app);
useUserJson(app);

// FIXME should the CSP run in dev, too? I think it should. --sneak
if (env === 'production') {
    app.use(helmet.contentSecurityPolicy(config.helmet));
}

useAccountRecoveryApi(app);
useOauthLogin(app);
useGeneralApi(app);
useNotificationsApi(app);

app.use(favicon(path.join(__dirname, '../app/assets/images/favicons/favicon.ico')));

app.use(isBot());

app.use(
    mount(
        '/favicons',
        staticCache(path.join(__dirname, '../app/assets/images/favicons'), cacheOpts)
    )
);

app.use(
    mount(
        '/images',
        staticCache(path.join(__dirname, '../app/assets/images'), cacheOpts)
    )
);

// Proxy asset folder to webpack development server in development mode
if (env === 'development') {
    // FIXME duplicated port code from devserver js file
    const PORT = parseInt(process.env.PORT, 10) + 1 || 3001;
    const proxy = require('koa-proxy')({
        host: 'http://0.0.0.0:' + PORT,
        map: (filePath) => 'assets/' + filePath
    });
    app.use(mount('/assets', proxy));
} else {
    app.use(
        mount(
            '/assets',
            staticCache(path.join(__dirname, '../dist'), cacheOpts)
        )
    );
}

if (env !== 'test') {
    const appRender = require('./app_render');
    app.use(function* () {
        yield appRender(this);
        // if (app_router.dbStatus.ok) recordWebEvent(this, 'page_load');
        const bot = this.state.isBot;
        if (bot) {
            log.info(`  --> ${this.method} ${this.originalUrl} ` +
                `${this.status} (BOT '${bot}')`);
        }
    });

    const port = parseInt(process.env.PORT) || 8080;
    app.listen(port);

    // Tell parent process koa-server is started
    if (process.send) process.send('online');
    log.info(`Application started on port ${port}`);
}

module.exports = app;
