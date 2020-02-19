import React from 'react';

/**
 * Regular expressions for detecting and validating provider URLs
 * @type {{htmlReplacement: RegExp, main: RegExp, sanitize: RegExp}}
 */
const regex = {
    sanitize: /^https:\/\/3speak.online\/embed\?v=([A-Za-z0-9\_\-\/]+)(&.*)?$/,
    main: /(?:https?:\/\/(?:(?:3speak.online\/watch\?v=)|(?:3speak.online\/embed\?v=)))([A-Za-z0-9\_\-\/]+)(&.*)?/i,
    htmlReplacement: /<a href="(https?:\/\/3speak.online\/watch\?v=([A-Za-z0-9\_\-\/]+))".*<img.*?><\/a>/i,
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
export function genIframeMd(idx, threespeakId, w, h) {
    const url = `https://3speak.online/embed?v=${threespeakId}`;
    return (
        <div key={`threespeak-${threespeakId}-${idx}`} className="videoWrapper">
            <iframe
                title="3Speak embedded player"
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
        return `https://3speak.online/embed?v=${match[1]}`;
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

    const match = data.match(regex.main);
    const url = match ? match[0] : null;
    if (!url) return null;
    const fullId = match[1];
    const id = fullId.split('/').pop();

    return {
        id,
        fullId,
        url,
        thumbnail: `https://img.3speakcontent.online/${id}/post.png`,
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
        const threespeak = extractContentId(data);
        if (!threespeak) return child;

        child.data = data.replace(
            threespeak.url,
            `~~~ embed:${threespeak.id} threespeak ~~~`
        );

        if (links) links.add(threespeak.canonical);
    } catch (error) {
        console.log(error);
    }

    return child;
}

/**
 * Pre-process HTML codes from the Markdown before it gets transformed
 * @param child
 * @returns {string}
 */
export function preprocessHtml(child) {
    try {
        if (typeof child === 'string') {
            // If typeof child is a string, this means we are trying to process the HTML
            // to replace the image/anchor tag created by 3Speak dApp
            const threespeak = extractContentId(child);
            if (threespeak) {
                child = child.replace(
                    regex.htmlReplacement,
                    `~~~ embed:${threespeak.fullId} threespeak ~~~`
                );
            }
        }
    } catch (error) {
        console.log(error);
    }

    return child;
}
