// polyfill webpack require.ensure
//if (typeof require.ensure !== 'function') require.ensure = (d, c) => c(require);

import App from 'ui-patterns/components/App';
import PostsIndex from 'ui-patterns/components/pages/PostsIndex';
import resolveRoute from './ResolveRoute';

export default {
    path: '/',
    component: App,
    getChildRoutes(nextState, cb) {
        const route = resolveRoute(nextState.location.pathname);
        if (route.page === 'About') {
            //require.ensure([], (require) => {
                cb(null, [require('ui-patterns/components/pages/About')]);
            //});
        } else if (route.page === 'Welcome') {
            //require.ensure([], (require) => {
            cb(null, [require('ui-patterns/components/pages/Welcome')]);
            //});
        } else if (route.page === 'Faq') {
            //require.ensure([], (require) => {
            cb(null, [require('ui-patterns/components/pages/Faq')]);
            //});
        } else if (route.page === 'Login') {
            //require.ensure([], (require) => {
            cb(null, [require('ui-patterns/components/pages/Login')]);
            //});
        } else if (route.page === 'Privacy') {
            //require.ensure([], (require) => {
                cb(null, [require('ui-patterns/components/pages/Privacy')]);
            //});
        } else if (route.page === 'Support') {
            //require.ensure([], (require) => {
                cb(null, [require('ui-patterns/components/pages/Support')]);
            //});
        } else if (route.page === 'XSSTest' && process.env.NODE_ENV === 'development') {
            //require.ensure([], (require) => {
            cb(null, [require('ui-patterns/components/pages/XSS')]);
            //});
        } else if (route.page === 'Tags') {
            //require.ensure([], (require) => {
            cb(null, [require('ui-patterns/components/pages/TagsIndex')]);
            //});
        } else if (route.page === 'Tos') {
            //require.ensure([], (require) => {
                cb(null, [require('ui-patterns/components/pages/Tos')]);
            //});
        } else if (route.page === 'ChangePassword') {
            //require.ensure([], (require) => {
            cb(null, [require('ui-patterns/components/pages/ChangePasswordPage')]);
            //});
        } else if (route.page === 'CreateAccount') {
            //require.ensure([], (require) => {
                cb(null, [require('ui-patterns/components/pages/CreateAccount')]);
            //});
        } else if (route.page === 'RecoverAccountStep1') {
            //require.ensure([], (require) => {
            cb(null, [require('ui-patterns/components/pages/RecoverAccountStep1')]);
            //});
        } else if (route.page === 'RecoverAccountStep2') {
            //require.ensure([], (require) => {
            cb(null, [require('ui-patterns/components/pages/RecoverAccountStep2')]);
            //});
        } else if (route.page === 'WaitingList') {
            //require.ensure([], (require) => {
            cb(null, [require('ui-patterns/components/pages/WaitingList')]);
            //});
        } else if (route.page === 'Witnesses') {
            //require.ensure([], (require) => {
                cb(null, [require('ui-patterns/components/pages/Witnesses')]);
            //});
        } else if (route.page === 'SubmitPost') {
            //require.ensure([], (require) => {
            if (process.env.BROWSER)
                cb(null, [require('ui-patterns/components/pages/SubmitPost')]);
            else
                cb(null, [require('ui-patterns/components/pages/SubmitPostServerRender')]);
        } else if (route.page === 'UserProfile') {
            //require.ensure([], (require) => {
                cb(null, [require('ui-patterns/components/pages/UserProfile')]);
            //});
        } else if (route.page === 'Market') {
            //require.ensure([], (require) => {
                cb(null, [require('ui-patterns/components/pages/Market')]);
            //});
        } else if (route.page === 'Post') {
            //require.ensure([], (require) => {
                cb(null, [require('ui-patterns/components/pages/PostPage')]);
            //});
        } else if (route.page === 'PostNoCategory') {
                cb(null, [require('ui-patterns/components/pages/PostPageNoCategory')]);
        } else if (route.page === 'PostsIndex') {
            //require.ensure([], (require) => {
                //cb(null, [require('ui-patterns/components/pages/PostsIndex')]);
                cb(null, [PostsIndex]);
            //});
        } else {
            //require.ensure([], (require) => {
                cb(process.env.BROWSER ? null : Error(404), [require('ui-patterns/components/pages/NotFound')]);
            //});
        }
    },
    indexRoute: {
        component: PostsIndex.component
    }
};
