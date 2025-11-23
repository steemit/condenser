'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.makeCanonicalLink = makeCanonicalLink;

var _apps = require('steemscript/apps.json');

var _apps2 = _interopRequireDefault(_apps);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function read_md_app(metadata) {
    return metadata && metadata.app && typeof metadata.app === 'string' && metadata.app.split('/').length === 2 ? metadata.app.split('/')[0] : null;
}

function read_md_canonical(metadata) {
    var url = metadata.canonical_url && typeof metadata.canonical_url === 'string' ? metadata.canonical_url : null;

    var saneUrl = new RegExp(/^https?:\/\//);
    return saneUrl.test(url) ? url : null;
}

function build_scheme(scheme, post) {
    // https://github.com/bonustrack/steemscript/blob/master/apps.json
    return scheme.split('{category}').join(post.category).split('{username}').join(post.author).split('{permlink}').join(post.permlink);
}

function allowed_app(app) {
    // apps which follow (reciprocate) canonical URLs (as of 2019-10-15)
    var whitelist = ['steemit', 'steempeak', 'travelfeed'];
    return whitelist.includes(app);
}

function makeCanonicalLink(post, metadata) {
    var scheme = void 0;

    if (metadata) {
        var canonUrl = read_md_canonical(metadata);
        if (canonUrl) return canonUrl;

        var app = read_md_app(metadata);
        if (app && allowed_app(app)) {
            scheme = _apps2.default[app] ? _apps2.default[app].url_scheme : null;
        }
    }
    if (!scheme) scheme = _apps2.default['steemit'].url_scheme;
    return build_scheme(scheme, post);
}