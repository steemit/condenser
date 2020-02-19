import React from 'react';
import YoutubePreview from 'app/components/elements/YoutubePreview';

/**
 * Regular expressions for detecting and validating provider URLs
 * @type {{htmlReplacement: RegExp, main: RegExp, sanitize: RegExp}}
 */
const regex = {
    sanitize: /^(https?:)?\/\/www.youtube.com\/embed\/.*/i,
    //main: new RegExp(urlSet({ domain: '(?:(?:.*.)?youtube.com|youtu.be)' }), flags),
    main: /(?:https?:\/\/)(?:www\.)?(?:(?:youtube.com\/watch\?v=)|(?:youtu.be\/)|(?:youtube.com\/embed\/))([A-Za-z0-9\_\-]+)[^ ]*/i,
    contentId: /(?:(?:youtube.com\/watch\?v=)|(?:youtu.be\/)|(?:youtube.com\/embed\/))([A-Za-z0-9\_\-]+)/i,
};

export default regex;

/**
 * Check if the iframe code in the post editor is to an allowed URL
 * <iframe width="560" height="315" src="https://www.youtube.com/embed/KOnk7Nbqkhs" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
 * @param url
 * @returns {boolean|*}
 */
export function validateIframeUrl(url) {
    const match = url.match(regex.sanitize);

    if (match) {
        // strip query string (yt: autoplay=1,controls=0,showinfo=0, etc)
        return url.replace(/\?.+$/, '');
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
        return `https://youtube.com/embed/${match[1]}`;
    }

    return false;
}

/**
 * Extract the content ID and other metadata from the URL
 * @param data
 * @returns {null|{id: *, canonical: string, url: *}}
 */
export function extractContentId(data) {
    if (!data) return null;

    const m1 = data.match(regex.main);
    const url = m1 ? m1[0] : null;

    if (!url) return null;

    const m2 = url.match(regex.contentId);
    const id = m2 && m2.length >= 2 ? m2[1] : null;

    if (!id) return null;

    const startTime = url.match(/t=(\d+)s?/);

    return {
        id,
        url,
        startTime: startTime ? startTime[1] : 0,
        thumbnail: 'https://img.youtube.com/vi/' + id + '/0.jpg',
    };
}

/**
 * Replaces the URL with a custom Markdown for embedded players
 * @param child
 * @param links
 * @returns {*}
 */
export function embedNode(child, links, images) {
    try {
        const yt = extractContentId(child.data);

        if (!yt) return child;

        if (yt.startTime) {
            child.data = child.data.replace(
                yt.url,
                `~~~ embed:${yt.id} youtube ${yt.startTime} ~~~`
            );
        } else {
            child.data = child.data.replace(
                yt.url,
                `~~~ embed:${yt.id} youtube ~~~`
            );
        }

        if (links) links.add(yt.url);
        if (images) images.add(yt.thumbnail);
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
    return (
        <YoutubePreview
            key={`youtube-${id}-${idx}`}
            width={w}
            height={h}
            youTubeId={id}
            startTime={startTime}
            frameBorder="0"
            allowFullScreen="true"
        />
    );
}
