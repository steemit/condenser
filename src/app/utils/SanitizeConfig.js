import {
    getPhishingWarningMessage,
    getExternalLinkWarningMessage,
} from 'shared/HtmlReady'; // the only allowable title attributes for div and a tags

import { validateIframeUrl as validateEmbbeddedPlayerIframeUrl } from 'app/components/elements/EmbeddedPlayers';

export const noImageText = '(Image not shown due to low ratings)';
export const allowedTags = `
    div, iframe, del,
    a, p, b, i, q, br, ul, li, ol, img, h1, h2, h3, h4, h5, h6, hr,
    blockquote, pre, code, em, strong, center, table, thead, tbody, tr, th, td,
    strike, sup, sub
`
    .trim()
    .split(/,\s*/);

// Medium insert plugin uses: div, figure, figcaption, iframe
export default ({
    large = true,
    highQualityPost = true,
    noImage = false,
    sanitizeErrors = [],
}) => ({
    allowedTags,
    // figure, figcaption,

    // SEE https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet
    allowedAttributes: {
        // "src" MUST pass a whitelist (below)
        iframe: [
            'src',
            'width',
            'height',
            'frameborder',
            'allowfullscreen',
            'webkitallowfullscreen',
            'mozallowfullscreen',
        ],

        // class attribute is strictly whitelisted (below)
        // and title is only set in the case of a phishing warning
        div: ['class', 'title'],

        // style is subject to attack, filtering more below
        td: ['style'],
        img: ['src', 'alt'],

        // title is only set in the case of an external link warning
        a: ['href', 'rel', 'title'],
    },
    allowedSchemes: ['http', 'https', 'steem', 'esteem'],
    transformTags: {
        iframe: (tagName, attribs) => {
            const srcAtty = attribs.src;
            const validUrl = validateEmbbeddedPlayerIframeUrl(srcAtty);

            if (validUrl !== false) {
                return {
                    tagName: 'iframe',
                    attribs: {
                        frameborder: '0',
                        allowfullscreen: 'allowfullscreen',
                        webkitallowfullscreen: 'webkitallowfullscreen', // deprecated but required for vimeo : https://vimeo.com/forums/help/topic:278181
                        mozallowfullscreen: 'mozallowfullscreen', // deprecated but required for vimeo
                        src: validUrl,
                        width: large ? '640' : '480',
                        height: large ? '360' : '270',
                    },
                };
            }

            console.log(
                'Blocked, did not match iframe "src" white list urls:',
                tagName,
                attribs
            );

            sanitizeErrors.push('Invalid iframe URL: ' + srcAtty);
            return { tagName: 'div', text: `(Unsupported ${srcAtty})` };
        },
        img: (tagName, attribs) => {
            if (noImage) return { tagName: 'div', text: noImageText };
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
                return { tagName: 'img', attribs: { src: 'brokenimg.jpg' } };
            }

            // replace http:// with // to force https when needed
            src = src.replace(/^http:\/\//i, '//');
            let atts = { src };
            if (alt && alt !== '') atts.alt = alt;
            return { tagName, attribs: atts };
        },
        div: (tagName, attribs) => {
            const attys = {};
            const classWhitelist = [
                'pull-right',
                'pull-left',
                'text-justify',
                'text-rtl',
                'text-center',
                'text-right',
                'videoWrapper',
                'phishy',
            ];
            const validClass = classWhitelist.find(e => attribs.class == e);
            if (validClass) attys.class = validClass;
            if (
                validClass === 'phishy' &&
                attribs.title === getPhishingWarningMessage()
            )
                attys.title = attribs.title;
            return {
                tagName,
                attribs: attys,
            };
        },
        td: (tagName, attribs) => {
            const attys = {};
            if (attribs.style === 'text-align:right')
                attys.style = 'text-align:right';
            return {
                tagName,
                attribs: attys,
            };
        },
        a: (tagName, attribs) => {
            let { href } = attribs;
            if (!href) href = '#';
            href = href.trim();
            const attys = { href };
            // If it's not a (relative or absolute) steemit URL...
            if (!href.match(/^(\/(?!\/)|https:\/\/steemit.com)/)) {
                // attys.target = '_blank' // pending iframe impl https://mathiasbynens.github.io/rel-noopener/
                attys.rel = highQualityPost ? 'noopener' : 'nofollow noopener';
                attys.title = getExternalLinkWarningMessage();
            }
            return {
                tagName,
                attribs: attys,
            };
        },
    },
});
