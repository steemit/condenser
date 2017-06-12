import App from 'app/components/App';
import PostsIndex from 'app/components/pages/PostsIndex';
import resolveRoute from './ResolveRoute';

export default {
    path: '/',
    component: App,
    getChildRoutes(nextState, cb) {
        const route = resolveRoute(nextState.location.pathname);
        if (route.page === 'About') {
            cb(null, [require('app/components/pages/About')]);
        } else if (route.page === 'Landing') {
            cb(null, [require('app/components/pages/Landing')]);
        } else if (route.page === 'Welcome') {
            cb(null, [require('app/components/pages/Welcome')]);
        } else if (route.page === 'Faq') {
            cb(null, [require('app/components/pages/Faq')]);
        } else if (route.page === 'Login') {
            cb(null, [require('app/components/pages/Login')]);
        } else if (route.page === 'Privacy') {
            cb(null, [require('app/components/pages/Privacy')]);
        } else if (route.page === 'Support') {
            cb(null, [require('app/components/pages/Support')]);
        } else if (route.page === 'XSSTest' && process.env.NODE_ENV === 'development') {
            cb(null, [require('app/components/pages/XSS')]);
        } else if (route.page === 'Tags') {
            cb(null, [require('app/components/pages/TagsIndex')]);
        } else if (route.page === 'Tos') {
            cb(null, [require('app/components/pages/Tos')]);
        } else if (route.page === 'ChangePassword') {
            cb(null, [require('app/components/pages/ChangePasswordPage')]);
        } else if (route.page === 'CreateAccount') {
            cb(null, [require('app/components/pages/CreateAccount')]);
        } else if (route.page === 'RecoverAccountStep1') {
            cb(null, [require('app/components/pages/RecoverAccountStep1')]);
        } else if (route.page === 'RecoverAccountStep2') {
            cb(null, [require('app/components/pages/RecoverAccountStep2')]);
        } else if (route.page === 'WaitingList') {
            cb(null, [require('app/components/pages/WaitingList')]);
        } else if (route.page === 'Witnesses') {
            cb(null, [require('app/components/pages/Witnesses')]);
        } else if (route.page === 'SubmitPost') {
            if (process.env.BROWSER)
                cb(null, [require('app/components/pages/SubmitPost')]);
            else
                cb(null, [require('app/components/pages/SubmitPostServerRender')]);
        } else if (route.page === 'UserProfile') {
            cb(null, [require('app/components/pages/UserProfile')]);
        } else if (route.page === 'Market') {
            cb(null, [require('app/components/pages/Market')]);
        } else if (route.page === 'Asset') {
            cb(null, [require('app/components/pages/Asset')]);
        } else if (route.page === 'Post') {
            cb(null, [require('app/components/pages/PostPage')]);
        } else if (route.page === 'PostNoCategory') {
            cb(null, [require('app/components/pages/PostPageNoCategory')]);
        } else if (route.page === 'PostsIndex') {
            cb(null, [PostsIndex]);
        } else {
            cb(process.env.BROWSER ? null : Error(404), [require('app/components/pages/NotFound')]);
        }
    },
    indexRoute: {
        component: PostsIndex.component
    }
};
