/* eslint react/prop-types: 0 */
import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import classnames from 'classnames';
import * as userActions from 'app/redux/UserReducer';
import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';
import Settings from 'app/components/modules/Settings';
import UserList from 'app/components/elements/UserList';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import NotificationsList from 'app/components/cards/NotificationsList';
import PostsList from 'app/components/cards/PostsList';
import { isFetchingOrRecentlyUpdated } from 'app/utils/StateFunctions';
import tt from 'counterpart';
import Callout from 'app/components/elements/Callout';
import userIllegalContent from 'app/utils/userIllegalContent';
import { actions as UserProfilesSagaActions } from 'app/redux/UserProfilesSaga';
import UserProfileHeader from 'app/components/cards/UserProfileHeader';
import * as appActions from 'app/redux/AppReducer';
import PrimaryNavigation from 'app/components/cards/PrimaryNavigation';
import SubscriptionsList from '../cards/SubscriptionsList';

const emptyPostsText = (section, account, isMyAccount) => {
    const name = '@' + account;

    if (section == 'posts') {
        return tt('user_profile.user_hasnt_made_any_posts_yet', { name });
    } else if (section == 'comments') {
        return tt('user_profile.user_hasnt_made_any_posts_yet', { name });
    } else if (section == 'replies') {
        return (
            tt('user_profile.user_hasnt_had_any_replies_yet', { name }) + '.'
        );
    } else if (section == 'payout') {
        return 'No pending payouts.';
    } else if (section == 'blog' && !isMyAccount) {
        return tt('user_profile.user_hasnt_started_bloggin_yet', { name });
    } else if (section == 'blog') {
        return (
            <div>
                {tt('user_profile.looks_like_you_havent_posted_anything_yet')}
                <br />
                <br />
                <Link to="/communities">
                    <strong>Explore Communities</strong>
                </Link>
                <br />
                <Link to="/submit.html">
                    {tt('user_profile.create_a_post')}
                </Link>
                <br />
                <Link to="/trending">Trending Articles</Link>
                <br />
                <Link to="/welcome">Welcome Guide</Link>
                <br />
                {/*
                TODO: introduceyourself nudge, FUUX
                tt('user_profile.read_the_quick_start_guide')
                tt('user_profile.explore_trending_articles')
                <Link to="/faq.html">
                    {tt('user_profile.browse_the_faq')}
                </Link>
                <br />*/}
            </div>
        );
    } else {
        console.error('unhandled emptytext case', section, name, isMyAccount);
    }
};

export default class UserProfile extends React.Component {
    constructor() {
        super();
        this.loadMore = this.loadMore.bind(this);
    }

    componentWillMount() {
        const {
            profile,
            accountname,
            fetchProfile,
            username,
            section,
        } = this.props;
        this.props.setRouteTag(accountname, section);
        if (!profile) fetchProfile(accountname, username);
    }

    componentWillUpdate(nextProps) {
        const { accountname, section } = nextProps;
        if (
            this.props.accountname !== accountname ||
            this.props.section !== section
        ) {
            this.props.setRouteTag(accountname, section);
        }
    }

    componentDidUpdate(prevProps) {
        const { profile, accountname, fetchProfile, username } = this.props;
        if (
            prevProps.accountname != accountname ||
            prevProps.username != username
        ) {
            if (!profile) fetchProfile(accountname, username);
        }
    }

    shouldComponentUpdate(np, ns) {
        return (
            np.username !== this.props.username ||
            np.status !== this.props.status ||
            np.followers !== this.props.followers ||
            np.following !== this.props.following ||
            np.loading !== this.props.loading ||
            np.location.pathname !== this.props.location.pathname ||
            np.blogmode !== this.props.blogmode ||
            np.posts !== this.props.posts ||
            np.profile !== this.props.profile ||
            np.notifications !== this.props.notifications
        );
    }

    loadMore() {
        const last_post = this.props.posts ? this.props.posts.last() : null;
        if (!last_post) return;
        //if (last_post == this.props.pending) return; // if last post is 'pending', its an invalid start token
        const { username, status, order, category } = this.props;

        if (isFetchingOrRecentlyUpdated(status, order, category)) return;

        const [author, permlink] = last_post.split('/');
        this.props.requestData({
            author,
            permlink,
            order,
            category,
            observer: username,
        });
    }

