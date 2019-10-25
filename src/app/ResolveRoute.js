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
};

export default function resolveRoute(path) {
    if (path === '/') {
        return { page: 'PostsIndex', params: ['trending'] };
    }
    if (path === '/about.html') {
        return { page: 'About' };
    }
    if (path === '/welcome') {
        return { page: 'Welcome' };
    }
    if (path === '/faq.html') {
        return { page: 'Faq' };
    }
    if (path === '/login.html') {
        return { page: 'Login' };
    }
    if (path === '/privacy.html') {
        return { page: 'Privacy' };
    }
    if (path === '/support.html') {
        return { page: 'Support' };
    }
    if (path === '/xss/test' && process.env.NODE_ENV === 'development') {
        return { page: 'XSSTest' };
    }
    if (path === '/benchmark' && process.env.OFFLINE_SSR_TEST) {
        return { page: 'Benchmark' };
    }
    if (path === '/tags') {
        return { page: 'Tags' };
    }
    if (path === '/communities') {
        return { page: 'Communities' };
    }
    if (path === '/tos.html') {
        return { page: 'Tos' };
    }
    if (path === '/change_password') {
        return { page: 'ChangePassword' };
    }
    if (path === '/recover_account_step_1') {
        return { page: 'RecoverAccountStep1' };
    }
    if (path === '/market') {
        return { page: 'Market' };
    }
    if (path === '/~witnesses') {
        return { page: 'Witnesses' };
    }
    if (path === '/submit.html') {
        return { page: 'SubmitPost' };
    }
    let match = path.match(routeRegex.CommunityRoles);
    if (match) {
        return { page: 'CommunityRoles', params: [match[0].split('/')[2]] };
    }
    match = path.match(routeRegex.UserFeed);
    if (match) {
        if (GDPRUserList.includes(match[1].substring(1))) {
            return { page: 'NotFound' };
        }
        return { page: 'PostsIndex', params: ['home', match[1]] };
    }

    match = path.match(routeRegex.UserProfile);
    if (match) {
        if (GDPRUserList.includes(match[1].substring(1))) {
            return { page: 'NotFound' };
        }
        return { page: 'UserProfile', params: match.slice(1) };
    }
    match = path.match(routeRegex.PostNoCategory);
    if (match) {
        if (GDPRUserList.includes(match[1].substring(1))) {
            return { page: 'NotFound' };
        }
        return { page: 'PostNoCategory', params: match.slice(1) };
    }
    match = path.match(routeRegex.Post);
    if (match) {
        if (GDPRUserList.includes(match[2].substring(1))) {
            return { page: 'NotFound' };
        }
        return { page: 'Post', params: match.slice(1) };
    }
    match = path.match(routeRegex.CategoryFilters);
    if (match) {
        return { page: 'PostsIndex', params: match.slice(1) };
    }
    return { page: 'NotFound' };
}
