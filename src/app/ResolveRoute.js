const userEndpoints = [
    'blog',
    'posts',
    'comments',
    'recommended',
    'transfers',
    'curation-rewards',
    'author-rewards',
    'permissions',
    'created',
    'recent-replies',
    'feed',
    'password',
    'followed',
    'followers',
    'settings',
];

const categoryFilters = [
    'hot',
    'votes',
    'responses',
    'trending',
    'trending30',
    'promoted',
    'cashout',
    'payout',
    'payout_comments',
    'created',
    'active',
];

const
    userName = '(@[\\w\\d.-]+)',
    title = '([\\w\\d-]+)',
    category = '(' + '[\\u4E00-\\u9FA5\\u0400-\\u044F\\w\\d-]+' + ')',
    endpoints = '(' + userEndpoints.join('|') + ')',
    filters = '(' + categoryFilters.join('|') + ')',
    json = '[.json]';

export const routeRegex = {
    PostsIndex:         new RegExp('^\/' + userName + '\/' + 'feed' + '\/?' + '$'),
    UserProfile1:       new RegExp('^\/' + userName + '\/?' + '$'),
    UserProfile2:       new RegExp('^\/' + userName + '\/' + endpoints + '\/?' + '$'),
    UserProfile3:       new RegExp('^\/' + userName + '\/' + title),
    UserEndPoints:      new RegExp('^\/' + endpoints + '$'),
    CategoryFilters:    new RegExp('^\/' + filters + '\/?' + '$', 'ig'),
    FilterOrCategory:   new RegExp('^\/' + filters + '\/' + category + '*' + '\/?' + '$'),
    PostNoCategory:     new RegExp('^\/' + userName + '\/' + title ),
    Post:               new RegExp('^\/' + category + '\/' + userName + '\/' + title + '\/?' + '$'),
    PostJson:           new RegExp('^\/' + category + '\/' + userName + '\/' + title + json + '$'),
    UserJson:           new RegExp('^\/' + userName + json + '$'),
    UserNameJson:       /^.*(?=(\.json))/,
};

export default function resolveRoute(path)
{
    path = decodeURIComponent(path);
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
    let match = path.match(routeRegex.PostsIndex);
    if (match) {
        return {page: 'PostsIndex', params: ['home', match[1]]};
    }
    match = path.match(routeRegex.UserProfile2);
    if (match) {
        return {page: 'UserProfile', params: match.slice(1)};
    }
    match = path.match(routeRegex.PostNoCategory);
    if (match) {
        return {page: 'PostNoCategory', params: match.slice(1)};
    }
    match = path.match(routeRegex.Post);
    if (match) {
        return {page: 'Post', params: match.slice(1)};
    }
    match = path.match(routeRegex.FilterOrCategory);
    if (match) {
        return {page: 'PostsIndex', params: match.slice(1)};
    }
    return {page: 'NotFound'};
}
