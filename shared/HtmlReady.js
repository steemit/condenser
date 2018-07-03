import xmldom from 'xmldom';
import linksRe, { any as linksAny } from 'app/utils/Links';
import { validate_account_name } from 'app/utils/ChainValidation';
import { detransliterate } from 'app/utils/ParsersAndFormatters';

let DOMParser = null;
let XMLSerializer = null;

/**
 * Functions performed by HTMLReady
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
 */

/**
 * Embed videos, link mentions, etc...
 */
export default function(html) {
    try {
        const { doc } = _parseHtml(html, true);

        if (!doc) {
            return '';
        }

        proxifyImages(doc);

        return XMLSerializer.serializeToString(doc);
    } catch (error) {
        console.error(error);
        return html;
    }
}

/**
 *  State reporting
 *  - hashtags: collect all #tags in content
 *  - usertags: collect all @mentions in content
 *  - htmltags: collect all html <tags> used (for validation)
 *  - images: collect all image URLs in content
 *  - links: collect all href URLs in content
 *
 * @param {string} html
 * @returns {{hashtags: Set<any>, usertags: Set<any>, htmltags: Set<any>, images: Set<any>, links: Set<any>}}
 */
export function getTags(html) {
    return _parseHtml(html).state;
}

function _parseHtml(html, mutate) {
    if (!DOMParser) {
        DOMParser = new xmldom.DOMParser({
            errorHandler: { warning: noop, error: noop },
        });
    }

    if (!XMLSerializer) {
        XMLSerializer = new xmldom.XMLSerializer();
    }

    const state = {
        mutate,
        hashtags: new Set(),
        usertags: new Set(),
        htmltags: new Set(),
        images: new Set(),
        links: new Set(),
        anchors: new Set(),
    };

    const doc = DOMParser.parseFromString(html, 'text/html');

    const savedDocumentElement = doc.documentElement;

    traverse(doc, state);

    if (!doc.documentElement) {
        doc.documentElement = savedDocumentElement;
    }

    return {
        doc,
        state,
    };
}

function traverse(node, state, depth = 0) {
    if (!node || !node.childNodes) {
        return;
    }

    for (let child of Array.from(node.childNodes)) {
        const tag = child.tagName ? child.tagName.toLowerCase() : null;

        if (tag) {
            state.htmltags.add(tag);
        }

        if (tag === 'img') {
            img(state, child);
        } else if (tag === 'iframe') {
            iframe(state, child);
        } else if (tag === 'a') {
            link(state, child);
        } else if (/^h[1-6]$/.test(tag)) {
            header(state, child);
        } else if (child.nodeName === '#text') {
            linkifyNode(state, child);
        }

        traverse(child, state, depth + 1);
    }
}

function link(state, child) {
    const url = child.getAttribute('href');

    if (url) {
        state.links.add(url);

        if (state.mutate) {
            // If this link is not hash, relative, http or https - add https
            if (!/^#|^\/(?!\/)|^(?:https?:)?\/\//.test(url)) {
                child.setAttribute('href', 'https://' + url);
            }
        }
    }
}

function iframe(state, child) {
    const url = child.getAttribute('src').trim();

    if (!url) {
        return;
    }

    const { images, links } = state;

    const yt = youTubeId(url);

    if (yt && images && links) {
        links.add(yt.url);
        images.add(`https://img.youtube.com/vi/${yt.id}/0.jpg`);
    }

    if (!state.mutate) {
        return;
    }

    child.data = '';

    if (
        /^(https?:)?\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\//.test(url) ||
        /^(https?:)?\/\/(?:www\.|video\.)?vimeo.com\//.test(url) ||
        /^(https?:)?\/\/(?:www\.)?vk\.com\/video_ext\.php\?/.test(url) ||
        /^(https?:)?\/\/(?:www\.)?ok\.com\/videoembed\//.test(url) ||
        /^(https?:)?\/\/(?:www\.)?rutube\.ru\/play\/embed\//.test(url)
    ) {
        const tagName = child.parentNode.tagName;

        if (
            tagName &&
            tagName.toLowerCase() === 'div' &&
            child.parentNode.getAttribute('class') === 'videoWrapper'
        ) {
            return;
        }

        const html = XMLSerializer.serializeToString(child);

        // wrap iframes in div.videoWrapper to control size/aspect ratio
        child.parentNode.replaceChild(
            DOMParser.parseFromString(
                `<div class="videoWrapper">${html}</div>`
            ),
            child
        );
    }
}

