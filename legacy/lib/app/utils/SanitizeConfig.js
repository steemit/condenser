'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.allowedTags = exports.noImageText = undefined;

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _ProxifyUrl = require('app/utils/ProxifyUrl');

var _HtmlReady = require('shared/HtmlReady');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// the only allowable title attributes for div and a tags

var iframeWhitelist = [{
    re: /^(https?:)?\/\/player.vimeo.com\/video\/.*/i,
    fn: function fn(src) {
        // <iframe src="https://player.vimeo.com/video/179213493" width="640" height="360" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
        if (!src) return null;
        var m = src.match(/https:\/\/player\.vimeo\.com\/video\/([0-9]+)/);
        if (!m || m.length !== 2) return null;
        return 'https://player.vimeo.com/video/' + m[1];
    }
}, {
    re: /^(https?:)?\/\/www.youtube.com\/embed\/.*/i,
    fn: function fn(src) {
        return src.replace(/\?.+$/, ''); // strip query string (yt: autoplay=1,controls=0,showinfo=0, etc)
    }
}, {
    re: /^(https?:)?\/\/3speak.online\/embed\?v=.*/i,
    fn: function fn(src) {
        return src;
    }
}, {
    re: /^https:\/\/w.soundcloud.com\/player\/.*/i,
    fn: function fn(src) {
        if (!src) return null;
        // <iframe width="100%" height="450" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/257659076&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true"></iframe>
        var m = src.match(/url=(.+?)&/);
        if (!m || m.length !== 2) return null;
        return 'https://w.soundcloud.com/player/?url=' + m[1] + '&auto_play=false&hide_related=false&show_comments=true' + '&show_user=true&show_reposts=false&visual=true';
    }
}, {
    re: /^(https?:)?\/\/player.twitch.tv\/.*/i,
    fn: function fn(src) {
        //<iframe src="https://player.twitch.tv/?channel=ninja" frameborder="0" allowfullscreen="true" scrolling="no" height="378" width="620">
        return src;
    }
}, {
    re: /^https:\/\/emb.d.tube\/\#\!\/([a-zA-Z0-9\-\.\/]+)$/,
    fn: function fn(src) {
        // <iframe width="560" height="315" src="https://emb.d.tube/#!/justineh/u6qoydvy" frameborder="0" allowfullscreen></iframe>
        return src;
    }
}];
var noImageText = exports.noImageText = '(Image not shown due to low ratings)';
var allowedTags = exports.allowedTags = '\n    div, iframe, del,\n    a, p, b, i, q, br, ul, li, ol, img, h1, h2, h3, h4, h5, h6, hr,\n    blockquote, pre, code, em, strong, center, table, thead, tbody, tr, th, td,\n    strike, sup, sub\n'.trim().split(/,\s*/);

// Medium insert plugin uses: div, figure, figcaption, iframe

