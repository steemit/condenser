export const routeRegex = {
    UserProfile1: /^\/([\w.\d-]+)\/?$/,
    UserProfile2: /^\/([\w.\d-]+)\/(blog|posts|comments|recommended|wallet|curation-rewards|author-rewards|permissions|created|recent-replies|feed|password|followed|followers|settings)\/?$/,
    UserEndPoints: /^(blog|posts|comments|recommended|wallet|curation-rewards|author-rewards|permissions|created|recent-replies|feed|password|followed|followers|settings)$/,
    PostsIndex: /^\/t\/([\w\d-]+)\/(hot|votes|responses|trending|trending30|promoted|cashout|payout|payout_comments|created|active)\/?$/,
    PostsIndexUserFeed: /^\/([\w.\d-]+)\/feed\/?$/,
    Post: /^\/([\w\d.-]+)\/([\w\d-]+)\/?($|\?)/,
    PostJson: /^\/([\w\d.-]+)\/([\w\d-]+)(\.json)$/,
    UserJson: /^\/([\w.\d-]+)(\.json)$/,
    UserNameJson: /^.*(?=(\.json))/,
};

export function resolveRoute(path) {
    if (path === '/') {
        return { page: 'PostsIndex', params: ['all', 'trending'] };
    }
    if (path === '/s/about') {
        return { page: 'About' };
    }
    if (path === '/s/welcome') {
        return { page: 'Welcome' };
    }
    if (path === '/s/faq') {
        return { page: 'Faq' };
    }
    if (path === '/c/login') {
        return { page: 'Login' };
    }
    if (path === '/s/privacy') {
        return { page: 'Privacy' };
    }
    if (path === '/s/support') {
        return { page: 'Support' };
    }
    if (path === '/c/xss/test' && process.env.NODE_ENV === 'development') {
        return { page: 'XSSTest' };
    }
    if (path.match(/^\/c\/tags\/?/)) {
        return { page: 'Tags' };
    }
    if (path === '/s/tos') {
        return { page: 'Tos' };
    }
    if (path === '/c/change-password') {
        return { page: 'ChangePassword' };
    }
    if (path === '/c/create-account') {
        return { page: 'CreateAccount' };
    }
    if (path === '/c/approval') {
        return { page: 'Approval' };
    }
    if (path === '/c/pick-account') {
        return { page: 'PickAccount' };
    }
    if (path === '/c/recover-account-step-1') {
        return { page: 'RecoverAccountStep1' };
    }
    if (path === '/c/recover-account-step-2') {
        return { page: 'RecoverAccountStep2' };
    }
    if (path === '/c/market') {
        return { page: 'Market' };
    }
    if (path === '/c/witnesses') {
        return { page: 'Witnesses' };
    }
    if (path === '/c/submit') {
        return { page: 'SubmitPost' };
    }
    let match = path.match(routeRegex.PostsIndex);
    if (match) {
        return { page: 'PostsIndex', params: match.slice(1) };
    }
    match = path.match(routeRegex.PostsIndexUserFeed);
    if (match) {
        return { page: 'PostsIndex', params: ['home', match[1]] };
    }
    match =
        path.match(routeRegex.UserProfile1) ||
        // @user/"posts" is deprecated in favor of "comments" as of oct-2016 (#443)
        path.match(routeRegex.UserProfile2);
    if (match) {
        return { page: 'UserProfile', params: match.slice(1) };
    }
    match = path.match(routeRegex.Post);
    if (match) {
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

export const pathTo = {
    userProfile: name => `/${name}`,
    userFeed: name => `/${name}/feed`,
    userReplies: name => `/${name}/recent-replies`,
    userWallet: name => `/${name}/wallet`,
    userComments: name => `/${name}/comments`,
    userPassword: name => `/${name}/password`,
    userSettings: name => `/${name}/settings`,
    userFollowers: name => `/${name}/followers`,
    userFollowed: name => `/${name}/followed`,
    userPermissions: name => `/${name}/permissions`,
    userCurationRewards: name => `/${name}/curation-rewards`,
    userAuthorRewards: name => `/${name}/author-rewards`,
    compose: () => '/c/submit',
    signup: (params = '') => `/c/pick-account${params}`,
    login: () => '/c/login',
    post: (author, permlink) => `/${author}/${permlink}`,
    postPage: () => '/:username/:slug',
    comment: (post_author, post_permlink, comment_author, comment_permlink) => {
        return `/${post_author}/${post_permlink}#${comment_author}/${
            comment_permlink
        }`;
    },
    indexPage: (category, order) => `/t/${category}/${order || 'trending'}`,
    about: () => '/s/about',
    welcome: () => '/s/welcome',
    faq: () => '/s/faq',
    privacy: () => '/s/privacy',
    support: () => '/s/support',
    tags: () => '/c/tags',
    tagsIndexPage: () => '/c/tags(/:order)',
    tos: () => '/s/tos',
    changePassword: () => '/c/change-password',
    createAccount: () => '/c/create-account',
    signUpApproval: (params = '') => `/c/approval${params}`,
    recoverAccount: step => `/c/recover-account-step-${step}`,
    market: () => '/c/market',
    witnesses: () => '/c/witnesses',
    enterEmail: (params = '') => `/c/enter-email${params}`,
    submitEmail: (params = '') => `/c/submit-email${params}`,
    confirmEmail: () => '/c/confirm-email',
    confirmEmailGet: () => '/c/confirm-email/:code',
    enterMobile: (params = '') => `/c/enter-mobile${params}`,
    submitMobile: (params = '') => `/c/submit-mobile${params}`,
    confirmMobile: (params = '') => `/c/confirm-mobile${params}`,
    confirmMobileGet: () => '/c/confirm-mobile/:code',
    xssTest: () => '/c/xss/test',
};

export function routeToSteemdUrl(route) {
    let url = 'trending';
    if (route.page === 'UserProfile') {
        if (route.params[1] === 'wallet') {
            url = `/@${route.params[0]}/transfers`;
        }
        else {
            url = `/@${route.params.join('/')}`;
        }
    } else if (route.page === 'PostsIndex') {
        if (route.params[0] === 'home') {
            url = `/@${route.params[1]}/feed`;
        } else {
            const category = route.params[0];
            const sort = route.params[1] || 'trending';
            url = category === 'all' ? `/${sort}` : `/${sort}/${category}`;
        }
    } else if (route.page === 'Witnesses') {
        url = '/~witnesses';
    } else if (route.page === 'Tags') {
        url = '/tags';
    }
    console.log('-- routeToSteemdUrl -->', url);
    // Replace /curation-rewards and /author-rewards with /transfers for UserProfile
    // to resolve data correctly
    // if (url.indexOf("/curation-rewards") !== -1) url = url.replace("/curation-rewards", "/transfers");
    // if (url.indexOf("/author-rewards") !== -1) url = url.replace("/author-rewards", "/transfers");
    return url;
}

export function convertPostPath(path) {
    const pmatch = path.match(
        /^\/([\w\d\-]+)\/\@([\w\d\.-]+)\/([\w\d-]+)\/?($|\?)/
    );
    if (pmatch) {
        return '/' + pmatch[2] + '/' + pmatch[3];
    }
    const cmatch = path.match(
        /^\/([\w\d\-]+)\/\@([\w\d\.-]+)\/([\w\d-]+)\#\@([\w\d-]+)\/([\w\d-]+)$/
    );
    if (cmatch) {
        return (
            '/' +
            cmatch[2] +
            '/' +
            cmatch[3] +
            '#' +
            cmatch[4] +
            '/' +
            cmatch[5]
        );
    }
    return path;
}
