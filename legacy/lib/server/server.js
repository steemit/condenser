'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _koa = require('koa');

var _koa2 = _interopRequireDefault(_koa);

var _koaMount = require('koa-mount');

var _koaMount2 = _interopRequireDefault(_koaMount);

var _koaHelmet = require('koa-helmet');

var _koaHelmet2 = _interopRequireDefault(_koaHelmet);

var _koaLogger = require('koa-logger');

var _koaLogger2 = _interopRequireDefault(_koaLogger);

var _koaRouter = require('koa-router');

var _koaRouter2 = _interopRequireDefault(_koaRouter);

var _requesttimings = require('./requesttimings');

var _requesttimings2 = _interopRequireDefault(_requesttimings);

var _StatsLoggerClient = require('./utils/StatsLoggerClient');

var _StatsLoggerClient2 = _interopRequireDefault(_StatsLoggerClient);

var _SteemMarket = require('./utils/SteemMarket');

var _TronPrice = require('./utils/TronPrice');

var _hardwarestats = require('./hardwarestats');

var _hardwarestats2 = _interopRequireDefault(_hardwarestats);

var _cluster = require('cluster');

var _cluster2 = _interopRequireDefault(_cluster);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _prod_logger = require('./prod_logger');

var _prod_logger2 = _interopRequireDefault(_prod_logger);

var _koaFavicon = require('koa-favicon');

var _koaFavicon2 = _interopRequireDefault(_koaFavicon);

var _koaStaticCache = require('koa-static-cache');

var _koaStaticCache2 = _interopRequireDefault(_koaStaticCache);

var _redirects = require('./redirects');

var _redirects2 = _interopRequireDefault(_redirects);

var _general = require('./api/general');

var _general2 = _interopRequireDefault(_general);

var _user_json = require('./json/user_json');

var _user_json2 = _interopRequireDefault(_user_json);

var _post_json = require('./json/post_json');

var _post_json2 = _interopRequireDefault(_post_json);

var _koaIsbot = require('koa-isbot');

var _koaIsbot2 = _interopRequireDefault(_koaIsbot);

var _cryptoSession = require('@steem/crypto-session');

var _cryptoSession2 = _interopRequireDefault(_cryptoSession);

var _koaCsrf = require('koa-csrf');

var _koaCsrf2 = _interopRequireDefault(_koaCsrf);

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _ResolveRoute = require('app/ResolveRoute');

var _secureRandom = require('secure-random');

var _secureRandom2 = _interopRequireDefault(_secureRandom);

var _userIllegalContent = require('app/utils/userIllegalContent');

var _userIllegalContent2 = _interopRequireDefault(_userIllegalContent);

var _koaLocale = require('koa-locale');

var _koaLocale2 = _interopRequireDefault(_koaLocale);

var _misc = require('./utils/misc');

var _SpecialPosts = require('./utils/SpecialPosts');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (_cluster2.default.isMaster) console.log('application server starting, please wait.');

// import uploadImage from 'server/upload-image' //medium-editor

var app = new _koa2.default();
app.name = 'Steemit app';
var env = process.env.NODE_ENV || 'development';
// cache of a thousand days
var cacheOpts = { maxAge: 86400000, gzip: true, buffer: true };

// import ads.txt to be served statically
var adstxt = _fs2.default.readFileSync(_path2.default.join(__dirname, '../app/assets/ads.txt'), 'utf8');

// Serve static assets without fanfare
app.use((0, _koaFavicon2.default)(_path2.default.join(__dirname, '../app/assets/images/favicons/favicon.ico')));

app.use((0, _koaMount2.default)('/favicons', (0, _koaStaticCache2.default)(_path2.default.join(__dirname, '../app/assets/images/favicons'), cacheOpts)));

app.use((0, _koaMount2.default)('/images', (0, _koaStaticCache2.default)(_path2.default.join(__dirname, '../app/assets/images'), cacheOpts)));

app.use((0, _koaMount2.default)('/javascripts', (0, _koaStaticCache2.default)(_path2.default.join(__dirname, '../app/assets/javascripts'), cacheOpts)));

app.use((0, _koaMount2.default)('/ads.txt', /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    this.type = 'text/plain';
                    this.body = adstxt;

                case 2:
                case 'end':
                    return _context.stop();
            }
        }
    }, _callee, this);
})));

// Proxy asset folder to webpack development server in development mode
if (env === 'development') {
    var webpack_dev_port = process.env.PORT ? parseInt(process.env.PORT) + 1 : 8081;
    var proxyhost = 'http://0.0.0.0:' + webpack_dev_port;
    console.log('proxying to webpack dev server at ' + proxyhost);
    var proxy = require('koa-proxy')({
        host: proxyhost,
        map: function map(filePath) {
            return 'assets/' + filePath;
        }
    });
    app.use((0, _koaMount2.default)('/assets', proxy));
} else {
    app.use((0, _koaMount2.default)('/assets', (0, _koaStaticCache2.default)(_path2.default.join(__dirname, '../../dist'), cacheOpts)));
}

