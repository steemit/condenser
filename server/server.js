import path from 'path';
import Koa from 'koa';
import mount from 'koa-mount';
import helmet from 'koa-helmet';
import koa_logger from 'koa-logger';
import prod_logger from './prod_logger';
import favicon from 'koa-favicon';
import staticCache from 'koa-static-cache';
import useRedirects from './redirects';
import useOauthLogin from './api/oauth';
import useGeneralApi from './api/general';
import useAccountRecoveryApi from './api/account_recovery';
import useEnterAndConfirmEmailPages from './server_pages/enter_confirm_email';
import isBot from 'koa-isbot';
import session from 'koa-session';
import csrf from 'koa-csrf';
import flash from 'koa-flash';
import minimist from 'minimist';
import Grant from 'grant-koa';
import config from '../config';

const grant = new Grant(config.grant);
// import uploadImage from 'server/upload-image' //medium-editor

const app = new Koa();
app.name = 'Steemit app';
const env = process.env.NODE_ENV || 'development';
const cacheOpts = {maxAge: 86400000, gzip: true};

app.keys = [config.session_key];
app.use(session({maxAge: 1000 * 3600 * 24 * 7}, app));
csrf(app);
app.use(mount(grant));
app.use(flash({key: 'flash'}));

// redirect to home page if known account
// remember ch, cn, r url params in the session and remove them from url
app.use(function *(next) {
    if (this.method === 'GET' && this.url === '/' && this.session.a) {
        this.status = 301;
        this.redirect(`/@${this.session.a}/feed`);
        return;
    }
    if (this.method === 'GET' && /\?[^\w]*(ch=|cn=|r=)/.test(this.url)) {
        let redir = this.url.replace(/((ch|cn|r)=[^&]+)/gi, r => {
            const p = r.split('=');
            if (p.length === 2) this.session[p[0]] = p[1];
            return '';
        });
        redir = redir.replace(/&&&?/, '');
        redir = redir.replace(/\?&?$/, '');
        console.log(`server redirect ${this.url} -> ${redir}`);
        this.status = 301;
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

useRedirects(app);
useEnterAndConfirmEmailPages(app);

if (env === 'production') {
    app.use(helmet.contentSecurityPolicy(config.helmet));
}

useAccountRecoveryApi(app);
useOauthLogin(app);
useGeneralApi(app);

app.use(favicon(path.join(__dirname, '../app/assets/images/favicons/favicon.ico')));
app.use(isBot());
app.use(mount('/favicons', staticCache(path.join(__dirname, '../app/assets/images/favicons'), cacheOpts)));
app.use(mount('/images', staticCache(path.join(__dirname, '../app/assets/images'), cacheOpts)));
// Proxy asset folder to webpack development server in development mode
if (env === 'development') {
    const PORT = parseInt(process.env.PORT, 10) + 1 || 3001;
    const proxy = require('koa-proxy')({
        host: 'http://0.0.0.0:' + PORT,
        map: (filePath) => 'assets/' + filePath
    });
    app.use(mount('/assets', proxy));
} else {
    app.use(mount('/assets', staticCache(path.join(__dirname, '../dist'), cacheOpts)));
}

if (env !== 'test') {
    const appRender = require('./app_render');
    app.use(function* () {
        this.first_visit = false;
        this.last_visit = this.session.last_visit;
        this.session.last_visit = (new Date()).getTime() / 1000 | 0;
        if (!this.session.uid) {
            this.session.uid = Math.random().toString(36).slice(2);
            this.first_visit = true;
            this.session.new_visit = true;
        } else {
            this.session.new_visit = this.session.last_visit - this.last_visit > 1800;
        }
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
