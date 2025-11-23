'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = extractMeta;

var _ExtractContent = require('app/utils/ExtractContent');

var _Accessors = require('app/utils/Accessors');

var _CanonicalLinker = require('app/utils/CanonicalLinker.js');

var site_desc = 'Communities without borders. A social network owned and operated by its users, powered by Steem.';

function addSiteMeta(metas) {
    metas.push({ title: 'Steemit' });
    metas.push({ name: 'description', content: site_desc });
    metas.push({ property: 'og:type', content: 'website' });
    metas.push({ property: 'og:site_name', content: 'Steemit' });
    metas.push({ property: 'og:title', content: 'Steemit' });
    metas.push({ property: 'og:description', content: site_desc });
    metas.push({
        property: 'og:image',
        content: 'https://steemit.com/images/steemit.png'
    });
    metas.push({ property: 'fb:app_id', content: $STM_Config.fb_app });
    metas.push({ name: 'twitter:card', content: 'summary' });
    metas.push({ name: 'twitter:site', content: '@steemit' });
    metas.push({ name: 'twitter:title', content: '#Steemit' });
    metas.push({ name: 'twitter:description', site_desc: site_desc });
    metas.push({
        name: 'twitter:image',
        content: 'https://steemit.com/images/steemit.png'
    });
}

function addPostMeta(metas, content, profile, store) {
    var state = store.getState();
    var site_domain = state.app.get('site_domain') ? state.app.get('site_domain') : 'steemit.com';
    var profile_image = 'https://' + site_domain + '/avatar/' + content.author;
    var category = content.category,
        created = content.created,
        body = content.body,
        json_metadata = content.json_metadata;

    var isReply = content.depth > 0;

    var title = content.title + ' — Steemit';
    var desc = (0, _ExtractContent.extractBodySummary)(body, isReply) + ' by ' + content.author;
    var image_link = (0, _ExtractContent.extractImageLink)(json_metadata, body);

    var canonicalUrl = (0, _CanonicalLinker.makeCanonicalLink)(content, json_metadata);
    var localUrl = (0, _CanonicalLinker.makeCanonicalLink)(content, null);
    var image = image_link || profile_image;
    var card_type = 'summary_large_image';
    if (!image_link && profile_image) {
        card_type = 'summary';
    }

    // Standard meta
    metas.push({ title: title });
    metas.push({ canonical: canonicalUrl });
    metas.push({ name: 'description', content: desc });

    // Open Graph data
    metas.push({ name: 'og:title', content: title });
    metas.push({ name: 'og:type', content: 'article' });
    metas.push({ name: 'og:url', content: localUrl });
    metas.push({
        name: 'og:image',
        content: image || 'https://' + site_domain + '/images/steemit.png'
    });
    metas.push({ name: 'og:description', content: desc });
    metas.push({ name: 'og:site_name', content: 'Steemit' });
    metas.push({ name: 'fb:app_id', content: $STM_Config.fb_app });
    metas.push({ name: 'article:tag', content: category });
    metas.push({
        name: 'article:published_time',
        content: created
    });

    // Twitter card data
    metas.push({
        name: 'twitter:card',
        content: card_type
    });
    metas.push({ name: 'twitter:site', content: '@steemit' });
    metas.push({ name: 'twitter:title', content: title });
    metas.push({ name: 'twitter:description', content: desc });
    metas.push({
        name: 'twitter:image',
        content: image || 'https://' + site_domain + '/images/steemit-twshare-2.png'
    });
}

function addAccountMeta(metas, accountname, profile) {
    var name = profile.name,
        about = profile.about,
        profile_image = profile.profile_image;


    name = name || accountname;
    about = about || 'Steemit: Communities Without Borders.';
    profile_image = profile_image || 'https://steemit.com/images/steemit-twshare-2.png';

    // Set profile tags
    var title = '@' + accountname;
    var desc = 'The latest posts from ' + name + '. Follow me at @' + accountname + '. ' + about;

    // Standard meta
    metas.push({ name: 'description', content: desc });

    // Twitter card data
    metas.push({ name: 'twitter:card', content: 'summary' });
    metas.push({ name: 'twitter:site', content: '@steemit' });
    metas.push({ name: 'twitter:title', content: title });
    metas.push({ name: 'twitter:description', content: desc });
    metas.push({ name: 'twitter:image', content: profile_image });
}

function readProfile(chain_data, account) {
    var profiles = chain_data.profiles;
    if (!chain_data.profiles[account]) return {};
    return chain_data.profiles[account]['metadata']['profile'];
}

function extractMeta(chain_data, rp, store) {
    var username = void 0;
    var content = void 0;
    if (rp.username && rp.slug) {
        // post
        var obj = chain_data.content[rp.username + '/' + rp.slug];
        content = obj && obj.id !== '0.0.0' ? obj : null;
        username = content ? content.author : null;
    } else if (rp.accountname) {
        // user profile root
        username = rp.accountname;
    }

    var profile = username ? readProfile(chain_data, username) : null;

    var metas = [];
    if (content) {
        addPostMeta(metas, content, profile, store);
    } else if (username) {
        addAccountMeta(metas, username, profile);
    } else {
        addSiteMeta(metas);
    }

    return metas;
}