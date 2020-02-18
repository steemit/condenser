import React from 'react';

const regex = {
    sanitize: /^(https?:)?\/\/player.twitch.tv\/.*/i,
    main: /https?:\/\/(?:www.)?twitch.tv\/(?:(videos)\/)?([a-zA-Z0-9][\w]{3,24})/i,
};

export default regex;

// <iframe src="https://player.twitch.tv/?channel=tfue" frameborder="0" allowfullscreen="true" scrolling="no" height="378" width="620"></iframe>
export function validateIframeUrl(url) {
    const match = url.match(regex.sanitize);

    if (match) {
        return url;
    }

    return false;
}

export function normalizeEmbedUrl(url) {
    const match = url.match(regex.main);

    if (match && match.length >= 3) {
        if (match[1] === undefined) {
            return `https://player.twitch.tv/?autoplay=false&channel=${
                match[2]
            }`;
        }

        return `https://player.twitch.tv/?autoplay=false&video=${match[1]}`;
    }

    return false;
}

function extractContentId(data) {
    if (!data) return null;

    const m = data.match(regex.main);

    if (!m || m.length < 3) return null;

    return {
        id: m[1] === `videos` ? `?video=${m[2]}` : `?channel=${m[2]}`,
        url: m[0],
        canonical:
            m[1] === `videos`
                ? `https://player.twitch.tv/?video=${m[2]}`
                : `https://player.twitch.tv/?channel=${m[2]}`,
    };
}

export function embedNode(child, links /*images*/) {
    try {
        const data = child.data;
        const twitch = extractContentId(data);
        if (!twitch) return child;

        child.data = data.replace(
            twitch.url,
            `~~~ embed:${twitch.id} twitch ~~~`
        );

        if (links) links.add(twitch.canonical);
    } catch (error) {
        console.error(error);
    }

    return child;
}

export function genIframeMd(idx, id, w, h) {
    const url = `https://player.twitch.tv/${id}`;
    return (
        <div key={`twitch-${id}-${idx}`} className="videoWrapper">
            <iframe
                title="Twitch embedded player"
                src={url}
                width={w}
                height={h}
                frameBorder="0"
                allowFullScreen
            />
        </div>
    );
}