    render() {
        const {
            props: {
                username,
                status,
                following,
                followers,
                accountname,
                category,
                section,
                order,
                posts,
                profile,
                notifications,
                subscriptions,
            },
        } = this;
        // Loading status
        const _state = status ? status.getIn([category, order]) : null;
        const fetching = (_state && _state.fetching) || this.props.loading;

        if (profile) {
        } else if (fetching) {
            return (
                <center>
                    <LoadingIndicator type="circle" />
                </center>
            );
        } else {
            return (
                <div>
                    <center>{tt('user_profile.unknown_account')}</center>
                </div>
            );
        }

        const isMyAccount = username === accountname;
        let tab_content = null;
        if (userIllegalContent.includes(accountname)) {
            // invalid users
            tab_content = <div>Unavailable For Legal Reasons.</div>;
        } else if (section === 'followers') {
            // users following this user
            tab_content = (
                <UserList
                    title="Followers"
                    users={followers}
                    accountname={accountname}
                    profile={profile}
                />
            );
        } else if (section === 'followed') {
            // users followed by this user
            tab_content = (
                <UserList
                    title="Following"
                    users={following}
                    accountname={accountname}
                    profile={profile}
                />
            );
        } else if (section === 'notifications') {
            // notifications
            tab_content = (
                <NotificationsList
                    username={accountname}
                    notifications={notifications && notifications.toJS()}
                />
            );
        } else if (section === 'communities') {
            tab_content = (
                <SubscriptionsList
                    username={accountname}
                    subscriptions={subscriptions}
                />
            );
        } else if (section === 'settings') {
            // account display settings
            tab_content = <Settings routeParams={this.props.routeParams} />;
        } else if (!posts) {
            // post lists -- not loaded
            tab_content = (
                <center>
                    <LoadingIndicator type="circle" />
                </center>
            );
        } else if (!fetching && !posts.size) {
            // post lists -- empty
            const emptyText = emptyPostsText(section, accountname, isMyAccount);
            tab_content = <Callout>{emptyText}</Callout>;
        } else {
            // post lists -- loaded
            tab_content = (
                <PostsList
                    post_refs={posts}
                    loading={fetching}
                    loadMore={this.loadMore}
                />
            );
        }

        return (
            <div>
                <UserProfileHeader
                    current_user={username}
                    accountname={accountname}
                    profile={profile}
                />
                <div
                    className={classnames(
                        'PostsIndex',
                        'row',
                        //'UserProfile__tab_content',
                        //'column',
                        'layout-list'
                    )}
                >
                    <aside className="c-sidebar c-sidebar--right" />
                    <aside className="c-sidebar c-sidebar--left">
                        <PrimaryNavigation
                            routeTag="user_index"
                            category={category}
                        />
                    </aside>
                    <article className="articles">{tab_content}</article>
                </div>
            </div>
        );
    }
}

module.exports = {
    path: '@:accountname(/:section)',
    component: connect(
        (state, ownProps) => {
            const username = state.user.getIn(['current', 'username']);
            const accountname = ownProps.routeParams.accountname.toLowerCase();

            let { section } = ownProps.routeParams;
            if (!section) section = 'blog';
            const order = [
                'blog',
                'posts',
                'comments',
                'replies',
                'payout',
            ].includes(section)
                ? section
                : null;

            return {
                posts: state.global.getIn([
                    'discussion_idx',
                    '@' + accountname,
                    order,
                ]),
                username,
                loading: state.app.get('loading'),
                status: state.global.get('status'),
                accountname,
                followers: state.global.getIn([
                    'follow',
                    'getFollowersAsync',
                    accountname,
                    'blog_result',
                ]),
                following: state.global.getIn([
                    'follow',
                    'getFollowingAsync',
                    accountname,
                    'blog_result',
                ]),
                notifications: state.global.getIn(
                    ['notifications', accountname, 'notifications'],
                    null
                ),
                blogmode: state.app.getIn(['user_preferences', 'blogmode']),
                profile: state.userProfiles.getIn(['profiles', accountname]),
                section,
                order,
                category: '@' + accountname,
                subscriptions: state.global.getIn([
                    'subscriptions',
                    accountname,
                ])
                    ? state.global.getIn(['subscriptions', accountname]).toJS()
                    : [],
            };
        },
        dispatch => ({
            login: () => {
                dispatch(userActions.showLogin());
            },
            requestData: args =>
                dispatch(fetchDataSagaActions.requestData(args)),
            fetchProfile: (account, observer) =>
                dispatch(
                    UserProfilesSagaActions.fetchProfile({ account, observer })
                ),
            setRouteTag: (accountname, section) =>
                dispatch(
                    appActions.setRouteTag({
                        routeTag: 'user_index',
                        params: { username: accountname, section },
                    })
                ),
        })
    )(UserProfile),
};
