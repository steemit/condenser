import { api } from '@steemit/steem-js';
import { ifHive } from 'app/utils/Community';
import stateCleaner from 'app/redux/stateCleaner';
import xhr from 'axios/index';
import demo from './demo';

export async function callBridge(method, params) {
    console.log(
        'call bridge',
        method,
        params && JSON.stringify(params).substring(0, 200)
    );

    return new Promise(function(resolve, reject) {
        api.call('bridge.' + method, params, function(err, data) {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

export const _list_temp = [
    85272851,
    85292735,
    85290072,
    85280316,
    85290308,
    85240810,
    85278992,
    85276721,
    85288504,
    85303662,
    85287965,
    85283636,
    85273231,
    85306764,
    85287931,
    85299660,
    85290948,
    85293459,
    85293772,
    85276721,
    85276833,
    85293901,
    85289063,
    85294452,
    85293865,
    85305460,
    85295587,
    85312343,
    85308672,
    85311375,
    85321625,
    85311891,
    85318584,
    85308914,
    85321248,
    85325744,
    85325042,
    85323948,
    85325276,
    85326597,
    85321023,
    85324738,
    85334812,
    85316255,
    85336207,
    85323051,
    85209019,
    85343852,
    85335737,
    85341505,
    85315644,
    85357437,
    85330639,
    85359441,
    85357235,
    85354823,
    85360899,
    85358726,
    85354772,
    85362926,
    85359018,
    85364554,
    85365012,
    85354766,
    85359759,
    85373516,
    85372593,
    85369615,
    85376101,
    85375555,
    85374894,
    85373035,
    85372824,
    85384412,
    85379917,
    85380730,
    85386878,
    85387066,
    85387144,
    85379011,
    85383898,
    85389324,
    85389409,
    85394706,
    85396049,
    85398648,
    85398733,
    85395487,
    85398888,
    85395479,
    85384940,
    85393986,
    85396311,
    85398505,
    85381494,
    85398122,
];

export const _user_list = [
    'roelandp',
    'blocktrades',
    'anyx',
    'ausbitbank',
    'gtg',
    'themarkymark',
    'lukestokes.mhth',
    'therealwolf',
    'netuoso',
    'innerhive',
    'z8teyb289qav9z',
    'ngc',
    'sirvotesalot',
    'cheetah',
    'mapxv',
    'xx0xx',
    'phusionphil',
    'cryptobrewmaster',
];

export async function getStateAsync(url, observer, ssr = false) {
    if (observer === undefined) observer = null;

    const { page, tag, sort, key } = parsePath(url);

    console.log('GSA', url, observer, ssr);
    let state = {
        accounts: {},
        community: {},
        content: {},
        discussion_idx: {},
        profiles: {},
    };
    let _blist = [];

    if (ssr) {
        // _blist = await getBlackList();
        _blist = _blist.concat(_list_temp);
        state['blacklist'] = _blist;
    }

    // load `content` and `discussion_idx`
    if (page == 'posts' || page == 'account') {
        let posts = await loadPosts(sort, tag, observer, ssr);
        let _content = ssr
            ? filter(posts['content'], _blist, _user_list)
            : posts['content'];
        state['content'] = _content;
        state['discussion_idx'] = posts['discussion_idx'];
    } else if (page == 'thread') {
        const posts = await loadThread(key[0], key[1]);
        const post_id =
            posts &&
            posts['content'] &&
            posts['content'][`${key[0].slice(1)}/${key[1]}`] &&
            posts['content'][`${key[0].slice(1)}/${key[1]}`]['post_id'];

        // console.log('----posts----',post_id)

        if (
            _user_list.indexOf(key[0].slice(1)) == -1 &&
            (post_id && _list_temp.indexOf(post_id) == -1)
        ) {
            state['content'] = posts['content'];
        }
    } else {
        // no-op
    }

    // append `community` key
    if (tag && ifHive(tag)) {
        try {
            state['community'][tag] = await callBridge('get_community', {
                name: tag,
                observer: observer,
            });
        } catch (e) {}
    }

    // for SSR, load profile on any profile page or discussion thread author
    const account =
        tag && tag[0] == '@'
            ? tag.slice(1)
            : page == 'thread' ? key[0].slice(1) : null;
    if (ssr && account) {
        // TODO: move to global reducer?
        const profile = await callBridge('get_profile', { account });
        if (profile && profile['name']) {
            if (_user_list.indexOf(account) > -1) {
                profile['post_count'] = 0;
            }
            state['profiles'][account] = profile;
        }
    }

    if (ssr) {
        // append `topics` key
        state['topics'] = await callBridge('get_trending_topics', {
            limit: 12,
        });
    }

    const cleansed = stateCleaner(state);
    return cleansed;
}

export async function getBlackList() {
    const res = await xhr
        .get('http://39.105.221.87:8081/steemit/blacklist', { timeout: 3000 })
        .catch(e => console.log('error', e));
    console.log('blacklist', res && res.data);
    return (res && res.data && res.data.data) || [];
}

function filter(posts, blacklist, userlist) {
    let content = {};
    for (var key in posts) {
        if (
            blacklist.indexOf(posts[key].post_id) === -1 &&
            userlist.indexOf(posts[key].author) === -1
        ) {
            content[key] = posts[key];
        }
    }
    return content;
}

async function loadThread(account, permlink) {
    const author = account.slice(1);
    const content = await callBridge('get_discussion', { author, permlink });
    return { content };
}

async function loadPosts(sort, tag, observer, ssr) {
    const account = tag && tag[0] == '@' ? tag.slice(1) : null;

    let posts;
    if (account) {
        const params = { sort, account, observer };
        posts = await callBridge('get_account_posts', params);
        if (_user_list.indexOf(account) > -1) {
            posts = [];
        }
    } else {
        const params = { sort, tag, observer };
        posts = await callBridge('get_ranked_posts', params);
        if (!tag) {
            posts = [].concat(demo, posts);
        }
    }
    // console.log('----posts.length----',posts.length)
    let content = {};
    let keys = [];
    for (var idx in posts) {
        const post = posts[idx];
        const key = post['author'] + '/' + post['permlink'];
        content[key] = post;
        keys.indexOf(key) == -1 && keys.push(key);
    }

    let discussion_idx = {};
    discussion_idx[tag] = {};
    discussion_idx[tag][sort] = keys;

    return { content, discussion_idx };
}

function parsePath(url) {
    // strip off query string
    url = url.split('?')[0];

    // strip off leading and trailing slashes
    if (url.length > 0 && url[0] == '/') url = url.substring(1, url.length);
    if (url.length > 0 && url[url.length - 1] == '/')
        url = url.substring(0, url.length - 1);

    // blank URL defaults to `trending`
    if (url === '') url = 'trending';

    const part = url.split('/');
    const parts = part.length;
    const sorts = [
        'trending',
        'promoted',
        'hot',
        'created',
        'payout',
        'payout_comments',
        'muted',
    ];
    const acct_tabs = [
        'blog',
        'feed',
        'posts',
        'comments',
        'replies',
        'payout',
    ];

    let page = null;
    let tag = null;
    let sort = null;
    let key = null;

    if (parts == 1 && sorts.includes(part[0])) {
        page = 'posts';
        sort = part[0];
        tag = '';
    } else if (parts == 2 && sorts.includes(part[0])) {
        page = 'posts';
        sort = part[0];
        tag = part[1];
    } else if (parts == 3 && part[1][0] == '@') {
        page = 'thread';
        tag = part[0];
        key = [part[1], part[2]];
    } else if (parts == 1 && part[0][0] == '@') {
        page = 'account';
        sort = 'blog';
        tag = part[0];
    } else if (parts == 2 && part[0][0] == '@') {
        if (acct_tabs.includes(part[1])) {
            page = 'account';
            sort = part[1];
        } else {
            // settings, followers, notifications, etc (no-op)
        }
        tag = part[0];
    } else {
        // no-op URL
    }

    return { page, tag, sort, key };
}
