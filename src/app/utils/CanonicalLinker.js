import Apps from 'steemscript/apps.json';

function read_md_app(metadata) {
    return metadata &&
        metadata.app &&
        typeof metadata.app === 'string' &&
        metadata.app.split('/').length === 2
        ? metadata.app.split('/')[0]
        : null;
}

function read_md_canonical(metadata) {
    const url =
        metadata.canonical_url && typeof metadata.canonical_url === 'string'
            ? metadata.canonical_url
            : null;

    const saneUrl = new RegExp(/^https?:\/\//);
    return saneUrl.test(url) ? url : null;
}

function build_scheme(scheme, post) {
    // https://github.com/bonustrack/steemscript/blob/master/apps.json
    let tempCategory = post.category || '';

    const tags = post.json_metadata.tags || [];

    // Leave Options 1 and 2 uncommented for a combination of both approaches
    // Option 1: Replace hive-xxxxxx in the URL with the community name. This doesn't impact non-community posts
    const communityTitle = post.community_title || `#${tempCategory}` || '';
    const sanitizedTitle = communityTitle.replace(/[^a-zA-Z0-9 ]/g, '').trim();
    const urlFriendlyTitle = sanitizedTitle.replace(/\s+/g, '-').toLowerCase();
    if (urlFriendlyTitle) {
        tempCategory = urlFriendlyTitle;
    }

    // Option 2: Replace hive-xxxxxx in the URL with the first tag of a post
    if (tempCategory.startsWith('hive-') && tags.length > 0) {
        const firstTag = tags[0].startsWith('#')
            ? tags[0].substring(1)
            : tags[0];
        tempCategory =
            firstTag.startsWith('hive-') && tags.length > 1
                ? tags[1]
                : firstTag; // Sometimes the first tag is still the community & need to check if there's a second tag
        tempCategory = tempCategory.startsWith('#')
            ? tempCategory.substring(1)
            : tempCategory;
    }

    return scheme
        .split('{category}')
        .join(tempCategory)
        .split('{username}')
        .join(post.author)
        .split('{permlink}')
        .join(post.permlink);
}

function allowed_app(app) {
    // apps which follow (reciprocate) canonical URLs (as of 2019-10-15)
    const whitelist = ['steemit', 'steempeak', 'travelfeed'];
    return whitelist.includes(app);
}

export function makeCanonicalLink(post, metadata) {
    let scheme;

    if (metadata) {
        const canonUrl = read_md_canonical(metadata);
        if (canonUrl) return canonUrl;

        const app = read_md_app(metadata);
        if (app && allowed_app(app)) {
            scheme = Apps[app] ? Apps[app].url_scheme : null;
        }
    }
    if (!scheme) scheme = Apps['steemit'].url_scheme;
    return build_scheme(scheme, post);
}
