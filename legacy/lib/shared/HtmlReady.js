'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getExternalLinkWarningMessage = exports.getPhishingWarningMessage = undefined;

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

exports.default = function (html) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$mutate = _ref.mutate,
        mutate = _ref$mutate === undefined ? true : _ref$mutate,
        _ref$hideImages = _ref.hideImages,
        hideImages = _ref$hideImages === undefined ? false : _ref$hideImages,
        _ref$isProxifyImages = _ref.isProxifyImages,
        isProxifyImages = _ref$isProxifyImages === undefined ? false : _ref$isProxifyImages;

    var state = { mutate: mutate };
    state.hashtags = new _set2.default();
    state.usertags = new _set2.default();
    state.htmltags = new _set2.default();
    state.images = new _set2.default();
    state.links = new _set2.default();
    try {
        var doc = DOMParser.parseFromString(preprocessHtml(html), 'text/html');
        traverse(doc, state);
        if (mutate) {
            if (hideImages) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = (0, _getIterator3.default)((0, _from2.default)(doc.getElementsByTagName('img'))), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var image = _step.value;

                        var pre = doc.createElement('pre');
                        pre.setAttribute('class', 'image-url-only');
                        pre.appendChild(doc.createTextNode(image.getAttribute('src')));
                        image.parentNode.replaceChild(pre, image);
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
            } else {
                if (!isProxifyImages) proxifyImages(doc);
            }
        }
        // console.log('state', state)
        if (!mutate) return state;
        return (0, _extends3.default)({
            html: doc ? XMLSerializer.serializeToString(doc) : ''
        }, state);
    } catch (error) {
        // xmldom error is bad
        console.error('rendering error', (0, _stringify2.default)({ error: error.message, html: html }));
        return { html: '' };
    }
};

var _xmldom = require('xmldom');

var _xmldom2 = _interopRequireDefault(_xmldom);

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _Links = require('app/utils/Links');

var _Links2 = _interopRequireDefault(_Links);

var _ChainValidation = require('app/utils/ChainValidation');

var _ProxifyUrl = require('app/utils/ProxifyUrl');

var _Phishing = require('app/utils/Phishing');

var Phishing = _interopRequireWildcard(_Phishing);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getPhishingWarningMessage = exports.getPhishingWarningMessage = function getPhishingWarningMessage() {
    return (0, _counterpart2.default)('g.phishy_message');
};
var getExternalLinkWarningMessage = exports.getExternalLinkWarningMessage = function getExternalLinkWarningMessage() {
    return (0, _counterpart2.default)('g.external_link_message');
};

var noop = function noop() {};
var DOMParser = new _xmldom2.default.DOMParser({
    errorHandler: { warning: noop, error: noop }
});
var XMLSerializer = new _xmldom2.default.XMLSerializer();

/**
 * Functions performed by HTMLReady
 *
 * State reporting
 *  - hashtags: collect all #tags in content
 *  - usertags: collect all @mentions in content
 *  - htmltags: collect all html <tags> used (for validation)
 *  - images: collect all image URLs in content
 *  - links: collect all href URLs in content
 *
 * Mutations
 *  - link()
 *    - ensure all <a> href's begin with a protocol. prepend https:// otherwise.
 *  - iframe()
 *    - wrap all <iframe>s in <div class="videoWrapper"> for responsive sizing
 *  - img()
 *    - convert any <img> src IPFS prefixes to standard URL
 *    - change relative protocol to https://
 *  - linkifyNode()
 *    - scans text content to be turned into rich content
 *    - embedYouTubeNode()
 *      - identify plain youtube URLs and prep them for "rich embed"
 *    - linkify()
 *      - scan text for:
 *        - #tags, convert to <a> links
 *        - @mentions, convert to <a> links
 *        - naked URLs
 *          - if img URL, normalize URL and convert to <img> tag
 *          - otherwise, normalize URL and convert to <a> link
 *  - proxifyImages()
 *    - prepend proxy URL to any non-local <img> src's
 *
 * We could implement 2 levels of HTML mutation for maximum reuse:
 *  1. Normalization of HTML - non-proprietary, pre-rendering cleanup/normalization
 *    - (state reporting done at this level)
 *    - normalize URL protocols
 *    - convert naked URLs to images/links
 *    - convert embeddable URLs to <iframe>s
 *    - basic sanitization?
 *  2. Steemit.com Rendering - add in proprietary Steemit.com functions/links
 *    - convert <iframe>s to custom objects
 *    - linkify #tags and @mentions
 *    - proxify images
 *
 * TODO:
 *  - change ipfsPrefix(url) to normalizeUrl(url)
 *    - rewrite IPFS prefixes to valid URLs
 *    - schema normalization
 *    - gracefully handle protocols like ftp, mailto
 */

