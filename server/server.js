// newrelic is not working with latest npm if(process.env.NEW_RELIC_APP_NAME) require('newrelic');

import path from 'path';
import Koa from 'koa';
import mount from 'koa-mount';
import helmet from 'koa-helmet';
import koa_logger from 'koa-logger';
import prod_logger from './prod_logger';
import {responseTime} from './metrics';
import favicon from 'koa-favicon';
import staticCache from 'koa-static-cache';
import useRedirects from './redirects';
import useOauthLogin from './api/oauth';
import useGeneralApi from './api/general';
import useIcoApi from './api/ico'
import useAccountRecoveryApi from './api/account_recovery';
import useNotificationsApi from './api/notifications';
import useEnterAndConfirmEmailPages from './server_pages/enter_confirm_email';
import useEnterAndConfirmMobilePages from './server_pages/enter_confirm_mobile';
import useUserJson from './json/user_json';
import isBot from 'koa-isbot';
import session from '@steem/crypto-session';
import csrf from 'koa-csrf';
import flash from 'koa-flash';
import minimist from 'minimist';
import Grant from 'grant-koa';
import config from '../config';
import {routeRegex} from 'app/ResolveRoute';
import secureRandom from 'secure-random';
import { APP_NAME_LATIN } from 'config/client_config';
import requestId from './requestId';

const grant = new Grant(config.grant);
// import uploadImage from 'server/upload-image' //medium-editor
// lksdjflskj

const app = new Koa();
app.name = APP_NAME_LATIN + ' app';
const env = process.env.NODE_ENV || 'development';
const cacheOpts = {maxAge: 86400000, gzip: true};

app.keys = [config.session_key];
const crypto_key = config.server_session_secret;
session(app, {maxAge: 1000 * 3600 * 24 * 60, crypto_key, key: 'golos:sess'});
csrf(app);

app.use(mount(grant));
app.use(flash({key: 'flash'}));

// some redirects
app.use(function *(next) {
    // redirect to home page/feed if known account
    if (this.method === 'GET' && this.url === '/' && this.session.a) {
        this.status = 302;
        this.redirect(`/@${this.session.a}/feed`);
        return;
    }
    // normalize user name url from cased params
    if (this.method === 'GET' && (routeRegex.UserProfile1.test(this.url) || routeRegex.PostNoCategory.test(this.url))) {
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
    // start registration process if user get to create_account page and has no id in session yet
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
        console.log(`server redirect ${this.url} -> ${redir}`);
        this.status = 302;
        this.redirect(redir);
    } else {
        yield next;
    }
});

app.use(requestId());
app.use(responseTime());

if (env === 'production') {
    // load production middleware
    app.use(require('koa-conditional-get')());
    app.use(require('koa-etag')());
    app.use(require('koa-compressor')());
    app.use(prod_logger());
} else {
    app.use(koa_logger());
}

app.use(helmet());

app.use(mount('/static', staticCache(path.join(__dirname, '../app/assets/static'), cacheOpts)));

app.use(mount('/robots.txt', function* () {
    this.set('Cache-Control', 'public, max-age=86400000');
    this.type = 'text/plain';
    this.body = "User-agent: *\nAllow: /";
}));

// set user's uid - used to identify users in logs and some other places
app.use(function* (next) {
    const last_visit = this.session.last_visit;
    this.session.last_visit = (new Date()).getTime() / 1000 | 0;
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


if (env === 'production') {
    app.use(helmet.contentSecurityPolicy(config.helmet));
}

useAccountRecoveryApi(app);
// useOauthLogin(app);
useGeneralApi(app);
useIcoApi(app);
useNotificationsApi(app);

app.use(favicon(path.join(__dirname, '../app/assets/images/favicons/favicon.ico')));
app.use(isBot());

app.use(mount('/robots.txt', staticCache(path.join(__dirname, '../app/assets/robots.txt'), cacheOpts)));
app.use(mount('/sitemap.xml', staticCache(path.join(__dirname, '../app/assets/sitemap.xml'), cacheOpts)));
app.use(mount('/favicons', staticCache(path.join(__dirname, '../app/assets/images/favicons'), cacheOpts)));
app.use(mount('/images', staticCache(path.join(__dirname, '../app/assets/images'), cacheOpts)));
app.use(mount('/legal', staticCache(path.join(__dirname, '../app/assets/legal'), cacheOpts)));
app.use(mount('/googleb1863376a961eb3b.html', staticCache(path.join(__dirname, '../app/assets/googleb1863376a961eb3b.html'), cacheOpts)));


// Proxy asset folder to webpack development server in development mode
if (env === 'development') {
    const PORT = parseInt(process.env.PORT, 10) + 1 || 3000;
    const proxy = require('koa-proxy')({
        host: 'http://127.0.0.1:' + PORT,
        map: (filePath) => 'assets/' + filePath
    });
    app.use(mount('/assets', proxy));
} else {
    app.use(mount('/assets', staticCache(path.join(__dirname, '../dist'), cacheOpts)));
}

if (env !== 'test') {
    const appRender = require('./app_render');
    app.use(function* () {
        yield appRender(this);
        // if (app_router.dbStatus.ok) recordWebEvent(this, 'page_load');
        const bot = this.state.isBot;
        if (bot) {
            console.log(`  --> ${this.method} ${this.originalUrl} ${this.status} (BOT '${bot}')`);
        }
    });

    const argv = minimist(process.argv.slice(2));
    const port = parseInt(argv.port, 10) || parseInt(process.env.PORT, 10) || 3002;
    app.listen(port);

    // Tell parent process koa-server is started
    if (process.send) process.send('online');
    console.log(`Application started on port ${port}`);
}

module.exports = app;
