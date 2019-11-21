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
import { List } from 'immutable';
import Callout from 'app/components/elements/Callout';
import userIllegalContent from 'app/utils/userIllegalContent';
import { proxifyImageUrl } from 'app/utils/ProxifyUrl';
import ArticleLayoutSelector from 'app/components/modules/ArticleLayoutSelector';
import { actions as UserProfilesSagaActions } from 'app/redux/UserProfilesSaga';
import UserProfileHeader from 'app/components/cards/UserProfileHeader';

export default class UserProfile extends React.Component {
    constructor() {
        super();
        this.loadMore = this.loadMore.bind(this);
    }

    componentWillMount() {
        const { profile, accountname, fetchProfile, username } = this.props;
        if (!profile) fetchProfile(accountname, username);
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

    loadMore(last_post) {
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
                walletUrl,
                category,
                section,
                order,
                posts,
                profile,
                notifications,
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

        // users following this user
        if (section === 'followers') {
            tab_content = <UserList title="Followers" users={followers} />;

            // users followed by this user
        } else if (section === 'followed') {
            tab_content = <UserList title="Followed" users={following} />;

            // notifications
        } else if (section === 'notifications') {
            if (!fetching && (notifications && !notifications.size)) {
                tab_content = (
                    <Callout>
                        {tt(
                            'user_profile.user_hasnt_had_any_notifications_yet',
                            {
                                name: accountname,
                            }
                        ) + '.'}
                    </Callout>
                );
            } else {
                tab_content = (
                    <div>
                        <NotificationsList
                            username={accountname}
                            notifications={notifications}
                            loading={fetching}
                        />
                    </div>
                );
            }

            // account display settings
        } else if (section === 'settings') {
            tab_content = <Settings routeParams={this.props.routeParams} />;

            // post lists -- not loaded
        } else if (!posts) {
            tab_content = (
                <center>
                    <LoadingIndicator type="circle" />
                </center>
            );

            // post lists -- empty
        } else if (!fetching && !posts.size) {
            let emptyText;
            const aname = '@' + accountname;
            if (section == 'blog') {
                if (isMyAccount) {
                    emptyText = (
                        <div>
                            {tt(
                                'user_profile.looks_like_you_havent_posted_anything_yet'
                            )}
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
                            <Link to="/trending">
                                Trending Articles
                                {/*tt('user_profile.explore_trending_articles')*/}
                            </Link>
                            <br />
                            <Link to="/welcome">
                                Welcome Guide
                                {/*tt('user_profile.read_the_quick_start_guide')*/}
                            </Link>
                            <br />
                            {/*
                            TODO: introduceyourself nudge, FUUX
                            <Link to="/faq.html">
                                {tt('user_profile.browse_the_faq')}
                            </Link>
                            <br />*/}
                        </div>
                    );
                } else {
                    emptyText = tt(
                        'user_profile.user_hasnt_started_bloggin_yet',
                        {
                            name: aname,
                        }
                    );
                }
            } else if (section == 'posts') {
                emptyText = tt('user_profile.user_hasnt_made_any_posts_yet', {
                    name: aname,
                });
            } else if (section == 'comments') {
                emptyText = tt('user_profile.user_hasnt_made_any_posts_yet', {
                    name: aname,
                });
            } else if (section == 'replies') {
                emptyText =
                    tt('user_profile.user_hasnt_had_any_replies_yet', {
                        name: aname,
                    }) + '.';
            } else if (section == 'payout') {
                emptyText = 'No pending payouts.';
            }

            tab_content = <Callout>{emptyText}</Callout>;

            // post lists -- loaded
        } else {
            tab_content = (
                <PostsList
                    posts={posts}
                    loading={fetching}
                    loadMore={this.loadMore}
                />
            );
        }

        // detect illegal users
        if (userIllegalContent.includes(accountname)) {
            tab_content = <div>Unavailable For Legal Reasons.</div>;
        }

        var page_title = '';
        if (section === 'blog') {
            page_title = isMyAccount ? tt('g.my_blog') : tt('g.blog');
        } else if (section === 'posts') {
            page_title = tt('g.posts');
        } else if (section === 'comments') {
            page_title = tt('g.comments');
        } else if (section === 'replies') {
            page_title = tt('g.replies');
        } else if (section === 'settings') {
            page_title = tt('g.settings');
        } else if (section === 'payout') {
            page_title = tt('voting_jsx.payout');
        }

        const layoutClass = this.props.blogmode
            ? 'layout-block'
            : 'layout-list';

        const tab_header = page_title && (
            <div>
                <div className="articles__header">
                    <div className="articles__header-col">
                        <h1 className="articles__h1">{page_title}</h1>
                    </div>
                    <div className="articles__header-col articles__header-col--right">
                        {order && <ArticleLayoutSelector />}
                    </div>
                </div>
                <hr className="articles__hr" />
            </div>
        );

        tab_content = (
            <div className="row">
                <div
                    className={classnames(
                        'UserProfile__tab_content',
                        'column',
                        layoutClass
                    )}
                >
                    <article className="articles">
                        {/*tab_header*/}
                        {tab_content}
                    </article>
                </div>
            </div>
        );

        const _tablink = (tab, label) => (
            <Link to={`/@${accountname}${tab}`} activeClassName="active">
                {label}
            </Link>
        );
        const _walletlink = (url, label) => (
            <a href={`${url}/@${accountname}`} target="_blank">
                {label}
            </a>
        );

        const top_menu = (
            <div className="row UserProfile__top-menu">
                <div className="columns small-9 medium-12 medium-expand">
                    <ul className="menu" style={{ flexWrap: 'wrap' }}>
                        <li>{_tablink('', tt('g.blog'))}</li>
                        <li>{_tablink('/posts', tt('g.posts'))}</li>
                        <li>{_tablink('/comments', tt('g.comments'))}</li>
                        <li>{_tablink('/recent-replies', tt('g.replies'))}</li>
                        <li>{_tablink('/payout', tt('voting_jsx.payout'))}</li>
                        <li>
                            {_tablink('/notifications', tt('g.notifications'))}
                        </li>
                    </ul>
                </div>
                <div className="columns shrink">
                    <ul className="menu" style={{ flexWrap: 'wrap' }}>
                        <li>{_walletlink(walletUrl, tt('g.wallet'))}</li>
                        {isMyAccount && (
                            <li>{_tablink('/settings', tt('g.settings'))}</li>
                        )}
                    </ul>
                </div>
            </div>
        );

        return (
            <div className="UserProfile">
                <UserProfileHeader
                    current_user={username}
                    accountname={accountname}
                    profile={profile}
                />
                <div className="UserProfile__top-nav row expanded">
                    {top_menu}
                </div>
                <div>{tab_content}</div>
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
            const walletUrl = state.app.get('walletUrl');

            let { section } = ownProps.routeParams;
            if (!section) section = 'blog';
            if (section == 'recent-replies') section = 'replies';
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
                accountname: accountname,
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
                    ['notifications', accountname],
                    null
                ),
                blogmode: state.app.getIn(['user_preferences', 'blogmode']),
                profile: state.userProfiles.getIn(['profiles', accountname]),
                walletUrl,
                section,
                order,
                category: '@' + accountname,
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
        })
    )(UserProfile),
};
