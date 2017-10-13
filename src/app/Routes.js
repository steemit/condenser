export const routeRegex = {
    PostsIndex: /^\/(@[\w.\d-]+)\/feed\/?$/,
    UserProfile1: /^\/(@[\w.\d-]+)\/?$/,
    UserProfile2: /^\/(@[\w.\d-]+)\/(blog|posts|comments|recommended|transfers|curation-rewards|author-rewards|permissions|created|recent-replies|feed|password|followed|followers|settings)\/?$/,
    UserProfile3: /^\/(@[\w.\d-]+)\/[\w.\d-]+/,
    UserEndPoints: /^(blog|posts|comments|recommended|transfers|curation-rewards|author-rewards|permissions|created|recent-replies|feed|password|followed|followers|settings)$/,
    CategoryFilters: /^\/(hot|votes|responses|trending|trending30|promoted|cashout|payout|payout_comments|created|active)\/?$/ig,
    PostNoCategory: /^\/(@[\w.\d-]+)\/([\w\d-]+)/,
    Post: /^\/([\w\d\-\/]+)\/(\@[\w\d.-]+)\/([\w\d-]+)\/?($|\?)/,
    PostJson: /^\/([\w\d\-\/]+)\/(\@[\w\d.-]+)\/([\w\d-]+)(\.json)$/,
    UserJson: /^\/(@[\w.\d-]+)(\.json)$/,
    UserNameJson: /^.*(?=(\.json))/,
};

export const routeRegexNew = {
    UserProfile1: /^\/([\w.\d-]+)\/?$/,
    UserProfile2: /^\/([\w.\d-]+)\/(blog|posts|comments|recommended|transfers|curation-rewards|author-rewards|permissions|created|recent-replies|feed|password|followed|followers|settings)\/?$/,
    UserProfile3: /^\/([\w.\d-]+)\/[\w.\d-]+/,
    UserEndPoints: /^(blog|posts|comments|recommended|transfers|curation-rewards|author-rewards|permissions|created|recent-replies|feed|password|followed|followers|settings)$/,
    PostsIndex: /^\/t\/([\w\d-]+)\/(hot|votes|responses|trending|trending30|promoted|cashout|payout|payout_comments|created|active)\/?$/,
    PostsIndexUserFeed: /^\/([\w.\d-]+)\/feed\/?$/,
    Post: /^\/([\w\d.-]+)\/([\w\d-]+)\/?($|\?)/,
    PostJson: /^\/([\w\d.-]+)\/([\w\d-]+)(\.json)$/,
    UserJson: /^\/([\w.\d-]+)(\.json)$/,
    UserNameJson: /^.*(?=(\.json))/,
};

