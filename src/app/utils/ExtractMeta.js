import extractContent from 'app/utils/ExtractContent';
import { objAccessor } from 'app/utils/Accessors';
import normalizeProfile from 'app/utils/NormalizeProfile';
import { makeCanonicalLink } from 'app/utils/CanonicalLinker.js';

const site_desc =
    'Steemit is a social media platform where everyone gets paid for creating and curating content. It leverages a robust digital points system (Steem) for digital rewards.';

function addSiteMeta(metas) {
    metas.push({ title: 'Steemit' });
    metas.push({ name: 'description', content: site_desc });
    metas.push({ property: 'og:type', content: 'website' });
    metas.push({ property: 'og:site_name', content: 'Steemit' });
    metas.push({ property: 'og:title', content: 'Steemit' });
    metas.push({ property: 'og:description', content: site_desc });
    metas.push({
        property: 'og:image',
        content: 'https://steemit.com/images/steemit.png',
    });
    metas.push({ property: 'fb:app_id', content: $STM_Config.fb_app });
    metas.push({ name: 'twitter:card', content: 'summary' });
    metas.push({ name: 'twitter:site', content: '@steemit' });
    metas.push({ name: 'twitter:title', content: '#Steemit' });
    metas.push({ name: 'twitter:description', site_desc });
    metas.push({
        name: 'twitter:image',
        content: 'https://steemit.com/images/steemit.png',
    });
}

export default function extractMeta(chain_data, rp) {
    const metas = [];
    if (rp.username && rp.slug) {
        // post
        const post = `${rp.username}/${rp.slug}`;
        const content = chain_data.content[post];
        const author = chain_data.accounts[rp.username];
        const profile = normalizeProfile(author);
        if (content && content.id !== '0.0.0') {
            // API currently returns 'false' data with id 0.0.0 for posts that do not exist
            const d = extractContent(objAccessor, content, false);
            const url = 'https://steemit.com' + d.link;
            const canonicalUrl = makeCanonicalLink(d);
            const title = d.title + ' — Steemit';
            const desc = d.desc + ' by ' + d.author;
            const image = d.image_link || profile.profile_image;
            const { category, created } = d;

            // Standard meta
            metas.push({ title });
            metas.push({ canonical: canonicalUrl });
            metas.push({ name: 'description', content: desc });

            // Open Graph data
            metas.push({ name: 'og:title', content: title });
            metas.push({ name: 'og:type', content: 'article' });
            metas.push({ name: 'og:url', content: url });
            metas.push({
                name: 'og:image',
                content: image || 'https://steemit.com/images/steemit.png',
            });
            metas.push({ name: 'og:description', content: desc });
            metas.push({ name: 'og:site_name', content: 'Steemit' });
            metas.push({ name: 'fb:app_id', content: $STM_Config.fb_app });
            metas.push({ name: 'article:tag', content: category });
            metas.push({
                name: 'article:published_time',
                content: created,
            });

            // Twitter card data
            metas.push({
                name: 'twitter:card',
                content: image ? 'summary_large_image' : 'summary',
            });
            metas.push({ name: 'twitter:site', content: '@steemit' });
            metas.push({ name: 'twitter:title', content: title });
            metas.push({ name: 'twitter:description', content: desc });
            metas.push({
                name: 'twitter:image',
                content:
                    image || 'https://steemit.com/images/steemit-twshare-2.png',
            });
        } else {
            addSiteMeta(metas);
        }
    } else if (rp.accountname) {
        // user profile root
        const account = chain_data.accounts[rp.accountname];
        let { name, about, profile_image } = normalizeProfile(account);
        if (name == null) name = account.name;
        if (about == null)
            about =
                'Join thousands on steemit who share, post and earn rewards.';
        if (profile_image == null)
            profile_image = 'https://steemit.com/images/steemit-twshare-2.png';
        // Set profile tags
        const title = `@${account.name}`;
        const desc = `The latest posts from ${name}. Follow me at @${
            account.name
        }. ${about}`;
        const image = profile_image;

        // Standard meta
        metas.push({ name: 'description', content: desc });

        // Twitter card data
        metas.push({ name: 'twitter:card', content: 'summary' });
        metas.push({ name: 'twitter:site', content: '@steemit' });
        metas.push({ name: 'twitter:title', content: title });
        metas.push({ name: 'twitter:description', content: desc });
        metas.push({ name: 'twitter:image', content: image });
    } else {
        // site
        addSiteMeta(metas);
    }
    return metas;
}