/** Split the HTML on top-level elements. This allows react to compare separately, preventing excessive re-rendering.
 * Used in MarkdownViewer.jsx
 */
// export function sectionHtml (html) {
//   const doc = DOMParser.parseFromString(html, 'text/html')
//   const sections = Array(...doc.childNodes).map(child => XMLSerializer.serializeToString(child))
//   return sections
// }

/** Embed videos, link mentions and hashtags, etc...
    If hideImages and mutate is set to true all images will be replaced
    by <pre> elements containing just the image url.
*/


function preprocessHtml(html) {
    // Replacing 3Speak Image/Anchor tag with an embedded player
    html = embedThreeSpeakNode(html);

    return html;
}

function traverse(node, state) {
    var depth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    if (!node || !node.childNodes) return;
    Array.apply(undefined, (0, _toConsumableArray3.default)(node.childNodes)).forEach(function (child) {
        // console.log(depth, 'child.tag,data', child.tagName, child.data)
        var tag = child.tagName ? child.tagName.toLowerCase() : null;
        if (tag) state.htmltags.add(tag);

        if (tag === 'img') img(state, child);else if (tag === 'iframe') iframe(state, child);else if (tag === 'a') link(state, child);else if (child.nodeName === '#text') linkifyNode(child, state);

        traverse(child, state, depth + 1);
    });
}