var resolvedAssets = false;
var supportedLocales = false;

if (process.env.NODE_ENV === 'production') {
    resolvedAssets = require(_path2.default.join(__dirname, '../..', '/tmp/webpack-stats-prod.json'));
    supportedLocales = (0, _misc.getSupportedLocales)();
}

app.use((0, _koaIsbot2.default)());

// set number of processes equal to number of cores
// (unless passed in as an env var)
var numProcesses = process.env.NUM_PROCESSES || _os2.default.cpus().length;

var statsLoggerClient = new _StatsLoggerClient2.default(process.env.STATSD_IP);

app.use((0, _requesttimings2.default)(statsLoggerClient));

app.keys = [_config2.default.get('session_key')];

var crypto_key = _config2.default.get('server_session_secret');
(0, _cryptoSession2.default)(app, {
    maxAge: 1000 * 3600 * 24 * 60,
    crypto_key: crypto_key,
    key: _config2.default.get('session_cookie_key')
});
(0, _koaCsrf2.default)(app);

(0, _koaLocale2.default)(app);

function convertEntriesToArrays(obj) {
    var conf = (0, _keys2.default)(obj).reduce(function (result, key) {
        result[key] = obj[key].split(/\s+/);
        return result;
    }, {});
    console.log('convertEntriesToArrays:', (0, _stringify2.default)(conf));
    // remove connect-src and plugin-types
    delete conf.pluginTypes;
    // add nonce support
    var nonceCb = function nonceCb(req, res) {
        return '\'nonce-' + req.cspNonce + '\'';
    };
    if (!conf.scriptSrc) {
        conf.scriptSrc = [];
    }
    conf.scriptSrc.push(nonceCb);
    if (!conf.defaultSrc) {
        conf.defaultSrc = [];
    }
    conf.defaultSrc.push(nonceCb);
    return conf;
}

// Fetch cached currency data for homepage
var steemMarket = new _SteemMarket.SteemMarket();
var tronPrice = new _TronPrice.TronPrice();
app.use( /*#__PURE__*/_regenerator2.default.mark(function _callee2(next) {
    return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    _context2.next = 2;
                    return steemMarket.get();

                case 2:
                    this.steemMarketData = _context2.sent;
                    _context2.next = 5;
                    return tronPrice.get();

                case 5:
                    this.tronPriceData = _context2.sent;
                    _context2.next = 8;
                    return next;

                case 8:
                case 'end':
                    return _context2.stop();
            }
        }
    }, _callee2, this);
}));

// some redirects and health status
app.use( /*#__PURE__*/_regenerator2.default.mark(function _callee3(next) {
    var _this = this;

    var p, userCheck, _p, redir;

    return _regenerator2.default.wrap(function _callee3$(_context3) {
        while (1) {
            switch (_context3.prev = _context3.next) {
                case 0:
                    if (!(this.method === 'GET' && this.url === '/.well-known/healthcheck.json')) {
                        _context3.next = 4;
                        break;
                    }

                    this.status = 200;
                    this.body = {
                        status: 'ok',
                        docker_tag: process.env.DOCKER_TAG ? process.env.DOCKER_TAG : false,
                        source_commit: process.env.SOURCE_COMMIT ? process.env.SOURCE_COMMIT : false
                    };
                    return _context3.abrupt('return');

                case 4:
                    if (!(this.method === 'GET' && this.url === '/' && this.session.a)) {
                        _context3.next = 8;
                        break;
                    }

                    this.status = 302;
                    //this.redirect(`/@${this.session.a}/feed`);
                    this.redirect('/trending/my');
                    return _context3.abrupt('return');

                case 8:
                    if (!(this.method === 'GET' && (_ResolveRoute.routeRegex.UserProfile.test(this.url) || _ResolveRoute.routeRegex.PostNoCategory.test(this.url) || _ResolveRoute.routeRegex.Post.test(this.url)))) {
                        _context3.next = 20;
                        break;
                    }

                    p = this.originalUrl.toLowerCase();
                    userCheck = '';

                    if (_ResolveRoute.routeRegex.Post.test(this.url)) {
                        userCheck = p.split('/')[2].slice(1);
                    } else {
                        userCheck = p.split('/')[1].slice(1);
                    }

                    if (!_userIllegalContent2.default.includes(userCheck)) {
                        _context3.next = 16;
                        break;
                    }

                    console.log('Illegal content user found blocked', userCheck);
                    this.status = 451;
                    return _context3.abrupt('return');

                case 16:
                    if (!(p !== this.originalUrl)) {
                        _context3.next = 20;
                        break;
                    }

                    this.status = 301;
                    this.redirect(p);
                    return _context3.abrupt('return');

                case 20:
                    if (!(this.method === 'GET' && _ResolveRoute.routeRegex.CategoryFilters.test(this.url))) {
                        _context3.next = 26;
                        break;
                    }

                    _p = this.originalUrl.toLowerCase();

                    if (!(_p !== this.originalUrl)) {
                        _context3.next = 26;
                        break;
                    }

                    this.status = 301;
                    this.redirect(_p);
                    return _context3.abrupt('return');

                case 26:
                    if (!(this.method === 'GET' && /\?[^\w]*(ch=|cn=|r=)/.test(this.url))) {
                        _context3.next = 35;
                        break;
                    }

                    redir = this.url.replace(/((ch|cn|r)=[^&]+)/gi, function (r) {
                        var p = r.split('=');
                        if (p.length === 2) _this.session[p[0]] = p[1];
                        return '';
                    });

                    redir = redir.replace(/&&&?/, '');
                    redir = redir.replace(/\?&?$/, '');
                    console.log('server redirect ' + this.url + ' -> ' + redir);
                    this.status = 302;
                    this.redirect(redir);
                    _context3.next = 37;
                    break;

                case 35:
                    _context3.next = 37;
                    return next;

                case 37:
                case 'end':
                    return _context3.stop();
            }
        }
    }, _callee3, this);
}));

