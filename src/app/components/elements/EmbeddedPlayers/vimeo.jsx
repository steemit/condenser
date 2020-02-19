import React from 'react';

/**
 * Regular expressions for detecting and validating provider URLs
 * @type {{htmlReplacement: RegExp, main: RegExp, sanitize: RegExp}}
 */
const regex = {
    sanitize: /^(https?:)?\/\/player.vimeo.com\/video\/([0-9]*)/i,
    main: /https?:\/\/(?:vimeo.com\/|player.vimeo.com\/video\/)([0-9]+)\/?(#t=((\d+)s?))?\/?/,
    contentId: /(?:vimeo.com\/|player.vimeo.com\/video\/)([0-9]+)/,
};

export default regex;

/**
 * Check if the iframe code in the post editor is to an allowed URL
 * <iframe src="https://player.vimeo.com/video/179213493" width="640" height="360" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
 * @param url
 * @returns {boolean|*}
 */
export function validateIframeUrl(url) {
    const match = url.match(regex.sanitize);

    if (!match || match.length !== 3) {
        return false;
    }

    return 'https://player.vimeo.com/video/' + match[2];
}

/**
 * Rewrites the embedded URL to a normalized format
 * @param url
 * @returns {string|boolean}
 */
export function normalizeEmbedUrl(url) {
    const match = url.match(regex.contentId);

    if (match && match.length >= 2) {
        return `https://player.vimeo.com/video/${match[1]}`;
    }

    return false;
}

/**
 * Extract the content ID and other metadata from the URL
 * @param data
 * @returns {null|{id: *, canonical: string, url: *}}
 */
function extractContentId(data) {
    if (!data) return null;
    const m = data.match(regex.main);
    if (!m || m.length < 2) return null;

    const startTime = m.input.match(/t=(\d+)s?/);

    return {
        id: m[1],
        url: m[0],
        startTime: startTime ? startTime[1] : 0,
        canonical: `https://player.vimeo.com/video/${m[1]}`,
        // thumbnail: requires a callback - http://stackoverflow.com/questions/1361149/get-img-thumbnails-from-vimeo
    };
}

/**
 * Replaces the URL with a custom Markdown for embedded players
 * @param child
 * @param links
 * @returns {*}
 */
export function embedNode(child, links /*images*/) {
    try {
        const data = child.data;
        const vimeo = extractContentId(data);
        if (!vimeo) return child;

        const vimeoRegex = new RegExp(`${vimeo.url}(#t=${vimeo.startTime}s?)?`);
        if (vimeo.startTime > 0) {
            child.data = data.replace(
                vimeoRegex,
                `~~~ embed:${vimeo.id} vimeo ${vimeo.startTime} ~~~`
            );
        } else {
            child.data = data.replace(
                vimeoRegex,
                `~~~ embed:${vimeo.id} vimeo ~~~`
            );
        }

        if (links) links.add(vimeo.canonical);
        // if(images) images.add(vimeo.thumbnail) // not available
    } catch (error) {
        console.log(error);
    }
    return child;
}

/**
 * Generates the Markdown/HTML code to override the detected URL with an iFrame
 * @param idx
 * @param threespeakId
 * @param w
 * @param h
 * @returns {*}
 */
export function genIframeMd(idx, id, w, h, startTime) {
    const url = `https://player.vimeo.com/video/${id}#t=${startTime}s`;
    return (
        <div key={`vimeo-${id}-${idx}`} className="videoWrapper">
            <iframe
                title="Vimeo embedded player"
                src={url}
                width={w}
                height={h}
                frameBorder="0"
                webkitallowfullscreen
                mozallowfullscreen
                allowFullScreen
            />
        </div>
    );
}
