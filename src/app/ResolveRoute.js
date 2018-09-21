import GDPRUserList from './utils/GDPRUserList';

export const routeRegex = {
    PostsIndex: /^\/(@[\w\.\d-]+)\/feed\/?$/,
    UserProfile1: /^\/(@[\w\.\d-]+)\/?$/,
    UserProfile2: /^\/(@[\w\.\d-]+)\/(blog|posts|comments|recommended|transfers|curation-rewards|author-rewards|permissions|created|recent-replies|feed|password|followed|followers|settings)\/?$/,
    UserProfile3: /^\/(@[\w\.\d-]+)\/[\w\.\d-]+/,
    UserEndPoints: /^(blog|posts|comments|recommended|transfers|curation-rewards|author-rewards|permissions|created|recent-replies|feed|password|followed|followers|settings)$/,
    CategoryFilters: /^\/(hot|votes|responses|trending|trending30|promoted|cashout|payout|payout_comments|created|active)\/?$/gi,
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
    if (path.match(/^\/tags\/?/)) {
        return { page: 'Tags' };
    }
    if (path === '/tos.html') {
        return { page: 'Tos' };
    }
    if (path === '/change_password') {
        return { page: 'ChangePassword' };
    }
    if (path === '/create_account') {
        return { page: 'CreateAccount' };
    }
    if (path === '/approval') {
        return { page: 'Approval' };
    }
    if (path === '/recover_account_step_1') {
        return { page: 'RecoverAccountStep1' };
    }
    if (path === '/recover_account_step_2') {
        return { page: 'RecoverAccountStep2' };
    }
    if (path === '/waiting_list.html') {
        return { page: 'WaitingList' };
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
    let match = path.match(routeRegex.PostsIndex);
    if (match) {
        if (GDPRUserList.includes(match[1].substring(1))) {
            return { page: 'NotFound' };
        }
        return { page: 'PostsIndex', params: ['home', match[1]] };
    }
    match =
        path.match(routeRegex.UserProfile1) ||
        // @user/"posts" is deprecated in favor of "comments" as of oct-2016 (#443)
        path.match(routeRegex.UserProfile2);
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
    match =
        path.match(
            /^\/(hot|votes|responses|trending|trending30|promoted|cashout|payout|payout_comments|created|active)\/?$/
        ) ||
        path.match(
            /^\/(hot|votes|responses|trending|trending30|promoted|cashout|payout|payout_comments|created|active)\/([\w\d-]+)\/?$/
        );
    if (match) {
        return { page: 'PostsIndex', params: match.slice(1) };
    }
    return { page: 'NotFound' };
}
