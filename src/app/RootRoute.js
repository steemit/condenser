import App from 'app/components/App';
import Benchmark from 'app/components/Steemit/pages/Benchmark';
import PostsIndex from 'app/components/Steemit/pages/PostsIndex';

// import {
//     Home
// } from 'app/components/pages';

import resolveRoute from './ResolveRoute';

// polyfill webpack require.ensure
if (typeof require.ensure !== 'function') require.ensure = (d, c) => c(require);

export default {
    path: '/',
    component: App,
    getChildRoutes(nextState, cb) {
        const route = resolveRoute(nextState.location.pathname);
        if (route.page === 'About') {
            //require.ensure([], (require) => {
            cb(null, [require('app/components/Steemit/pages/About')]);
            //});
        } else if (route.page === 'Static/Register') {
            //require.ensure([], (require) => {
            cb(null, [require('app/components/pages/Auth/Register')]);
            //});
        } else if (route.page === 'Static/LogIn') {
            //require.ensure([], (require) => {
            cb(null, [require('app/components/pages/Auth/LogIn')]);
            //});
        } else if (route.page === 'Static/Home') {
            //require.ensure([], (require) => {
            cb(null, [require('app/components/pages/Home/Home')]);
            //});
        } else if (route.page === 'Static/Node') {
            //require.ensure([], (require) => {
            cb(null, [require('app/components/pages/Node/Node')]);
            //});
        } else if (route.page === 'Static/Create') {
            //require.ensure([], (require) => {
            cb(null, [require('app/components/pages/Posts/Create')]);
            //});
        } else if (route.page === 'Static/Settings') {
            //require.ensure([], (require) => {
            cb(null, [require('app/components/pages/Settings/Settings')]);
            //});
        } else if (route.page === 'Welcome') {
            //require.ensure([], (require) => {
            cb(null, [require('app/components/Steemit/pages/Welcome')]);
            //});
        } else if (route.page === 'Faq') {
            //require.ensure([], (require) => {
            cb(null, [require('app/components/Steemit/pages/Faq')]);
            //});
        } else if (route.page === 'Login') {
            //require.ensure([], (require) => {
            // cb(null, [require('app/components/Steemit/pages/Login')]);
            cb(null, [require('app/components/pages/Auth/LogIn')]);
            //});
        } else if (route.page === 'Privacy') {
            //require.ensure([], (require) => {
            cb(null, [require('app/components/Steemit/pages/Privacy')]);
            //});
        } else if (route.page === 'Support') {
            //require.ensure([], (require) => {
            cb(null, [require('app/components/Steemit/pages/Support')]);
            //});
        } else if (
            route.page === 'XSSTest' &&
            process.env.NODE_ENV === 'development'
        ) {
            //require.ensure([], (require) => {
            cb(null, [require('app/components/Steemit/pages/XSS')]);
            //});
        } else if (route.page === 'Benchmark') {
            //require.ensure([], (require) => {
            cb(null, [require('app/components/Steemit/pages/Benchmark')]);
            //});
        } else if (route.page === 'Tags') {
            //require.ensure([], (require) => {
            cb(null, [require('app/components/Steemit/pages/TagsIndex')]);
            //});
        } else if (route.page === 'Tos') {
            //require.ensure([], (require) => {
            cb(null, [require('app/components/Steemit/pages/Tos')]);
            //});
        } else if (route.page === 'ChangePassword') {
            //require.ensure([], (require) => {
            cb(null, [
                require('app/components/Steemit/pages/ChangePasswordPage'),
            ]);
            //});
        } else if (route.page === 'PickAccount') {
            //require.ensure([], (require) => {
            cb(null, [require('app/components/Steemit/pages/PickAccount')]);
            //});
        } else if (route.page === 'CreateAccount') {
            //require.ensure([], (require) => {
            cb(null, [require('app/components/Steemit/pages/CreateAccount')]);
            //});
        } else if (route.page === 'Approval') {
            //require.ensure([], (require) => {
            cb(null, [require('app/components/Steemit/pages/Approval')]);
            //});
        } else if (route.page === 'RecoverAccountStep1') {
            //require.ensure([], (require) => {
            cb(null, [
                require('app/components/Steemit/pages/RecoverAccountStep1'),
            ]);
            //});
        } else if (route.page === 'RecoverAccountStep2') {
            //require.ensure([], (require) => {
            cb(null, [
                require('app/components/Steemit/pages/RecoverAccountStep2'),
            ]);
            //});
        } else if (route.page === 'WaitingList') {
            //require.ensure([], (require) => {
            cb(null, [require('app/components/Steemit/pages/WaitingList')]);
            //});
        } else if (route.page === 'Witnesses') {
            //require.ensure([], (require) => {
            cb(null, [require('app/components/Steemit/pages/Witnesses')]);
            //});
        } else if (route.page === 'SubmitPost') {
            if (process.env.BROWSER) {
                // require.ensure([], (require) => {
                cb(null, [require('app/components/Steemit/pages/SubmitPost')]);
                // });
            } else {
                cb(null, [
                    require('app/components/Steemit/pages/SubmitPostServerRender'),
                ]);
            }
        } else if (route.page === 'UserProfile') {
            //require.ensure([], (require) => {
            cb(null, [require('app/components/Steemit/pages/UserProfile')]);
            //});
        } else if (route.page === 'Market') {
            require.ensure([], require => {
                cb(null, [require('app/components/Steemit/pages/Market')]);
            });
        } else if (route.page === 'Post') {
            //require.ensure([], (require) => {
            cb(null, [require('app/components/Steemit/pages/PostPage')]);
            //});
        } else if (route.page === 'PostNoCategory') {
            cb(null, [
                require('app/components/Steemit/pages/PostPageNoCategory'),
            ]);
        } else if (route.page === 'PostsIndex') {
            //require.ensure([], (require) => {
            //cb(null, [require('app/components/Steemit/pages/PostsIndex')]);
            cb(null, [PostsIndex]);
            //});
        } else {
            //require.ensure([], (require) => {
            cb(process.env.BROWSER ? null : Error(404), [
                require('app/components/Steemit/pages/NotFound'),
            ]);
            //});
        }
    },
    indexRoute: {
        component: PostsIndex.component,
    },
};
