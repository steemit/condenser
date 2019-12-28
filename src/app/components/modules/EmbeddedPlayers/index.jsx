import React from 'react';

import {
    genIframeMd as genDtubeIframeMd,
    validateIframeUrl as validateDtubeIframeUrl,
    normalizeEmbedUrl as normalizeDtubeEmbedUrl,
    embedNode as embedDtubeNode,
} from 'app/components/modules/EmbeddedPlayers/dtube';

import {
    genIframeMd as genTwitchIframeMd,
    validateIframeUrl as validateTwitchIframeUrl,
    normalizeEmbedUrl as normalizeTwitchEmbedUrl,
    embedNode as embedTwitchNode,
} from 'app/components/modules/EmbeddedPlayers/twitch';

import { validateIframeUrl as validateSoundcloudIframeUrl } from 'app/components/modules/EmbeddedPlayers/soundcloud';

import {
    genIframeMd as genYoutubeIframeMd,
    validateIframeUrl as validateYoutubeIframeUrl,
    normalizeEmbedUrl as normalizeYoutubeEmbedUrl,
    embedNode as embedYoutubeNode,
} from 'app/components/modules/EmbeddedPlayers/youtube';

import {
    genIframeMd as genVimeoIframeMd,
    validateIframeUrl as validateVimeoIframeUrl,
    normalizeEmbedUrl as normalizeVimeoEmbedUrl,
    embedNode as embedVimeoNode,
} from 'app/components/modules/EmbeddedPlayers/vimeo';

const supportedProviders = [
    {
        id: 'dtube',
        validateIframeUrlFn: validateDtubeIframeUrl,
        normalizeEmbedUrlFn: normalizeDtubeEmbedUrl,
        embedNodeFn: embedDtubeNode,
        genIframeMdFn: genDtubeIframeMd,
    },
    {
        id: 'twitch',
        validateIframeUrlFn: validateTwitchIframeUrl,
        normalizeEmbedUrlFn: normalizeTwitchEmbedUrl,
        embedNodeFn: embedTwitchNode,
        genIframeMdFn: embedTwitchNode,
    },
    {
        id: 'soundcloud',
        validateIframeUrlFn: validateSoundcloudIframeUrl,
        normalizeEmbedUrlFn: null,
        embedNodeFn: null,
        genIframeMdFn: null,
    },
    {
        id: 'youtube',
        validateIframeUrlFn: validateYoutubeIframeUrl,
        normalizeEmbedUrlFn: normalizeYoutubeEmbedUrl,
        embedNodeFn: embedYoutubeNode,
        genIframeMdFn: genYoutubeIframeMd,
    },
    {
        id: 'vimeo',
        validateIframeUrlFn: validateVimeoIframeUrl,
        normalizeEmbedUrlFn: normalizeVimeoEmbedUrl,
        embedNodeFn: embedVimeoNode,
        genIframeMdFn: genVimeoIframeMd,
    },
];

export default supportedProviders;

export function validateIframeUrl(url) {
    for (let pi = 0; pi < supportedProviders.length; pi += 1) {
        const provider = supportedProviders[pi];

        const validIframeUrl = provider.validateIframeUrlFn(url);

        if (validIframeUrl !== false) {
            console.log(`Found a valid ${provider.id} iframe URL`);
            return validIframeUrl;
        }
    }

    return false;
}

export function normalizeEmbedUrl(url) {
    for (let pi = 0; pi < supportedProviders.length; pi += 1) {
        const provider = supportedProviders[pi];

        if (typeof provider.normalizeEmbedUrlFn === 'function') {
            const validEmbedUrl = provider.normalizeEmbedUrlFn(url);

            if (validEmbedUrl !== false) {
                console.log(`Found a valid ${provider.id} embedded URL`);
                return validEmbedUrl;
            }
        }
    }

    return false;
}

export function embedNode(child, links, images) {
    for (let pi = 0; pi < supportedProviders.length; pi += 1) {
        const provider = supportedProviders[pi];

        if (typeof provider.embedNodeFn === 'function') {
            child = provider.embedNodeFn(child, links, images);
        }
    }

    return child;
}

function getProviderById(id) {
    for (let pi = 0; pi < supportedProviders.length; pi += 1) {
        const provider = supportedProviders[pi];

        if (provider.id === id) {
            return provider;
        }
    }

    return null;
}

function getProviderIds() {
    return supportedProviders.map(o => {
        return o.id;
    });
}

export function generateMd(section, idx, large) {
    let markdown = null;
    const supportedProvidersIds = getProviderIds();
    const regex = new RegExp(
        `^([A-Za-z0-9\\?\\=\\_\\-\\/\\.]+) (${supportedProvidersIds.join(
            '|'
        )})\\s?(\\d+)? ~~~`
    );
    const match = section.match(regex);

    if (match && match.length >= 3) {
        const id = match[1];
        const type = match[2];
        const startTime = match[3] ? parseInt(match[3]) : 0;
        const w = large ? 640 : 480,
            h = large ? 360 : 270;

        const provider = getProviderById(type);
        if (provider) {
            markdown = provider.genIframeMdFn(idx, id, w, h, startTime);
        } else {
            console.error('MarkdownViewer unknown embed type', type);
        }

        if (match[3]) {
            section = section.substring(
                `${id} ${type} ${startTime} ~~~`.length
            );
        } else {
            section = section.substring(`${id} ${type} ~~~`.length);
        }

        return {
            section,
            markdown,
        };
    }

    return null;
}
