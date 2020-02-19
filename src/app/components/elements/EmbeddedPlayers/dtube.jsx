import React from 'react';

/**
 * Regular expressions for detecting and validating provider URLs
 * @type {{htmlReplacement: RegExp, main: RegExp, sanitize: RegExp}}
 */
const regex = {
    sanitize: /^https:\/\/emb.d.tube\/\#\!\/([a-zA-Z0-9\-\.\/]+)$/,
    main: /https:\/\/(?:emb\.)?(?:d.tube\/\#\!\/(?:v\/)?)([a-zA-Z0-9\-\.\/]*)/,
    contentId: /(?:d\.tube\/#!\/(?:v\/)?([a-zA-Z0-9\-\.\/]*))+/,
};

export default regex;

/**
 * Generates the Markdown/HTML code to override the detected URL with an iFrame
 * @param idx
 * @param threespeakId
 * @param w
 * @param h
 * @returns {*}
 */
export function genIframeMd(idx, dtubeId, w, h) {
    const url = `https://emb.d.tube/#!/${dtubeId}`;
    return (
        <div key={`dtube-${dtubeId}-${idx}`} className="videoWrapper">
            <iframe
                title="DTube embedded player"
                key={idx}
                src={url}
                width={w}
                height={h}
                frameBorder="0"
                allowFullScreen
            />
        </div>
    );
}

/**
 * Check if the iframe code in the post editor is to an allowed URL
 * <iframe title="DTube embedded player" src="https://emb.d.tube/#!/lemwong/QmQqxBCkoVusMRwP6D9oBMRQdASFzABdKQxE7xLysfmsR6" width="640" height="360" frameborder="0" allowfullscreen=""></iframe>
 * @param url
 * @returns {boolean|*}
 */
export function validateIframeUrl(url) {
    const match = url.match(regex.sanitize);

    if (match) {
        return url;
    }

    return false;
}

/**
 * Rewrites the embedded URL to a normalized format
 * @param url
 * @returns {string|boolean}
 */
export function normalizeEmbedUrl(url) {
    const match = url.match(regex.contentId);

    if (match && match.length >= 2) {
        return `https://emb.d.tube/#!/${match[1]}`;
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

    return {
        id: m[1],
        url: m[0],
        canonical: `https://emb.d.tube/#!/${m[1]}`,
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
        const dtube = extractContentId(data);
        if (!dtube) return child;

        child.data = data.replace(dtube.url, `~~~ embed:${dtube.id} dtube ~~~`);

        if (links) links.add(dtube.canonical);
    } catch (error) {
        console.log(error);
    }

    return child;
}
