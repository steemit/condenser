import GDPRUserList from './utils/GDPRUserList';

const reg = pattern => {
    pattern = pattern
        .replace('<account>', '(@[\\w\\.\\d-]+)')
        .replace(
            '<account-tab>',
            '(blog|posts|comments|replies|payout|feed|followed|followers|settings|notifications)'
        )
        .replace(
            '<sort>',
            '(hot|trending|promoted|payout|payout_comments|muted|created)'
        )
        .replace('<tag>', '([\\w\\W\\d-]{2,32})')
        .replace('<permlink>', '([\\w\\d-]+)')
        .replace('/', '\\/');
    return new RegExp('^\\/' + pattern + '$');
};

export const routeRegex = {
    CommunityRoles: reg('roles/<tag>'),
    UserFeed: reg('<account>/feed/?'),
    UserProfile: reg('<account>(?:/<account-tab>)?/?'),
    CategoryFilters: reg('<sort>(?:/<tag>)?/?'),
    PostNoCategory: reg('<account>/<permlink>'),
    Post: reg('<tag>/<account>/<permlink>/?'),
    PostJson: reg('<tag>/<account>/<permlink>(\\.json)'),
    UserJson: reg('<account>(\\.json)'),
    UserRss: reg('<account>(\\.rss)'),
    CategoryFiltersRss: reg('<sort>/<tag>?(\\.rss)'),
    Search: reg('search'),
};

export default function resolveRoute(path) {
    // index
    if (path === '/') return { page: 'PostsIndex', params: ['trending'] };

    // static
    if (path === '/welcome') return { page: 'Welcome' };
    if (path === '/faq.html') return { page: 'Faq' };
    if (path === '/about.html') return { page: 'About' };
    if (path === '/support.html') return { page: 'Support' };
    if (path === '/privacy.html') return { page: 'Privacy' };
    if (path === '/tos.html') return { page: 'Tos' };

    // general functions
    if (path === '/login.html') return { page: 'Login' };
    if (path === '/submit.html') return { page: 'SubmitPost' };
    if (path === '/communities') return { page: 'Communities' };
    if (path === '/tags') return { page: 'Tags' };
    if (path === '/rewards') return { page: 'Rewards' };

    // /roles/hive-123
    let match = path.match(routeRegex.CommunityRoles);
    if (match) return { page: 'CommunityRoles', params: [match[1]] };

    // /@user/feed
    match = path.match(routeRegex.UserFeed);
    if (match)
        return GDPRUserList.includes(match[1].substring(1))
            ? { page: 'NotFound' }
            : { page: 'PostsIndex', params: ['home', match[1]] };

    // /@user, /@user/blog, /@user/settings
    match = path.match(routeRegex.UserProfile);
    if (match)
        return GDPRUserList.includes(match[1].substring(1))
            ? { page: 'NotFound' }
            : { page: 'UserProfile', params: match.slice(1) };

    // /@user/permlink (redirects to /category/@user/permlink)
    match = path.match(routeRegex.PostNoCategory);
    if (match)
        return GDPRUserList.includes(match[1].substring(1))
            ? { page: 'NotFound' }
            : { page: 'PostNoCategory', params: match.slice(1) };

    // /category/@user/permlink
    match = path.match(routeRegex.Post);
    if (match)
        return GDPRUserList.includes(match[2].substring(1))
            ? { page: 'NotFound' }
            : { page: 'Post', params: match.slice(1) };

    // /trending, /trending/category
    match = path.match(routeRegex.CategoryFilters);
    if (match) return { page: 'PostsIndex', params: match.slice(1) };

    // /search, /search?q=searchTerm&s=searchOrder
    match = path.match(routeRegex.Search);
    if (match) return { page: 'SearchIndex' };

    // -----------

    // developer
    if (path === '/xss/test' && process.env.NODE_ENV === 'development')
        return { page: 'XSSTest' };
    if (path === '/benchmark' && process.env.OFFLINE_SSR_TEST)
        return { page: 'Benchmark' };

    return { page: 'NotFound' };
}
