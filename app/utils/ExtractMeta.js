import extractContent from 'app/utils/ExtractContent';
import {objAccessor} from 'app/utils/Accessors';

const site_desc = 'Steemit is a social media platform where everyone gets paid for creating and curating content. It leverages a robust digital points system, called Steem, that supports real value for digital rewards through market price discovery and liquidity';

function addSiteMeta(metas) {
    metas.push({title: 'Steemit'});
    metas.push({property: 'og:type', content: 'website'});
    metas.push({property: 'og:site_name', content: 'Steemit'});
    metas.push({property: 'og:title', content: 'Steemit'});
    metas.push({property: 'og:description', content: site_desc});
    metas.push({property: 'og:image', content: 'https://steemit.com/images/steemit-share.png'});
    metas.push({property: 'fb:app_id', content: $STM_Config.fb_app});
    metas.push({name: 'twitter:card', content: 'summary'});
    metas.push({name: 'twitter:site', content: '@steemit'});
    metas.push({name: 'twitter:title', content: 'Steemit'});
    metas.push({name: 'twitter:description', site_desc});
    metas.push({name: 'twitter:image', content: 'https://steemit.com/images/steemit-share.png'});
}

export default function extractMeta(chain_data, rp) {
    const metas = [];
    if (rp.username && rp.slug) { // post
        const post = `${rp.username}/${rp.slug}`;
        const content = chain_data.content[post];
        if (content && content.id !== '0.0.0') { // API currently returns 'false' data with id 0.0.0 for posts that do not exist
            const d = extractContent(objAccessor, content, false);
            const url   = 'https://steemit.com' + d.link;
            const title = d.title + ' — Steemit';
            const desc  = d.desc + " by " + d.author;
            const image = d.image_link
            const {category, created} = d

            // Standard meta
            metas.push({title});
            metas.push({canonical: url});
            metas.push({name: 'description',         content: desc});

            // Open Graph data
            metas.push({property: 'og:title',        content: title});
            metas.push({property: 'og:type',         content: 'article'});
            metas.push({property: 'og:url',          content: url});
            metas.push({property: 'og:image',        content: image || 'https://steemit.com/images/steemit-share.png'});
            metas.push({property: 'og:description',  content: desc});
            metas.push({property: 'og:site_name',    content: 'Steemit'});
            metas.push({property: 'fb:app_id',       content: $STM_Config.fb_app});
            metas.push({property: 'article:tag',     content: category});
            metas.push({property: 'article:published_time', content: created});

            // Twitter card data
            metas.push({name: 'twitter:card',        content: 'summary'});
            metas.push({name: 'twitter:site',        content: '@steemit'});
            metas.push({name: 'twitter:title',       content: title});
            metas.push({name: 'twitter:description', content: desc});
            metas.push({name: 'twitter:image',       content: image || 'https://steemit.com/images/steemit-twshare.png'});
        } else {
            addSiteMeta(metas);
        }
    } else { // site
        addSiteMeta(metas);
    }
    return metas;
}
