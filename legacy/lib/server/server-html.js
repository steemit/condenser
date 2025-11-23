'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = ServerHTML;

var _config = require('config');

var config = _interopRequireWildcard(_config);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function ServerHTML(_ref) {
    var body = _ref.body,
        assets = _ref.assets,
        locale = _ref.locale,
        title = _ref.title,
        meta = _ref.meta,
        google_analytics_id = _ref.google_analytics_id,
        csp_nonce = _ref.csp_nonce;

    var page_title = title;
    return _react2.default.createElement(
        'html',
        { lang: 'en' },
        _react2.default.createElement(
            'head',
            null,
            google_analytics_id && _react2.default.createElement('script', {
                nonce: csp_nonce,
                async: true,
                src: 'https://www.googletagmanager.com/gtag/js?id=' + google_analytics_id
            }),
            google_analytics_id && _react2.default.createElement('script', {
                nonce: csp_nonce,
                dangerouslySetInnerHTML: {
                    __html: '\n                                window.dataLayer = window.dataLayer || [];\n                                function gtag(){dataLayer.push(arguments);}\n                                gtag(\'js\', new Date());\n                                gtag(\'config\', \'' + google_analytics_id + '\');\n                            '
                }
            }),
            _react2.default.createElement('meta', { charSet: 'utf-8' }),
            _react2.default.createElement('meta', {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1.0'
            }),
            meta && meta.map(function (m) {
                if (m.title) {
                    page_title = m.title;
                    return null;
                }
                if (m.canonical) return _react2.default.createElement('link', {
                    key: 'canonical',
                    rel: 'canonical',
                    href: m.canonical
                });
                if (m.name && m.content) return _react2.default.createElement('meta', {
                    key: m.name,
                    name: m.name,
                    content: m.content
                });
                if (m.property && m.content) return _react2.default.createElement('meta', {
                    key: m.property,
                    property: m.property,
                    content: m.content
                });
                return null;
            }),
            _react2.default.createElement('link', {
                rel: 'stylesheet',
                href: '/assets/plugins/editor.md/css/editormd.css'
            }),
            _react2.default.createElement('script', { src: '/assets/js/tron-ads-sdk-1.0.49.js' }),
            _react2.default.createElement('script', { src: '/assets/js/jquery-3.6.0.min.js' }),
            false && _react2.default.createElement('script', { src: '/assets/plugins/editor.md/editormd.js' }),
            false && locale !== 'zh' && _react2.default.createElement('script', { src: '/assets/plugins/editor.md/languages/en.js' }),
            _react2.default.createElement('link', { rel: 'manifest', href: '/static/manifest.json' }),
            _react2.default.createElement('link', { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico?v=2' }),
            _react2.default.createElement('link', {
                rel: 'apple-touch-icon-precomposed',
                sizes: '57x57',
                href: '/images/favicons/apple-touch-icon-57x57.png',
                type: 'image/png'
            }),
            _react2.default.createElement('link', {
                rel: 'apple-touch-icon-precomposed',
                sizes: '114x114',
                href: '/images/favicons/apple-touch-icon-114x114.png',
                type: 'image/png'
            }),
            _react2.default.createElement('link', {
                rel: 'apple-touch-icon-precomposed',
                sizes: '72x72',
                href: '/images/favicons/apple-touch-icon-72x72.png',
                type: 'image/png'
            }),
            _react2.default.createElement('link', {
                rel: 'apple-touch-icon-precomposed',
                sizes: '144x144',
                href: '/images/favicons/apple-touch-icon-144x144.png',
                type: 'image/png'
            }),
            _react2.default.createElement('link', {
                rel: 'apple-touch-icon-precomposed',
                sizes: '60x60',
                href: '/images/favicons/apple-touch-icon-60x60.png',
                type: 'image/png'
            }),
            _react2.default.createElement('link', {
                rel: 'apple-touch-icon-precomposed',
                sizes: '120x120',
                href: '/images/favicons/apple-touch-icon-120x120.png',
                type: 'image/png'
            }),
            _react2.default.createElement('link', {
                rel: 'apple-touch-icon-precomposed',
                sizes: '76x76',
                href: '/images/favicons/apple-touch-icon-76x76.png',
                type: 'image/png'
            }),
            _react2.default.createElement('link', {
                rel: 'apple-touch-icon-precomposed',
                sizes: '152x152',
                href: '/images/favicons/apple-touch-icon-152x152.png',
                type: 'image/png'
            }),
            _react2.default.createElement('link', {
                rel: 'icon',
                type: 'image/png',
                href: '/images/favicons/favicon-196x196.png',
                sizes: '196x196'
            }),
            _react2.default.createElement('link', {
                rel: 'icon',
                type: 'image/png',
                href: '/images/favicons/favicon-96x96.png',
                sizes: '96x96'
            }),
            _react2.default.createElement('link', {
                rel: 'icon',
                type: 'image/png',
                href: '/images/favicons/favicon-32x32.png',
                sizes: '32x32'
            }),
            _react2.default.createElement('link', {
                rel: 'icon',
                type: 'image/png',
                href: '/images/favicons/favicon-16x16.png',
                sizes: '16x16'
            }),
            _react2.default.createElement('link', {
                rel: 'icon',
                type: 'image/png',
                href: '/images/favicons/favicon-128.png',
                sizes: '128x128'
            }),
            _react2.default.createElement('meta', { name: 'application-name', content: 'Steemit' }),
            _react2.default.createElement('meta', { name: 'msapplication-TileColor', content: '#FFFFFF' }),
            _react2.default.createElement('meta', {
                name: 'msapplication-TileImage',
                content: '/images/favicons/mstile-144x144.png'
            }),
            _react2.default.createElement('meta', {
                name: 'msapplication-square70x70logo',
                content: '/images/favicons/mstile-70x70.png'
            }),
            _react2.default.createElement('meta', {
                name: 'msapplication-square150x150logo',
                content: '/images/favicons/mstile-150x150.png'
            }),
            _react2.default.createElement('meta', {
                name: 'msapplication-wide310x150logo',
                content: '/images/favicons/mstile-310x150.png'
            }),
            _react2.default.createElement('meta', {
                name: 'msapplication-square310x310logo',
                content: '/images/favicons/mstile-310x310.png'
            }),
            _react2.default.createElement('link', {
                href: 'https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,600',
                rel: 'stylesheet',
                type: 'text/css'
            }),
            _react2.default.createElement('link', {
                href: 'https://fonts.googleapis.com/css?family=Source+Serif+Pro:400,600',
                rel: 'stylesheet',
                type: 'text/css'
            }),
            assets.style.map(function (href, idx) {
                return _react2.default.createElement('link', {
                    href: href,
                    key: idx,
                    rel: 'stylesheet',
                    type: 'text/css'
                });
            }),
            _react2.default.createElement(
                'title',
                null,
                page_title
            )
        ),
        _react2.default.createElement(
            'body',
            null,
            _react2.default.createElement('div', {
                id: 'content',
                dangerouslySetInnerHTML: { __html: body }
            }),
            assets.script.map(function (href, idx) {
                return _react2.default.createElement('script', { key: idx, src: href });
            })
        )
    );
}