function img(state, child) {
    const url = child.getAttribute('src');

    if (url) {
        state.images.add(url);

        if (state.mutate) {
            if (/^\/\//.test(url)) {
                child.setAttribute('src', 'https:' + url);
            }
        }
    }
}

// For all img elements with non-local URLs
function proxifyImages(doc) {
    if (!$STM_Config.img_proxy_prefix) {
        return;
    }

    if (!doc) {
        return;
    }

    for (let node of [...doc.getElementsByTagName('img')]) {
        const url = node.getAttribute('src');

        if (!linksRe.local.test(url)) {
            node.setAttribute(
                'src',
                $STM_Config.img_proxy_prefix + '0x0/' + url
            );
        }
    }
}

function linkifyNode(state, child) {
    if (!child.data) {
        return;
    }

    try {
        const outerTag = (child.parentNode.tagName || '').toLowerCase();

        if (outerTag === 'code' || outerTag === 'a') {
            return;
        }

        if (safeCall(embedYouTubeNode, state, child)) {
            return;
        }

        if (safeCall(embedVimeoNode, state, child)) {
            return;
        }

        if (safeCall(embedCoubNode, state, child)) {
            return;
        }

        if (safeCall(embedRutubeNode, state, child)) {
            return;
        }

        if (safeCall(embedOkruNode, state, child)) {
            return;
        }

        const data = XMLSerializer.serializeToString(child);
        const content = linkify(state, data);

        if (state.mutate && content !== data) {
            const newChild = DOMParser.parseFromString(
                `<span>${content}</span>`
            );

            child.parentNode.replaceChild(newChild, child);
        }
    } catch (error) {
        console.log(error);
    }
}

function linkify(state, content) {
    // hashtag
    content = content.replace(/(^|\s)(#[-a-zа-яёґєії\d]+)/gi, tag => {
        // Don't allow numbers to be tags
        if (/#[\d]+$/.test(tag)) {
            return tag;
        }

        const space = /^\s/.test(tag) ? tag[0] : '';

        let tag2 = tag.trim().substring(1);
        // Parse tags:
        // if tag string starts with russian symbol, add 'ru-' prefix to it
        // when transletirate it
        // This is needed to be able to detransletirate it back to russian in future (to show russian categories to user)
        // (all of this is needed because blockchain does not allow russian symbols in category)
        if (/^[а-яёґєії]/.test(tag2)) {
            tag2 = 'ru--' + detransliterate(tag2, true);
        }

        const tagLower = tag2.toLowerCase();

        if (state.hashtags) {
            state.hashtags.add(tagLower);
        }

        if (!state.mutate) {
            return tag;
        }

        return space + `<a href="/trending/${tagLower}">${tag}</a>`;
    });

    // usertag (mention)
    content = content.replace(/(^|\s)(@[a-z][-\.a-z\d]+[a-z\d])/gi, user => {
        const space = /^\s/.test(user) ? user[0] : '';
        const user2 = user.trim().substring(1);
        const userLower = user2.toLowerCase();
        const valid = validate_account_name(userLower) == null;

        if (valid && state.usertags) {
            state.usertags.add(userLower);
        }

        if (!state.mutate) {
            return user;
        }

        return (
            space +
            (valid ? `<a href="/@${userLower}">@${user2}</a>` : '@' + user2)
        );
    });

    content = content.replace(linksAny('gi'), ln => {
        if (linksRe.image.test(ln)) {
            if (state.images) {
                state.images.add(ln);
            }

            return `<img src="${ln}" />`;
        }

        // do not linkify .exe or .zip urls
        if (/\.(zip|exe)$/i.test(ln)) {
            return ln;
        }

        if (state.links) {
            state.links.add(ln);
        }

        return `<a href="${ln}">${ln}</a>`;
    });

    return content;
}

