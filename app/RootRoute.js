import App from 'app/components/App';
import PostsIndex from '@pages/PostsIndex';
import resolveRoute from './ResolveRoute';

export default {
    path: '/',
    component: App,
    getChildRoutes(nextState, cb) {
        const route = resolveRoute(nextState.location.pathname);
        if (route.page === 'Landing') {
            cb(null, [require('@pages/Landing').default]);
        } else if (route.page === 'Welcome') {
            cb(null, [
                {
                    path: 'welcome',
                    component: process.env.BROWSER
                        ? require('@pages/WelcomeLoader').default
                        : require('@pages/Welcome').default,
                },
            ]);
        } else if (route.page === 'Start') {
            cb(null, [require('@pages/Landings/Start').default]);
        } else if (route.page === 'Faq') {
            cb(null, [require('@pages/Faq').default]);
        } else if (route.page === 'Login') {
            cb(null, [require('@pages/Login').default]);
        } else if (route.page === 'Privacy') {
            cb(null, [require('@pages/Privacy').default]);
        } else if (route.page === 'Support') {
            cb(null, [require('@pages/Support').default]);
        } else if (
            route.page === 'XSSTest' &&
            process.env.NODE_ENV === 'development'
        ) {
            cb(null, [require('@pages/XSS').default]);
        } else if (route.page === 'Tags') {
            cb(null, [require('@pages/TagsIndex').default]);
        } else if (route.page === 'Tos') {
            cb(null, [require('@pages/Tos').default]);
        } else if (route.page === 'ChangePassword') {
            cb(null, [require('@pages/ChangePasswordPage').default]);
        } else if (route.page === 'CreateAccount') {
            cb(null, [require('@pages/CreateAccount').default]);
        } else if (route.page === 'CreateAccountTestnet') {
            cb(null, [require('@pages/CreateAccountTestnet').default]);
        } else if (route.page === 'RecoverAccountStep1') {
            cb(null, [require('@pages/RecoverAccountStep1').default]);
        } else if (route.page === 'RecoverAccountStep2') {
            cb(null, [require('@pages/RecoverAccountStep2').default]);
        } else if (route.page === 'Witnesses') {
            cb(null, [require('@pages/WitnessesLoader').default]);
        } else if (route.page === 'LeavePage') {
            cb(null, [require('@pages/LeavePage').default]);
        } else if (route.page === 'SubmitPost') {
            if (process.env.BROWSER) cb(null, [require('@pages/SubmitPost').default]);
            else cb(null, [require('@pages/SubmitPostServerRender').default]);
        } else if (route.page === 'UserProfile') {
            //if (process.env.NODE_ENV === 'development') {
                cb(null, [
                    require('src/app/containers/userProfile')
                        .UserProfileContainer,
                ]);
            // } else {
            //     cb(null, [require('@pages/UserProfile')]);
            // }
        } else if (route.page === 'Market') {
            cb(null, [require('@pages/MarketLoader').default]);
        } else if (route.page === 'Post') {
            cb(null, [require('@pages/PostPage').default]);
        } else if (route.page === 'PostNoCategory') {
            cb(null, [require('@pages/PostPageNoCategory').default]);
        } else if (route.page === 'PostsIndex') {
            cb(null, [PostsIndex]);
        } else {
            cb(process.env.BROWSER ? null : Error(404), [
                require('@pages/NotFound').default,
            ]);
        }
    },
    indexRoute: {
        component: PostsIndex.component,
    },
};