function link(state, child) {
    var url = child.getAttribute('href');
    if (url) {
        state.links.add(url);
        if (state.mutate) {
            // If this link is not relative, http, https, steem or esteem -- add https.
            if (!/^((#)|(\/(?!\/))|(((steem|esteem|https?):)?\/\/))/.test(url)) {
                child.setAttribute('href', 'https://' + url);
            }

            // Unlink potential phishing attempts
            if (url.indexOf('#') !== 0 && // Allow in-page links
            child.textContent.match(/(www\.)?steemit\.com/i) && !url.match(/https?:\/\/(.*@)?(www\.)?steemit\.com/i) || Phishing.looksPhishy(url)) {
                var phishyDiv = child.ownerDocument.createElement('div');
                phishyDiv.textContent = child.textContent + ' / ' + url;
                phishyDiv.setAttribute('title', getPhishingWarningMessage());
                phishyDiv.setAttribute('class', 'phishy');
                child.parentNode.replaceChild(phishyDiv, child);
            }
        }
    }
}

// wrap iframes in div.videoWrapper to control size/aspect ratio
function iframe(state, child) {
    var url = child.getAttribute('src');
    if (url) {
        var images = state.images,
            links = state.links;

        var yt = youTubeId(url);
        if (yt && images && links) {
            links.add(yt.url);
            images.add('https://img.youtube.com/vi/' + yt.id + '/0.jpg');
        }
    }

    var mutate = state.mutate;

    if (!mutate) return;

    var tag = child.parentNode.tagName ? child.parentNode.tagName.toLowerCase() : child.parentNode.tagName;
    if (tag == 'div' && child.parentNode.getAttribute('class') == 'videoWrapper') return;
    var html = XMLSerializer.serializeToString(child);
    child.parentNode.replaceChild(DOMParser.parseFromString('<div class="videoWrapper">' + html + '</div>'), child);
}

function img(state, child) {
    var url = child.getAttribute('src');
    if (url) {
        state.images.add(url);
        if (state.mutate) {
            var url2 = ipfsPrefix(url);
            if (/^\/\//.test(url2)) {
                // Change relative protocol imgs to https
                url2 = 'https:' + url2;
            }
            if (url2 !== url) {
                child.setAttribute('src', url2);
            }
        }
    }
}

// For all img elements with non-local URLs, prepend the proxy URL (e.g. `https://img0.steemit.com/0x0/`)
function proxifyImages(doc) {
    if (!doc) return;
    [].concat((0, _toConsumableArray3.default)(doc.getElementsByTagName('img'))).forEach(function (node) {
        var url = node.getAttribute('src');
        if (!_Links2.default.local.test(url)) node.setAttribute('src', (0, _ProxifyUrl.proxifyImageUrl)(url, true));
    });
}

function linkifyNode(child, state) {
    try {
        var tag = child.parentNode.tagName ? child.parentNode.tagName.toLowerCase() : child.parentNode.tagName;
        if (tag === 'code') return;
        if (tag === 'a') return;

        var mutate = state.mutate;

        if (!child.data) return;
        child = embedYouTubeNode(child, state.links, state.images);
        child = embedVimeoNode(child, state.links, state.images);
        child = embedTwitchNode(child, state.links, state.images);
        child = embedDTubeNode(child, state.links, state.images);
        child = embedThreeSpeakNode(child, state.links, state.images);

        var data = XMLSerializer.serializeToString(child);
        var content = linkify(data, state.mutate, state.hashtags, state.usertags, state.images, state.links);
        if (mutate && content !== data) {
            var newChild = DOMParser.parseFromString('<span>' + content + '</span>');
            child.parentNode.replaceChild(newChild, child);
            return newChild;
        }
    } catch (error) {
        console.error('linkify_error', error);
    }
}

function linkify(content, mutate, hashtags, usertags, images, links) {
    // hashtag
    content = content.replace(/(^|\s)(#[-a-z\d]+)/gi, function (tag) {
        if (/#[\d]+$/.test(tag)) return tag; // Don't allow numbers to be tags
        var space = /^\s/.test(tag) ? tag[0] : '';
        var tag2 = tag.trim().substring(1);
        var tagLower = tag2.toLowerCase();
        if (hashtags) hashtags.add(tagLower);
        if (!mutate) return tag;
        return space + ('<a href="/trending/' + tagLower + '">' + tag + '</a>');
    });

    // usertag (mention)
    // Cribbed from https://github.com/twitter/twitter-text/blob/v1.14.7/js/twitter-text.js#L90
    content = content.replace(/(^|[^a-zA-Z0-9_!#$%&*@＠\/]|(^|[^a-zA-Z0-9_+~.-\/#]))[@＠]([a-z][-\.a-z\d]+[a-z\d])/gi, function (match, preceeding1, preceeding2, user) {
        var userLower = user.toLowerCase();
        var valid = (0, _ChainValidation.validate_account_name)(userLower) == null;

        if (valid && usertags) usertags.add(userLower);

        var preceedings = (preceeding1 || '') + (preceeding2 || ''); // include the preceeding matches if they exist

        if (!mutate) return '' + preceedings + user;

        return valid ? preceedings + '<a href="/@' + userLower + '">@' + user + '</a>' : preceedings + '@' + user;
    });

    content = content.replace((0, _Links.any)('gi'), function (ln) {
        if (_Links2.default.image.test(ln)) {
            if (images) images.add(ln);
            return '<img src="' + ipfsPrefix(ln) + '" />';
        }

        // do not linkify .exe or .zip urls
        if (/\.(zip|exe)$/i.test(ln)) return ln;

        // do not linkify phishy links
        if (Phishing.looksPhishy(ln)) return '<div title=\'' + getPhishingWarningMessage() + '\' class=\'phishy\'>' + ln + '</div>';

        if (links) links.add(ln);
        return '<a href="' + ipfsPrefix(ln) + '">' + ln + '</a>';
    });
    return content;
}

function embedYouTubeNode(child, links, images) {
    try {
        var data = child.data;
        var yt = youTubeId(data);
        if (!yt) return child;

        if (yt.startTime) {
            child.data = data.replace(yt.url, '~~~ embed:' + yt.id + ' youtube ' + yt.startTime + ' ~~~');
        } else {
            child.data = data.replace(yt.url, '~~~ embed:' + yt.id + ' youtube ~~~');
        }

        if (links) links.add(yt.url);
        if (images) images.add(yt.thumbnail);
    } catch (error) {
        console.error('yt_node', error);
    }
    return child;
}

/** @return {id, url} or <b>null</b> */
function youTubeId(data) {
    if (!data) return null;

    var m1 = data.match(_Links2.default.youTube);
    var url = m1 ? m1[0] : null;
    if (!url) return null;

    var m2 = url.match(_Links2.default.youTubeId);
    var id = m2 && m2.length >= 2 ? m2[1] : null;
    if (!id) return null;

    var startTime = url.match(/t=(\d+)s?/);

    return {
        id: id,
        url: url,
        startTime: startTime ? startTime[1] : 0,
        thumbnail: 'https://img.youtube.com/vi/' + id + '/0.jpg'
    };
}

/** @return {id, url} or <b>null</b> */
function getThreeSpeakId(data) {
    if (!data) return null;

    var match = data.match(_Links2.default.threespeak);
    var url = match ? match[0] : null;
    if (!url) return null;
    var fullId = match[1];
    var id = fullId.split('/').pop();

    return {
        id: id,
        fullId: fullId,
        url: url,
        thumbnail: 'https://img.3speakcontent.online/' + id + '/post.png'
    };
}

function embedThreeSpeakNode(child, links, images) {
    try {
        if (typeof child === 'string') {
            // If typeof child is a string, this means we are trying to process the HTML
            // to replace the image/anchor tag created by 3Speak dApp
            var threespeakId = getThreeSpeakId(child);
            if (threespeakId) {
                child = child.replace(_Links2.default.threespeakImageLink, '~~~ embed:' + threespeakId.fullId + ' threespeak ~~~');
            }
        } else {
            // If child is not a string, we are processing plain text
            // to replace a bare URL
            var data = child.data;
            var _threespeakId = getThreeSpeakId(data);
            if (!_threespeakId) return child;

            child.data = data.replace(_threespeakId.url, '~~~ embed:' + _threespeakId.fullId + ' threespeak ~~~');

            if (links) links.add(_threespeakId.url);
            if (images) images.add(_threespeakId.thumbnail);
        }
    } catch (error) {
        console.log(error);
    }

    return child;
}

function embedVimeoNode(child, links /*images*/) {
    try {
        var data = child.data;
        var vimeo = vimeoId(data);
        if (!vimeo) return child;

        var vimeoRegex = new RegExp(vimeo.url + '(#t=' + vimeo.startTime + 's?)?');
        if (vimeo.startTime > 0) {
            child.data = data.replace(vimeoRegex, '~~~ embed:' + vimeo.id + ' vimeo ' + vimeo.startTime + ' ~~~');
        } else {
            child.data = data.replace(vimeoRegex, '~~~ embed:' + vimeo.id + ' vimeo ~~~');
        }

        if (links) links.add(vimeo.canonical);
        // if(images) images.add(vimeo.thumbnail) // not available
    } catch (error) {
        console.error('vimeo_embed', error);
    }
    return child;
}

function vimeoId(data) {
    if (!data) return null;
    var m = data.match(_Links2.default.vimeo);
    if (!m || m.length < 2) return null;

    var startTime = m.input.match(/t=(\d+)s?/);

    return {
        id: m[1],
        url: m[0],
        startTime: startTime ? startTime[1] : 0,
        canonical: 'https://player.vimeo.com/video/' + m[1]
        // thumbnail: requires a callback - http://stackoverflow.com/questions/1361149/get-img-thumbnails-from-vimeo
    };
}

function embedTwitchNode(child, links /*images*/) {
    try {
        var data = child.data;
        var twitch = twitchId(data);
        if (!twitch) return child;

        child.data = data.replace(twitch.url, '~~~ embed:' + twitch.id + ' twitch ~~~');

        if (links) links.add(twitch.canonical);
    } catch (error) {
        console.error('twitch_error', error);
    }
    return child;
}

function twitchId(data) {
    if (!data) return null;
    var m = data.match(_Links2.default.twitch);
    if (!m || m.length < 3) return null;

    return {
        id: m[1] === 'videos' ? '?video=' + m[2] : '?channel=' + m[2],
        url: m[0],
        canonical: m[1] === 'videos' ? 'https://player.twitch.tv/?video=' + m[2] : 'https://player.twitch.tv/?channel=' + m[2]
    };
}

function embedDTubeNode(child, links /*images*/) {
    try {
        var data = child.data;
        var dtube = dtubeId(data);
        if (!dtube) return child;

        child.data = data.replace(dtube.url, '~~~ embed:' + dtube.id + ' dtube ~~~');

        if (links) links.add(dtube.canonical);
    } catch (error) {
        console.error('dtube_embed', error);
    }
    return child;
}

function dtubeId(data) {
    if (!data) return null;
    var m = data.match(_Links2.default.dtube);
    if (!m || m.length < 2) return null;

    return {
        id: m[1],
        url: m[0],
        canonical: 'https://emb.d.tube/#!/' + m[1]
    };
}

function ipfsPrefix(url) {
    if ($STM_Config.ipfs_prefix) {
        // Convert //ipfs/xxx  or /ipfs/xxx  into  https://steemit.com/ipfs/xxxxx
        if (/^\/?\/ipfs\//.test(url)) {
            var slash = url.charAt(1) === '/' ? 1 : 0;
            url = url.substring(slash + '/ipfs/'.length); // start with only 1 /
            return $STM_Config.ipfs_prefix + '/' + url;
        }
    }
    return url;
}