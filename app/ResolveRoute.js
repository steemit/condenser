export default function resolveRoute(path)
{
    if (path === '/') {
        return {page: 'PostsIndex', params: ['trending']};
    }
    if (path === '/about.html') {
        return {page: 'About'};
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
    if (path.match(/^\/tags\.html/)) {
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
    let match = path.match(/^\/(@[\w\.\d-]+)\/?$/) ||
        path.match(/^\/(@[\w\.\d-]+)\/(blog|posts|recommended|transfers|curation-rewards|author-rewards|permissions|created|recent-replies|feed|password|followed|followers)\/?$/);
    if (match) {
        return {page: 'UserProfile', params: match.slice(1)};
    }
    match = path.match(/^\/(\@[\w\d-]+)\/([\w\d-]+)\/?$/) ||
        path.match(/^\/([\w\d\-\/]+)\/(\@[\w\d\.-]+)\/([\w\d-]+)\/?$/) ||
        path.match(/^\/([\w\d\-\/]+)\/(\@[\w\d\.-]+)\/([\w\d-]+)\/?\?sort=(\w+)$/);
    if (match) {
        return {page: 'Post', params: match.slice(1)};
    }
    match = path.match(/^\/(best|updated|hot|votes|responses|trending|trending30|cashout|created|recent|active)\/?$/)
         || path.match(/^\/(best|updated|hot|votes|responses|trending|trending30|cashout|created|recent|active)\/([\w\d-]+)\/?$/);
    if (match) {
        return {page: 'PostsIndex', params: match.slice(1)};
    }
    return {page: 'NotFound'};
}