function embedYouTubeNode(state, node) {
    const yt = youTubeId(node.data);

    if (!yt) {
        return;
    }

    const v = DOMParser.parseFromString(`~~~ embed:${yt.id} youtube ~~~`);
    node.parentNode.replaceChild(v, node);

    if (state.links) {
        state.links.add(yt.url);
    }

    if (state.images) {
        state.images.add('https://img.youtube.com/vi/' + yt.id + '/0.jpg');
    }

    return true;
}

/** @return ?{id, url} */
function youTubeId(data) {
    const m1 = data.match(linksRe.youTube);
    const url = m1 ? m1[0] : null;

    if (!url) {
        return null;
    }

    const m2 = url.match(linksRe.youTubeId);
    const id = m2 && m2.length >= 2 ? m2[1] : null;

    if (!id) {
        return null;
    }

    return { id, url };
}

function embedVimeoNode(state, node) {
    const match = node.data.match(linksRe.vimeoId);

    if (!match) {
        return;
    }

    const id = match[1];

    const url = `https://player.vimeo.com/video/${id}`;
    const v = DOMParser.parseFromString(`~~~ embed:${id} vimeo ~~~`);
    node.parentNode.replaceChild(v, node);

    if (state.links) {
        state.links.add(url);
    }

    return true;
}

function embedCoubNode(state, node) {
    const match = node.data.match(linksRe.coubId);

    if (!match) {
        return;
    }

    const id = match[1];

    node.parentNode.replaceChild(
        DOMParser.parseFromString(`~~~ embed:${id} coub ~~~`),
        node
    );

    if (state.links) {
        state.links.add(`https://coub.com/view/${id}`);
    }

    return true;
}

function embedRutubeNode(state, node) {
    const match = node.data.match(linksRe.rutubeId);

    if (!match) {
        return;
    }

    const id = match[1];

    node.parentNode.replaceChild(
        DOMParser.parseFromString(`~~~ embed:${id} rutube ~~~`),
        node
    );

    if (state.links) {
        state.links.add(`https://rutube.ru/video/${id}/`);
    }

    return true;
}

function embedOkruNode(state, node) {
    const match = node.data.match(linksRe.okVideoId);

    if (!match) {
        return;
    }

    const id = match[1];

    node.parentNode.replaceChild(
        DOMParser.parseFromString(`~~~ embed:${id} ok_video ~~~`),
        node
    );

    if (state.links) {
        state.links.add(`https://ok.ru/live/${id}`);
    }

    return true;
}

function header(state, node) {
    if (!state.mutate) {
        return;
    }

    const tag = node.tagName;
    const hIndex = parseInt(tag[1], 10);
    const newIndex = Math.min(hIndex + 1, 6);
    node.tagName = node.nodeName = node.localName = 'h' + newIndex;

    if (!node.getAttribute('id') && node.textContent) {
        const idBase = detransliterate(
            node.textContent.trim().toLowerCase(),
            true
        )
            .replace(/^[^a-z0-9]+/, '')
            .replace(/[^a-z0-9]+$/, '')
            .replace(/[^a-z0-9]+/gi, '-');
        let id = idBase;

        let index = 0;

        while (!id || state.anchors.has(id)) {
            index++;
            id = `${idBase}_${index}`;
        }

        state.anchors.add(id);

        node.setAttribute('id', id);
        node.appendChild(
            DOMParser.parseFromString(
                `<a class="header-anchor" href="#${id}"></a>`
            )
        );
    }
}

function safeCall(fn, ...args) {
    try {
        return fn(...args);
    } catch (err) {
        console.warn(err);
    }
}

function noop() {}
