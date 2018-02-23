import tt from 'counterpart';
import normalizeProfile from 'app/utils/NormalizeProfile';

const getPageTitle = (route, account_meta) => {
    let page_title = route.page;
    let sort_order = '';
    let topic = '';
    let user_name = null;
    if (route.page === 'PostsIndex') {
        sort_order = route.params[0];
        if (sort_order === 'home') {
            page_title = tt('header_jsx.home');
            const account_name = route.params[1];
        } else {
            topic = route.params.length > 1 ? route.params[1] : '';
            const type =
                route.params[0] == 'payout_comments' ? 'comments' : 'posts';
            let prefix = route.params[0];
            if (prefix == 'created') prefix = 'New';
            if (prefix == 'payout') prefix = 'Pending payout';
            if (prefix == 'payout_comments') prefix = 'Pending payout';
            if (topic !== '') prefix += ` ${topic}`;
            page_title = `${prefix} ${type}`;
        }
    } else if (route.page === 'Post') {
        sort_order = '';
        topic = route.params[0];
    } else if (route.page == 'SubmitPost') {
        page_title = tt('header_jsx.create_a_post');
    } else if (route.page == 'Privacy') {
        page_title = tt('navigation.privacy_policy');
    } else if (route.page == 'Tos') {
        page_title = tt('navigation.terms_of_service');
    } else if (route.page == 'ChangePassword') {
        page_title = tt('header_jsx.change_account_password');
    } else if (
        route.page == 'RecoverAccountStep1' ||
        route.page == 'RecoverAccountStep2'
    ) {
        page_title = tt('header_jsx.stolen_account_recovery');
    } else if (route.page === 'UserProfile') {
        user_name = route.params[0].slice(1);
        const acct_meta = account_meta.getIn([user_name]);
        const name = acct_meta ? normalizeProfile(acct_meta.toJS()).name : null;
        const user_title = name ? `${name} (@${user_name})` : user_name;
        page_title = user_title;
        if (route.params[1] === 'followers') {
            page_title = tt('header_jsx.people_following') + ' ' + user_title;
        }
        if (route.params[1] === 'followed') {
            page_title = tt('header_jsx.people_followed_by') + ' ' + user_title;
        }
        if (route.params[1] === 'curation-rewards') {
            page_title =
                tt('header_jsx.curation_rewards_by') + ' ' + user_title;
        }
        if (route.params[1] === 'author-rewards') {
            page_title = tt('header_jsx.author_rewards_by') + ' ' + user_title;
        }
        if (route.params[1] === 'recent-replies') {
            page_title = tt('header_jsx.replies_to') + ' ' + user_title;
        }
        // @user/"posts" is deprecated in favor of "comments" as of oct-2016 (#443)
        if (route.params[1] === 'posts' || route.params[1] === 'comments') {
            page_title = tt('header_jsx.comments_by') + ' ' + user_title;
        }
    }
    // Format first letter of all titles and lowercase user name
    if (route.page !== 'UserProfile') {
        page_title = page_title.charAt(0).toUpperCase() + page_title.slice(1);
    }
    if (
        process.env.BROWSER &&
        (route.page !== 'Post' && route.page !== 'PostNoCategory')
    )
        return page_title;
};

export default getPageTitle;
