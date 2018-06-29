export const noImageText = '(Image not shown due to low ratings)';
export const allowedTags = [
    'div',
    'iframe',
    'del',
    'a',
    'p',
    'b',
    'q',
    'br',
    'ul',
    'li',
    'ol',
    'img',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'hr',
    'blockquote',
    'pre',
    'code',
    'em',
    'strong',
    'center',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'strike',
    'sup',
    'sub',
];

const allowedDivClasses = new Set([
    'pull-right',
    'pull-left',
    'text-justify',
    'text-rtl',
    'text-center',
    'text-right',
    'videoWrapper',
]);
const iframeWhitelist = [
    {
        re: /^(?:https?:)?\/\/player\.vimeo\.com\/video\//,
        fn: src => {
            const match = src.match(
                /^(?:https?:)?\/\/player\.vimeo\.com\/video\/([0-9]+)/
            );

            if (match) {
                return 'https://player.vimeo.com/video/' + match[1];
            }
        },
        forceSize: true,
    },
    {
        re: /^(?:https?:)?\/\/www\.youtube\.com\/embed\//i,
        fn: cutParams,
        forceSize: true,
    },
    {
        re: /^(?:https?:)\/\/w\.soundcloud\.com\/player\//,
        fn: src => {
            // <iframe width="100%" height="450" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/257659076&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true"></iframe>
            const match = src.match(/url=(.+?)&/);

            if (match) {
                return `https://w.soundcloud.com/player/?url=${
                    match[1]
                }&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&visual=true`;
            }
        },
    },
    {
        re: /^(?:https?:)?\/\/www\.google\.com\/maps\//,
        width: '100%',
    },
    {
        re: /^(?:https?:)?\/\/yandex\.ru\/map-widget\//,
        width: '100%',
    },
    {
        re: /^(?:https?:)?\/\/app\.powerbi\.com\/view\//,
    },
    {
        re: /^(?:https?:)?\/\/music\.yandex\.ru\//,
    },
    {
        re: /^(?:https?:)?\/\/(:?www\.)?deezer\.com\//,
    },
    {
        re: /^(?:https?:)?\/\/(:?www\.)?vk\.com\/video_ext\.php\?/,
    },
    {
        re: /^(?:https?:)?\/\/(:?www\.)?ok\.com\/videoembed\//,
        fn: cutParams,
    },
    {
        re: /^(?:https?:)?\/\/(:?www\.)?rutube\.ru\/play\/embed\//,
        fn: cutParams,
    },
    {
        re: /^(?:https?:)?\/\/coub\.com\/embed\//,
        fn: src =>
            src.replace(/#.*$/, '') + '&hideTopBar=true&noSiteButtons=true',
        addClass: 'g-coub',
    },
];

const DEFAULT_IFRAME_ATTRS = {
    frameborder: '0',
    webkitallowfullscreen: 'webkitallowfullscreen',
    mozallowfullscreen: 'mozallowfullscreen',
    allowfullscreen: 'allowfullscreen',
};

export default ({
    large = true,
    highQualityPost = true,
    noImage = false,
    sanitizeErrors = [],
}) => ({
    allowedTags,

    // SEE https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet
    allowedAttributes: {
        // "src" MUST pass a whitelist (below)
        iframe: [
            'src',
            'class',
            'style',
            'width',
            'height',
            'frameborder',
            'allowfullscreen',
            'webkitallowfullscreen',
            'mozallowfullscreen',
        ],

        // class attribute is strictly whitelisted (below)
        div: ['class'],

        // style is subject to attack, filtering more below
        td: ['style'],
        img: ['src', 'alt'],
        a: ['href', 'rel', 'class'],
        h1: ['id'],
        h2: ['id'],
        h3: ['id'],
        h4: ['id'],
        h5: ['id'],
        h6: ['id'],
    },
    transformTags: {
        iframe: (tagName, attribs) => {
            const srcAtty = attribs.src;

            if (!srcAtty) {
                return {
                    tagName: 'div',
                };
            }

            const opt = iframeWhitelist.find(opt => opt.re.test(srcAtty));

            let src = null;

            if (opt) {
                if (opt.fn) {
                    src = opt.fn(srcAtty);
                } else {
                    src = srcAtty;
                }
            }

            if (opt && src) {
                const attrs = {
                    src,
                    ...DEFAULT_IFRAME_ATTRS,
                };

                attrs.width = opt.width
                    ? opt.width
                    : opt.forceSize
                        ? large
                            ? '800'
                            : '480'
                        : attribs.width;

                attrs.height = opt.height
                    ? opt.height
                    : opt.forceSize
                        ? large
                            ? '600'
                            : '270'
                        : attribs.height;

                attrs.style = '';

                if (opt.addClass) {
                    attrs.class = opt.addClass;
                }

                return {
                    tagName: 'iframe',
                    attribs: attrs,
                };
            } else {
                console.log(
                    'Blocked, did not match iframe "src" white list urls:',
                    tagName,
                    attribs
                );

                sanitizeErrors.push('Invalid iframe URL: ' + srcAtty);

                return {
                    tagName: 'div',
                    text: `(Unsupported ${srcAtty})`,
                };
            }
        },
        img: (tagName, attribs) => {
            if (noImage) {
                return { tagName: 'div', text: noImageText };
            }

            //See https://github.com/punkave/sanitize-html/issues/117
            let { src, alt } = attribs;

            if (!/^(https?:)?\/\//i.test(src)) {
                console.log(
                    'Blocked, image tag src does not appear to be a url',
                    tagName,
                    attribs
                );
                sanitizeErrors.push(
                    'An image in this post did not save properly.'
                );

                return {
                    tagName: 'img',
                    attribs: { src: 'brokenimg.jpg' },
                };
            }

            // replace http:// with // to force https when needed
            src = src.replace(/^http:\/\//, '//');

            const atts = { src };

            if (alt && alt !== '') {
                atts.alt = alt;
            }
            return { tagName, attribs: atts };
        },
        div: (tagName, attribs) => {
            const attrs = {};

            if (attribs.class) {
                attrs.class = attribs.class
                    .split(/\s+/)
                    .filter(cl => allowedDivClasses.has(cl))
                    .join(' ');
            }

            return {
                tagName,
                attribs: attrs,
            };
        },
        td: (tagName, attribs) => {
            const attrs = {};

            if (attribs.style === 'text-align:right') {
                attrs.style = 'text-align:right';
            }

            return {
                tagName,
                attribs: attrs,
            };
        },
        a: (tagName, attribs) => {
            const href = (attribs.href || '#').trim();

            const attrs = { href };

            // If it's not a (relative or absolute) golos URL...
            if (!href.match(/^(\/(?!\/)|https:\/\/(golos.io|golos.club))/)) {
                attrs.rel = highQualityPost ? 'noopener' : 'nofollow noopener';
            }

            if (attribs.class === 'header-anchor') {
                attrs.class = attribs.class;
            }

            return {
                tagName,
                attribs: attrs,
            };
        },
    },
});

function cutParams(url) {
    return url.replace(/\?.+$/, ''); // strip query string autoplay=1&controls=0&showinfo=0
}