// load production middleware
if (env === 'production') {
    app.use(require('koa-conditional-get')());
    app.use(require('koa-etag')());
    app.use(require('koa-compressor')());
}

// Logging
if (env === 'production') {
    app.use((0, _prod_logger2.default)());
} else {
    app.use((0, _koaLogger2.default)());
}

// Sets the `script-src` directive to
// "'self' 'nonce-e33ccde670f149c1789b1e1e113b0916'"
// (or similar)
app.use( /*#__PURE__*/_regenerator2.default.mark(function _callee4(next) {
    return _regenerator2.default.wrap(function _callee4$(_context4) {
        while (1) {
            switch (_context4.prev = _context4.next) {
                case 0:
                    this.session.cspNonce = _secureRandom2.default.randomBuffer(16).toString('hex');
                    this.req.cspNonce = this.session.cspNonce;
                    _context4.next = 4;
                    return next;

                case 4:
                case 'end':
                    return _context4.stop();
            }
        }
    }, _callee4, this);
}));

// app.use(
//     helmet({
//         hsts: false,
//     })
// );

app.use((0, _koaMount2.default)('/static', (0, _koaStaticCache2.default)(_path2.default.join(__dirname, '../app/assets/static'), cacheOpts)));

app.use((0, _koaMount2.default)('/robots.txt', /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
    return _regenerator2.default.wrap(function _callee5$(_context5) {
        while (1) {
            switch (_context5.prev = _context5.next) {
                case 0:
                    this.set('Cache-Control', 'public, max-age=86400000');
                    this.type = 'text/plain';
                    this.body = 'User-agent: *\nAllow: /';

                case 3:
                case 'end':
                    return _context5.stop();
            }
        }
    }, _callee5, this);
})));

// set user's uid - used to identify users in logs and some other places
// FIXME SECURITY PRIVACY cycle this uid after a period of time
app.use( /*#__PURE__*/_regenerator2.default.mark(function _callee6(next) {
    var last_visit, from_link;
    return _regenerator2.default.wrap(function _callee6$(_context6) {
        while (1) {
            switch (_context6.prev = _context6.next) {
                case 0:
                    last_visit = this.session.last_visit;

                    this.session.last_visit = new Date().getTime() / 1000 | 0;
                    from_link = this.request.headers.referer;

                    if (!this.session.uid) {
                        this.session.uid = _secureRandom2.default.randomBuffer(13).toString('hex');
                        this.session.new_visit = true;
                        if (from_link) this.session.r = from_link;
                    } else {
                        this.session.new_visit = this.session.last_visit - last_visit > 1800;
                        if (!this.session.r && from_link) {
                            this.session.r = from_link;
                        }
                    }
                    _context6.next = 6;
                    return next;

                case 6:
                case 'end':
                    return _context6.stop();
            }
        }
    }, _callee6, this);
}));