export function resolveRoute(path)
{
    if (path === '/') {
        return {page: 'PostsIndex', params: ['trending']};
    }
    if (path === '/about.html') {
        return {page: 'About'};
    }
    if (path === '/welcome') {
        return {page: 'Welcome'};
    }
    if (path === '/faq.html') {
        return {page: 'Faq'};
    }
    if (path === '/login.html') {
        return {page: 'Login'};
    }
    if (path === '/privacy.html') {
        return {page: 'Privacy'};
    }
    if (path === '/support.html') {
        return {page: 'Support'};
    }
    if (path === '/xss/test' && process.env.NODE_ENV === 'development') {
        return {page: 'XSSTest'};
    }
    if (path.match(/^\/tags\/?/)) {
        return {page: 'Tags'};
    }
    if (path === '/tos.html') {
        return {page: 'Tos'};
    }
    if (path === '/change_password') {
        return {page: 'ChangePassword'};
    }
    if (path === '/create_account') {
        return {page: 'CreateAccount'};
    }
    if (path === '/approval') {
        return {page: 'Approval'};
    }
    if (path === '/pick_account') {
        return {page: 'PickAccount'};
    }
    if (path === '/recover_account_step_1') {
        return {page: 'RecoverAccountStep1'};
    }
    if (path === '/recover_account_step_2') {
        return {page: 'RecoverAccountStep2'};
    }
    if (path === '/waiting_list.html') {
        return {page: 'WaitingList'};
    }
    if (path === '/market') {
        return {page: 'Market'};
    }
    if (path === '/~witnesses') {
        return {page: 'Witnesses'};
    }
    if (path === '/submit.html') {
        return {page: 'SubmitPost'};
    }
    // let match = path.match(routeRegex.PostsIndex);
    // if (match) {
    //     return {page: 'PostsIndex', params: ['home', match[1]]};
    // }
    // match = path.match(routeRegex.UserProfile1) ||
    //     // @user/"posts" is deprecated in favor of "comments" as of oct-2016 (#443)
    //     path.match(routeRegex.UserProfile2);
    // if (match) {
    //     return {page: 'UserProfile', params: match.slice(1)};
    // }
    // match = path.match(routeRegex.PostNoCategory);
    // if (match) {
    //     return {page: 'PostNoCategory', params: match.slice(1)};
    // }
    // match = path.match(routeRegex.Post);
    // if (match) {
    //     return {page: 'Post', params: match.slice(1)};
    // }
    let match = path.match(routeRegexNew.PostsIndex);
    if (match) {
        return {page: 'PostsIndex', params: match.slice(1)};
    }
    match = path.match(routeRegexNew.PostsIndexUserFeed);
    if (match) {
        return {page: 'PostsIndex', params: ['home', match[1]]};
    }
    match = path.match(routeRegexNew.UserProfile1) ||
        // @user/"posts" is deprecated in favor of "comments" as of oct-2016 (#443)
        path.match(routeRegexNew.UserProfile2);
    if (match) {
        return {page: 'UserProfile', params: match.slice(1)};
    }
    match = path.match(routeRegexNew.Post);
    if (match) {
        return {page: 'Post', params: match.slice(1)};
    }
    match = path.match(/^\/(hot|votes|responses|trending|trending30|promoted|cashout|payout|payout_comments|created|active)\/?$/)
        || path.match(/^\/(hot|votes|responses|trending|trending30|promoted|cashout|payout|payout_comments|created|active)\/([\w\d-]+)\/?$/);
    if (match) {
        return {page: 'PostsIndex', params: match.slice(1)};
    }
    return {page: 'NotFound'};
}

export const linkBuilder = {
    userProfile: name => `/${name}`,
    userFeed: name => `/${name}/feed`,
    userReplies: name => `/${name}/recent-replies`,
    userWallet: name => `/${name}/transfers`,
    userComments: name => `/${name}/comments`,
    userPassword: name => `/${name}/password`,
    userSettings: name => `/${name}/settings`,
    userFollowers: name => `/${name}/followers`,
    userFollowed: name => `/${name}/followed`,
    userPermissions: name => `/${name}/permissions`,
    userCurationRewards: name => `/${name}/curation-rewards`,
    userAuthorRewards: name => `/${name}/author-rewards`,
    search: () => '/static/search.html',
    compose: () => '/submit.html',
    signup: () => '/pick_account',
    login: () => '/login.html',
    post: (author, permlink) => `/${author}/${permlink}`,
    comment: (post_author, post_permlink, comment_author, comment_permlink) => {
        return `/${post_author}/${post_permlink}#${comment_author}/${comment_permlink}`;
    },
    indexPage: (category, order) => `/t/${category}/${order || 'trending'}`,
};

export function routeToSteemdUrl(route) {
    let url = 'trending';
    if (route.page === 'UserProfile') {
        url = `/@${route.params.join('/')}`;
    } else if (route.page === 'PostsIndex') {
        if (route.params[0] === 'home') {
            url = `/@${route.params[1]}/feed`;
        } else {
            const category = route.params[0];
            const sort = route.params[1] || 'trending';
            url = category === 'all' ? `/${sort}` : `/${sort}/${category}`;
        }
    }
    console.log('-- routeToSteemdUrl -->', url);
    // Replace /curation-rewards and /author-rewards with /transfers for UserProfile
    // to resolve data correctly
    // if (url.indexOf("/curation-rewards") !== -1) url = url.replace("/curation-rewards", "/transfers");
    // if (url.indexOf("/author-rewards") !== -1) url = url.replace("/author-rewards", "/transfers");
    return url;
}