exports.default = function (_ref) {
    var _ref$large = _ref.large,
        large = _ref$large === undefined ? true : _ref$large,
        _ref$highQualityPost = _ref.highQualityPost,
        highQualityPost = _ref$highQualityPost === undefined ? true : _ref$highQualityPost,
        _ref$noImage = _ref.noImage,
        noImage = _ref$noImage === undefined ? false : _ref$noImage,
        _ref$sanitizeErrors = _ref.sanitizeErrors,
        sanitizeErrors = _ref$sanitizeErrors === undefined ? [] : _ref$sanitizeErrors;
    return {
        allowedTags: allowedTags,
        // figure, figcaption,

        // SEE https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet
        allowedAttributes: {
            // "src" MUST pass a whitelist (below)
            iframe: ['src', 'width', 'height', 'frameborder', 'allowfullscreen', 'webkitallowfullscreen', 'mozallowfullscreen'],

            // class attribute is strictly whitelisted (below)
            // and title is only set in the case of a phishing warning
            div: ['class', 'title'],

            // style is subject to attack, filtering more below
            td: ['style'],
            img: ['src', 'srcset', 'alt', 'class'],

            // title is only set in the case of an external link warning
            a: ['href', 'rel', 'title']
        },
        allowedSchemes: ['http', 'https', 'steem', 'esteem'],
        transformTags: {
            iframe: function iframe(tagName, attribs) {
                var srcAtty = attribs.src;
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = (0, _getIterator3.default)(iframeWhitelist), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var item = _step.value;

                        if (item.re.test(srcAtty)) {
                            var src = typeof item.fn === 'function' ? item.fn(srcAtty, item.re) : srcAtty;
                            if (!src) break;
                            return {
                                tagName: 'iframe',
                                attribs: {
                                    frameborder: '0',
                                    allowfullscreen: 'allowfullscreen',
                                    webkitallowfullscreen: 'webkitallowfullscreen', // deprecated but required for vimeo : https://vimeo.com/forums/help/topic:278181
                                    mozallowfullscreen: 'mozallowfullscreen', // deprecated but required for vimeo
                                    src: src,
                                    width: large ? '640' : '480',
                                    height: large ? '360' : '270'
                                }
                            };
                        }
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                console.log('Blocked, did not match iframe "src" white list urls:', tagName, attribs);
                sanitizeErrors.push('Invalid iframe URL: ' + srcAtty);
                return { tagName: 'div', text: '(Unsupported ' + srcAtty + ')' };
            },
            img: function img(tagName, attribs) {
                if (noImage) return { tagName: 'div', text: noImageText };
                //See https://github.com/punkave/sanitize-html/issues/117
                var src = attribs.src,
                    alt = attribs.alt;

                if (!/^(https?:)?\/\//i.test(src)) {
                    console.log('Blocked, image tag src does not appear to be a url', tagName, attribs);
                    sanitizeErrors.push('An image in this post did not save properly.');
                    return { tagName: 'img', attribs: { src: 'brokenimg.jpg' } };
                }

                // replace http:// with // to force https when needed
                src = src.replace(/^http:\/\//i, '//');
                var atts = { src: src };
                if (alt && alt !== '') atts.alt = alt;
                if ((0, _ProxifyUrl.isDefaultImageSize)(src)) {
                    atts['srcset'] = (0, _ProxifyUrl.defaultSrcSet)(src);
                }
                return { tagName: tagName, attribs: atts };
            },
            div: function div(tagName, attribs) {
                var attys = {};
                var classWhitelist = ['pull-right', 'pull-left', 'text-justify', 'text-rtl', 'text-center', 'text-right', 'videoWrapper', 'phishy'];
                var validClass = classWhitelist.find(function (e) {
                    return attribs.class == e;
                });
                if (validClass) attys.class = validClass;
                if (validClass === 'phishy' && attribs.title === (0, _HtmlReady.getPhishingWarningMessage)()) attys.title = attribs.title;
                return {
                    tagName: tagName,
                    attribs: attys
                };
            },
            td: function td(tagName, attribs) {
                var attys = {};
                if (attribs.style === 'text-align:right') attys.style = 'text-align:right';
                return {
                    tagName: tagName,
                    attribs: attys
                };
            },
            a: function a(tagName, attribs) {
                var href = attribs.href;

                if (!href) href = '#';
                href = href.trim();
                var attys = { href: href };
                // If it's not a (relative or absolute) steemit URL...
                if (!href.match(/^(\/(?!\/)|https:\/\/steemit.com)/)) {
                    // attys.target = '_blank' // pending iframe impl https://mathiasbynens.github.io/rel-noopener/
                    attys.rel = highQualityPost ? 'noopener' : 'nofollow noopener';
                    attys.title = (0, _HtmlReady.getExternalLinkWarningMessage)();
                }
                return {
                    tagName: tagName,
                    attribs: attys
                };
            }
        }
    };
};