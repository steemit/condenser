import React from 'react';

const regex = {
    sanitize: /^https:\/\/emb.d.tube\/\#\!\/([a-zA-Z0-9\-\.\/]+)$/,
    main: /https:\/\/(?:emb\.)?(?:d.tube\/\#\!\/(?:v\/)?)([a-zA-Z0-9\-\.\/]*)/,
    contentId: /(?:d\.tube\/#!\/(?:v\/)?([a-zA-Z0-9\-\.\/]*))+/,
};

export default regex;

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

// <iframe title="DTube embedded player" src="https://emb.d.tube/#!/lemwong/QmQqxBCkoVusMRwP6D9oBMRQdASFzABdKQxE7xLysfmsR6" width="640" height="360" frameborder="0" allowfullscreen=""></iframe>
export function validateIframeUrl(url) {
    const match = url.match(regex.sanitize);

    if (match) {
        return url;
    }

    return false;
}

export function normalizeEmbedUrl(url) {
    const match = url.match(regex.contentId);

    if (match && match.length >= 2) {
        return `https://emb.d.tube/#!/${match[1]}`;
    }

    return false;
}

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
