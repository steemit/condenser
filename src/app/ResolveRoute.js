import GDPRUserList from './utils/GDPRUserList';

export const routeRegex = {
    CommunityRoles: /^\/(roles)+\/([\w\.\d-]+)/gi,
    UserFeed: /^\/(@[\w\.\d-]+)\/feed\/?$/,
    UserProfile: /^\/(@[\w\.\d-]+)(?:\/(blog|posts|comments|recent-replies|payout|feed|followed|followers|settings|notifications))?\/?$/,
    CategoryFilters: /^\/(hot|trending|promoted|payout|payout_comments|muted|created)(?:\/([\w\d-]+))?\/?$/i,
    PostNoCategory: /^\/(@[\w\.\d-]+)\/([\w\d-]+)/,
    Post: /^\/([\w\d\-\/]+)\/(\@[\w\d\.-]+)\/([\w\d-]+)\/?($|\?)/,
    PostJson: /^\/([\w\d\-\/]+)\/(\@[\w\d\.-]+)\/([\w\d-]+)(\.json)$/,
    UserJson: /^\/(@[\w\.\d-]+)(\.json)$/,
    UserNameJson: /^.*(?=(\.json))/,
    Search: /^\/(search)\/(newest|popularity|relevance)(?:\/([\w\d-]+))?\/?$/i,
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

    // /roles/hive-123
    let match = path.match(routeRegex.CommunityRoles);
    if (match)
        return { page: 'CommunityRoles', params: [match[0].split('/')[2]] };

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

    // /search, /search/searchOrder/searchTerm
    match = path.match(routeRegex.Search);
    if (match)
        return { page: 'SearchIndex', params: match.slice(1, match.length) };

    // -----------

    // developer
    if (path === '/xss/test' && process.env.NODE_ENV === 'development')
        return { page: 'XSSTest' };
    if (path === '/benchmark' && process.env.OFFLINE_SSR_TEST)
        return { page: 'Benchmark' };

    return { page: 'NotFound' };
}