// TODO: This is a temporary function to proxy users' avatar
// to let twitter get it successfully.
var router = (0, _koaRouter2.default)({ prefix: '/' });
app.use(router.routes());
router.get('/avatar/:username', /*#__PURE__*/_regenerator2.default.mark(function _callee7(next) {
    var image_host, image_url, image_response, image_buffer;
    return _regenerator2.default.wrap(function _callee7$(_context7) {
        while (1) {
            switch (_context7.prev = _context7.next) {
                case 0:
                    _context7.prev = 0;
                    image_host = _config2.default.get('img_proxy_prefix') ? _config2.default.get('img_proxy_prefix') : 'https://steemitimages.com/';
                    image_url = image_host + 'u/' + this.params.username + '/avatar';
                    _context7.next = 5;
                    return (0, _nodeFetch2.default)(image_url);

                case 5:
                    image_response = _context7.sent;

                    if (image_response.ok) {
                        _context7.next = 10;
                        break;
                    }

                    this.body = (0, _stringify2.default)({
                        error: 'image_not_found'
                    });
                    console.error('error_in /avatar/:username', username);
                    return _context7.abrupt('return');

                case 10:
                    _context7.next = 12;
                    return image_response.buffer();

                case 12:
                    image_buffer = _context7.sent;

                    this.response.set('content-type', image_response.headers.get('content-type'));
                    this.response.set('content-length', image_buffer.length);
                    this.body = image_buffer;
                    _context7.next = 22;
                    break;

                case 18:
                    _context7.prev = 18;
                    _context7.t0 = _context7['catch'](0);

                    console.error('error_in /avatar/:username', username, _context7.t0);
                    this.body = (0, _stringify2.default)({
                        error: 'image_not_found'
                    });

                case 22:
                case 'end':
                    return _context7.stop();
            }
        }
    }, _callee7, this, [[0, 18]]);
}));

(0, _redirects2.default)(app);
(0, _user_json2.default)(app);
(0, _post_json2.default)(app);

(0, _general2.default)(app);

// helmet wants some things as bools and some as lists, makes config difficult.
// our config uses strings, this splits them to lists on whitespace.
if (env === 'production') {
    var helmetConfig = {
        directives: convertEntriesToArrays(_config2.default.get('helmet.directives')),
        reportOnly: _config2.default.get('helmet.reportOnly'),
        setAllHeaders: _config2.default.get('helmet.setAllHeaders')
    };
    helmetConfig.directives.reportUri = helmetConfig.directives.reportUri[0];
    if (helmetConfig.directives.reportUri === '-') {
        delete helmetConfig.directives.reportUri;
    }
    app.use(_koaHelmet2.default.contentSecurityPolicy(helmetConfig));
}

if (env !== 'test') {
    var appRender = require('./app_render');

    // Load special posts and store them on the ctx for later use. Since
    // we're inside a generator, we can't `await` here, so we pass a promise
    // so `src/server/app_render.jsx` can `await` on it.
    app.specialPostsPromise = (0, _SpecialPosts.specialPosts)();
    // refresh special posts every five minutes
    setInterval(function () {
        return new _promise2.default(function (resolve, reject) {
            app.specialPostsPromise = (0, _SpecialPosts.specialPosts)();
            resolve();
        });
    }, 300000);

    app.use( /*#__PURE__*/_regenerator2.default.mark(function _callee8() {
        var bot;
        return _regenerator2.default.wrap(function _callee8$(_context8) {
            while (1) {
                switch (_context8.prev = _context8.next) {
                    case 0:
                        _context8.next = 2;
                        return appRender(this, supportedLocales, resolvedAssets);

                    case 2:
                        bot = this.state.isBot;

                        if (bot) {
                            console.log('  --> ' + this.method + ' ' + this.originalUrl + ' ' + this.status + ' (BOT \'' + bot + '\')');
                        }

                    case 4:
                    case 'end':
                        return _context8.stop();
                }
            }
        }, _callee8, this);
    }));

    var argv = (0, _minimist2.default)(process.argv.slice(2));

    var port = process.env.PORT ? parseInt(process.env.PORT) : 8080;

    if (env === 'production') {
        if (_cluster2.default.isMaster) {
            for (var i = 0; i < numProcesses; i++) {
                _cluster2.default.fork();
            }
            // if a worker dies replace it so application keeps running
            _cluster2.default.on('exit', function (worker) {
                console.log('error: worker %d died, starting a new one', worker.id);
                _cluster2.default.fork();
            });
        } else {
            app.listen(port);
            if (process.send) process.send('online');
            console.log('Worker process started for port ' + port);
        }
    } else {
        // spawn a single thread if not running in production mode
        app.listen(port);
        if (process.send) process.send('online');
        console.log('Application started on port ' + port);
    }
}

// set PERFORMANCE_TRACING to the number of seconds desired for
// logging hardware stats to the console
if (process.env.PERFORMANCE_TRACING) setInterval(_hardwarestats2.default, 1000 * process.env.PERFORMANCE_TRACING);

module.exports = app;