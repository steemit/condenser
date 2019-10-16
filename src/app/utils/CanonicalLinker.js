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
    return scheme
        .split('{category}')
        .join(post.category)
        .split('{username}')
        .join(post.author)
        .split('{permlink}')
        .join(post.permlink);
}

function allowed_app(app) {
    // apps which follow (reciprocate) canonical URLs (as of 2019-10-15)
    const whitelist = ['steemit', 'esteem', 'steempeak'];
    return whitelist.includes(app);
}

export function makeCanonicalLink(d) {
    const metadata = d.json_metadata;
    if (metadata) {
        const canonUrl = read_md_canonical(metadata);
        if (canonUrl) return canonUrl;

        const app = read_md_app(metadata);
        if (app && allowed_app(app)) {
            const scheme = Apps[app] ? Apps[app].url_scheme : null;
            if (scheme && d.category) {
                return build_scheme(scheme, d);
            }
        }
    }
    return 'https://steemit.com' + d.link;
}
