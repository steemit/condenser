export default function resolveRoute(path)
{
    // routes
    if (path === '/') {
        return {page: 'Landing'}; // LANDING
        //return {page: 'PostsIndex', params: ['trending']};
    }
    if (path === '/about.html') {
        return {page: 'About'};
    }
<<<<<<< HEAD
    // golos.io ICO page
    //if (path === '/ico.html') {
    //    return {page: 'Ico'};
    //}
    // golos.io landing page
    if (path === '/ico') {
        return {page: 'Landing'};
=======
    if (path === '/faq.html') {
        return {page: 'Faq'};
>>>>>>> steemit/develop
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
    let match = path.match(/^\/(@[\w\.\d-]+)\/feed\/?$/);
    if (match) {
        return {page: 'PostsIndex', params: ['home', match[1]]};
    }
    match = path.match(/^\/(@[\w\.\d-]+)\/?$/) ||
<<<<<<< HEAD
        path.match(/^\/(@[\w\.\d-]+)\/(blog|posts|recommended|transfers|curation-rewards|author-rewards|permissions|created|recent-replies|feed|password|followed|followers|settings)\/?$/);
=======
        // @user/"posts" is deprecated in favor of "comments" as of oct-2016 (#443)
        path.match(/^\/(@[\w\.\d-]+)\/(blog|posts|comments|recommended|transfers|curation-rewards|author-rewards|permissions|created|recent-replies|feed|password|followed|followers)\/?$/);
>>>>>>> steemit/develop
    if (match) {
        return {page: 'UserProfile', params: match.slice(1)};
    }
    match = path.match(/^\/(\@[\w\d-]+)\/([\w\d-]+)\/?$/) ||
        path.match(/^\/([\w\d\-\/]+)\/(\@[\w\d\.-]+)\/([\w\d-]+)\/?$/) ||
        path.match(/^\/([\w\d\-\/]+)\/(\@[\w\d\.-]+)\/([\w\d-]+)\/?\?sort=(\w+)$/);
    if (match) {
        return {page: 'Post', params: match.slice(1)};
    }
    match = path.match(/^\/(best|updated|hot|votes|responses|trending|trending30|promoted|cashout|created|recent|active)\/?$/)
         || path.match(/^\/(best|updated|hot|votes|responses|trending|trending30|promoted|cashout|created|recent|active)\/([\w\d-]+)\/?$/);
    if (match) {
        return {page: 'PostsIndex', params: match.slice(1)};
    }
    return {page: 'NotFound'};
}
