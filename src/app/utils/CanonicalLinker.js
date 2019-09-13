import Apps from 'steemscript/apps.json';

export function makeCanonicalLink(d) {
    let canonicalUrl = 'https://steemit.com' + d.link;

    if (d.json_metadata) {
        if (
            d.json_metadata.canonical_url &&
            typeof d.json_metadata.canonical_url === 'string'
        ) {
            const urlTester = new RegExp(/^https?:\/\//);
            if (urlTester.test(d.json_metadata.canonical_url)) {
                return d.json_metadata.canonical_url;
            }
        }

        /*
         * TODO: A number of apps listed in
         * https://github.com/bonustrack/steemscript/blob/master/apps.json
         * do not follow this standard. Audit reciprocating domains..
         */
        /*
        if (d.json_metadata.app && typeof d.json_metadata.app === 'string') {
            const hasAppTemplateData =
                d.json_metadata &&
                d.json_metadata.app &&
                d.category &&
                d.json_metadata.app.split('/').length === 2;
            if (hasAppTemplateData) {
                const app = d.json_metadata.app.split('/')[0];
                const hasAppData = Apps[app] && Apps[app].url_scheme;
                if (hasAppData) {
                    canonicalUrl = Apps[app].url_scheme
                        .split('{category}')
                        .join(d.category)
                        .split('{username}')
                        .join(d.author)
                        .split('{permlink}')
                        .join(d.permlink);
                }
            }
        }
        */
    }
    return canonicalUrl;
}
