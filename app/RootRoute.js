import App from 'app/components/App';
import PostsIndex from '@pages/PostsIndex';
import resolveRoute from './ResolveRoute';

export default {
    path: '/',
    component: App,
    getChildRoutes(nextState, cb) {
        const route = resolveRoute(nextState.location.pathname);
        if (route.page === 'Landing') {
            cb(null, [require('@pages/Landing')]);
        } else if (route.page === 'Welcome') {
            cb(null, [require('@pages/Welcome')]);
        } else if (route.page === 'Start') {
            cb(null, [require('@pages/Landings/Start')]);
        } else if (route.page === 'Faq') {
            cb(null, [require('@pages/Faq')]);
        } else if (route.page === 'Login') {
            cb(null, [require('@pages/Login')]);
        } else if (route.page === 'Privacy') {
            cb(null, [require('@pages/Privacy')]);
        } else if (route.page === 'Support') {
            cb(null, [require('@pages/Support')]);
        } else if (
            route.page === 'XSSTest' &&
            process.env.NODE_ENV === 'development'
        ) {
            cb(null, [require('@pages/XSS')]);
        } else if (route.page === 'Tags') {
            cb(null, [require('@pages/TagsIndex')]);
        } else if (route.page === 'Tos') {
            cb(null, [require('@pages/Tos')]);
        } else if (route.page === 'ChangePassword') {
            cb(null, [require('@pages/ChangePasswordPage')]);
        } else if (route.page === 'CreateAccount') {
            cb(null, [require('@pages/CreateAccount')]);
        } else if (route.page === 'CreateAccountTestnet') {
            cb(null, [require('@pages/CreateAccountTestnet')]);
        } else if (route.page === 'RecoverAccountStep1') {
            cb(null, [require('@pages/RecoverAccountStep1')]);
        } else if (route.page === 'RecoverAccountStep2') {
            cb(null, [require('@pages/RecoverAccountStep2')]);
        } else if (route.page === 'Witnesses') {
            cb(null, [require('@pages/Witnesses')]);
        } else if (route.page === 'LeavePage') {
            cb(null, [require('@pages/LeavePage')]);
        } else if (route.page === 'SubmitPost') {
            if (process.env.BROWSER) cb(null, [require('@pages/SubmitPost')]);
            else cb(null, [require('@pages/SubmitPostServerRender')]);
        // } else if (route.page === 'UserProfile') {
        //     cb(null, [require('@pages/UserProfile')]);
        } else if (route.page === 'UserProfile') {
            cb(null, [require('src/app/containers/UserProfile').default]);
        } else if (route.page === 'Market') {
            cb(null, [require('@pages/Market')]);
        } else if (route.page === 'Post') {
            cb(null, [require('@pages/PostPage')]);
        } else if (route.page === 'PostNoCategory') {
            cb(null, [require('@pages/PostPageNoCategory')]);
        } else if (route.page === 'PostsIndex') {
            cb(null, [PostsIndex]);
        } else {
            cb(process.env.BROWSER ? null : Error(404), [
                require('@pages/NotFound'),
            ]);
        }
    },
    indexRoute: {
        component: PostsIndex.component,
    },
};
