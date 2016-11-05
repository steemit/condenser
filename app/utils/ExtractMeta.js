import extractContent from 'app/utils/ExtractContent';
import {objAccessor} from 'app/utils/Accessors';
import { APP_NAME, SITE_DESCRIPTION } from 'config/client_config';

function addSiteMeta(metas) {
    metas.push({title: APP_NAME});
    metas.push({property: 'og:type', content: 'website'});
    metas.push({property: 'og:site_name', content: APP_NAME});
    metas.push({property: 'og:title', content: APP_NAME});
    metas.push({property: 'og:description', content: SITE_DESCRIPTION});
    metas.push({property: 'og:image', content: 'https://golos.io/images/golos-share.png'});
    metas.push({property: 'fb:app_id', content: $STM_Config.fb_app});
    metas.push({name: 'twitter:card', content: 'summary'});
    metas.push({name: 'twitter:site', content: '@goloschain'}); //TODO
    metas.push({name: 'twitter:title', content: APP_NAME});
    metas.push({name: 'twitter:description', site_desc: SITE_DESCRIPTION});
    metas.push({name: 'twitter:image', content: 'https://golos.io/images/golos-share.png'});
}

export default function extractMeta(chain_data, rp) {
    const metas = [];
    if (rp.username && rp.slug) { // post
        const post = `${rp.username}/${rp.slug}`;
        const content = chain_data.content[post];
        if (content) {
            const d = extractContent(objAccessor, content, false);
            const url = 'https://golos.io' + d.link;
            const title = d.title + ' — Голос';
            const image = d.image_link ? d.image_link : 'https://golos.io/images/golos-share.png';
            const twimage = d.image_link ? d.image_link : 'https://golos.io/images/golos-twshare.png';
            metas.push({title});
            metas.push({canonical: url});
            metas.push({name: 'description', content: d.desc});
            metas.push({property: 'og:type', content: 'article'});
            metas.push({property: 'og:url', content: url});
            metas.push({property: 'og:site_name', content: APP_NAME});
            metas.push({property: 'og:title', content: title});
            metas.push({property: 'og:description', content: d.desc});
            metas.push({property: 'og:image', content: image});
            metas.push({property: 'fb:app_id', content: $STM_Config.fb_app});
            metas.push({name: 'twitter:card', content: 'summary'});
            metas.push({name: 'twitter:site', content: '@goloschain'});
            metas.push({name: 'twitter:title', content: title});
            metas.push({name: 'twitter:description', content: d.desc});
            metas.push({name: 'twitter:image', content: twimage});
        } else {
            addSiteMeta(metas);
        }
    } else { // site
        addSiteMeta(metas);
    }
    return metas;
}
