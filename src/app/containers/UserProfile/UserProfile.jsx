import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Link } from 'react-router';
import tt from 'counterpart';
import { blockedUsers, blockedUsersContent } from 'app/utils/IllegalContent';
import { isFetchingOrRecentlyUpdated } from 'app/utils/StateFunctions';

import user from 'app/redux/User';
import transaction from 'app/redux/Transaction';

import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import Callout from 'app/components/elements/Callout';

import PostsList from 'app/components/cards/PostsList';
import UserWallet from 'app/components/modules/UserWallet';
import Settings from 'app/components/modules/Settings';
import CurationRewards from 'app/components/modules/CurationRewards';
import AuthorRewards from 'app/components/modules/AuthorRewards';

import WalletSubMenu from 'app/components/elements/WalletSubMenu';
import IllegalContentMessage from 'app/components/elements/IllegalContentMessage';
import UserList from 'app/components/elements/UserList';
import UserKeys from 'app/components/elements/UserKeys';
import PasswordReset from 'app/components/elements/PasswordReset';

import Container from 'src/app/components/Container';
import UserHeader from 'src/app/components/UserHeader';
import UserNavigation from 'src/app/components/UserNavigation';
import UserCardAbout from 'src/app/components/UserCardAbout';

export default class UserProfile extends Component {
    static propTypes = { accountName: PropTypes.string };

    shouldComponentUpdate(np) {
        const { follow } = this.props;
        const { follow_count } = this.props;

        let followersLoading = false,
            npFollowersLoading = false;
        let followingLoading = false,
            npFollowingLoading = false;

        const account = np.routeParams.accountName.toLowerCase();
        if (follow) {
            followersLoading = follow.getIn(
                ['getFollowersAsync', account, 'blog_loading'],
                false
            );
            followingLoading = follow.getIn(
                ['getFollowingAsync', account, 'blog_loading'],
                false
            );
        }
        if (np.follow) {
            npFollowersLoading = np.follow.getIn(
                ['getFollowersAsync', account, 'blog_loading'],
                false
            );
            npFollowingLoading = np.follow.getIn(
                ['getFollowingAsync', account, 'blog_loading'],
                false
            );
        }

        return (
            np.current_user !== this.props.current_user ||
            np.accounts.get(account) !== this.props.accounts.get(account) ||
            np.wifShown !== this.props.wifShown ||
            np.global_status !== this.props.global_status ||
            (npFollowersLoading !== followersLoading && !npFollowersLoading) ||
            (npFollowingLoading !== followingLoading && !npFollowingLoading) ||
            np.loading !== this.props.loading ||
            np.location.pathname !== this.props.location.pathname ||
            np.routeParams.accountName !== this.props.routeParams.accountName ||
            np.follow_count !== this.props.follow_count
        );
    }

    componentWillUnmount() {
        this.props.clearTransferDefaults();
    }

    loadMore = (last_post, category) => {
        const { accountName } = this.props.routeParams;

        if (!last_post) return;

        let order;
        switch (category) {
            case 'feed':
                order = 'by_feed';
                break;
            case 'blog':
                order = 'by_author';
                break;
            case 'comments':
                order = 'by_comments';
                break;
            case 'recent_replies':
                order = 'by_replies';
                break;
            default:
                console.log('unhandled category:', category);
        }

        if (
            isFetchingOrRecentlyUpdated(
                this.props.global_status,
                order,
                category
            )
        )
            return;
        const [author, permlink] = last_post.split('/');
        this.props.requestData({
            author,
            permlink,
            order,
            category,
            accountname: accountName,
        });
    };

    render() {
        const { global_status, loading, current_user, follow } = this.props;
        let { accountName, section } = this.props.routeParams;
        accountName = accountName.toLowerCase(); // normalize account from cased params
        const username = current_user ? current_user.get('username') : null;

        if (!section) section = 'blog';
        // @user/"posts" is deprecated in favor of "comments" as of oct-2016 (#443)
        if (section == 'posts') section = 'comments';

        // Loading status
        const status = global_status
            ? global_status.getIn([section, 'by_author'])
            : null;
        const fetching = (status && status.fetching) || loading;

        let account;
        let accountImm = this.props.accounts.get(accountName);
        if (accountImm) {
            account = accountImm.toJS();
        } else if (fetching) {
            return (
                <div className="UserProfile loader">
                    <div className="UserProfile__center">
                        <LoadingIndicator
                            type="circle"
                            size="40px"
                        />
                    </div>
                </div>
            );
        } else {
            return (
                <div className="UserProfile">
                    <div className="UserProfile__center">
                        {tt('user_profile.unknown_account')}
                    </div>
                </div>
            );
        }
        const followers =
            follow && follow.getIn(['getFollowersAsync', accountName]);
        const following =
            follow && follow.getIn(['getFollowingAsync', accountName]);

        // MUST BE REFACTORED!

        const isMyAccount = username === account.name;
        let tab_content = null;

        let walletClass = '';
        if (section === 'transfers') {
            // transfers, check if url has query params
            const {
                location: { query },
            } = this.props;
            const { to, amount, token, memo } = query;
            const hasAllParams = !!to && !!amount && !!token && !!memo;
            walletClass = 'active';
            tab_content = (
                <div>
                    <UserWallet
                        transferDetails={{ immediate: hasAllParams, ...query }}
                        account={accountImm}
                        showTransfer={this.props.showTransfer}
                        current_user={current_user}
                        withdrawVesting={this.props.withdrawVesting}
                    />
                    {/* isMyAccount && <div><MarkNotificationRead fields="send,receive" account={account.name} /></div>*/}
                </div>
            );
        } else if (section === 'curation-rewards') {
            tab_content = (
                <CurationRewards
                    account={account}
                    current_user={current_user}
                />
            );
        } else if (section === 'author-rewards') {
            tab_content = (
                <AuthorRewards account={account} current_user={current_user} />
            );
        } else if (section === 'followers') {
            if (followers && followers.has('blog_result')) {
                tab_content = (
                    <div>
                        <UserList
                            title={tt('user_profile.followers')}
                            account={account}
                            users={followers.get('blog_result')}
                        />
                        {/* isMyAccount && <div><MarkNotificationRead fields="send,receive" account={account.name} /></div>*/}
                    </div>
                );
            }
        } else if (section === 'followed') {
            if (following && following.has('blog_result')) {
                tab_content = (
                    <UserList
                        title="Followed"
                        account={account}
                        users={following.get('blog_result')}
                    />
                );
            }
        } else if (section === 'settings') {
            tab_content = <Settings routeParams={this.props.routeParams} />;
        } else if (section === 'comments') {
            if (account.comments) {
                let posts =
                    accountImm.get('posts') || accountImm.get('comments');
                if (!fetching && (posts && !posts.size)) {
                    tab_content = (
                        <Callout>
                            {tt('user_profile.user_hasnt_made_any_posts_yet', {
                                name: accountName,
                            })}
                        </Callout>
                    );
                } else {
                    tab_content = (
                        <PostsList
                            posts={posts}
                            loading={fetching}
                            category="comments"
                            loadMore={this.loadMore}
                            showSpam
                        />
                    );
                }
            } else {
                tab_content = (
                    <center>
                        <LoadingIndicator type="circle" />
                    </center>
                );
            }
        } else if (!section || section === 'blog') {
            if (account.blog) {
                let posts = accountImm.get('blog');
                const emptyText = isMyAccount ? (
                    <div>
                        {tt('submit_a_story.you_hasnt_started_bloggin_yet')}
                        <br />
                        <br />
                        <Link to="/submit.html">{tt('g.submit_a_story')}</Link>
                        <br />
                        <a href="/welcome">
                            {tt('submit_a_story.welcome_to_the_blockchain')}
                        </a>
                    </div>
                ) : (
                    tt('user_profile.user_hasnt_started_bloggin_yet', {
                        name: accountName,
                    })
                );

                if (!fetching && (posts && !posts.size)) {
                    tab_content = <Callout>{emptyText}</Callout>;
                } else {
                    tab_content = (
                        <PostsList
                            account={account.name}
                            posts={posts}
                            loading={fetching}
                            category="blog"
                            loadMore={this.loadMore}
                            showSpam
                        />
                    );
                }
            } else {
                tab_content = (
                    <center>
                        <LoadingIndicator type="circle" />
                    </center>
                );
            }
        } else if (section === 'recent-replies') {
            if (account.recent_replies) {
                let posts = accountImm.get('recent_replies');
                if (!fetching && (posts && !posts.size)) {
                    tab_content = (
                        <Callout>
                            {tt('user_profile.user_hasnt_had_any_replies_yet', {
                                name: accountName,
                            }) + '.'}
                        </Callout>
                    );
                } else {
                    tab_content = (
                        <div>
                            <PostsList
                                posts={posts}
                                loading={fetching}
                                category="recent_replies"
                                loadMore={this.loadMore}
                                showSpam={false}
                            />
                            {/* isMyAccount && <div><MarkNotificationRead fields="send,receive" account={account.name} /></div>*/}
                        </div>
                    );
                }
            } else {
                tab_content = (
                    <center>
                        <LoadingIndicator type="circle" />
                    </center>
                );
            }
        } else if (section === 'permissions' && isMyAccount) {
            walletClass = 'active';
            tab_content = (
                <div>
                    <WalletSubMenu account_name={account.name} />

                    <br />
                    <UserKeys account={accountImm} />
                    {/* isMyAccount && <div><MarkNotificationRead fields="send,receive" account={account.name} /></div>*/}
                </div>
            );
        } else if (section === 'password') {
            walletClass = 'active';
            tab_content = (
                <div>
                    <WalletSubMenu account_name={account.name} />

                    <br />
                    <PasswordReset account={accountImm} />
                </div>
            );
        }

        if (blockedUsers.includes(accountName)) {
            tab_content = <IllegalContentMessage />;
        }

        if (blockedUsersContent.includes(accountName)) {
            tab_content = <div>{tt('g.blocked_user_content')}</div>;
        }

        if (
            !(
                section === 'transfers' ||
                section === 'permissions' ||
                section === 'password' ||
                //   section === 'invites' ||
                section === 'assets' ||
                section === 'create-asset'
            )
        ) {
            tab_content = (
                <div className="row">
                    <div className="UserProfile__tab_content column">
                        {tab_content}
                    </div>
                </div>
            );
        }

        return (
            <Fragment>
                <UserHeader account={account} />
                <UserNavigation
                    accountName={accountName}
                    isOwner={isMyAccount}
                    section={section}
                />
                <Container>
                    <UserCardAbout />
                    {tab_content}
                </Container>
            </Fragment>
        );
    }
}

module.exports = {
    path: '@:accountName(/:section)',
    component: connect(
        state => {
            const wifShown = state.global.get('UserKeys_wifShown');
            const current_user = state.user.get('current');

            return {
                discussions: state.global.get('discussion_idx'),
                current_user,
                // current_account,
                wifShown,
                loading: state.app.get('loading'),
                global_status: state.global.get('status'),
                accounts: state.global.get('accounts'),
                follow: state.global.get('follow'),
                follow_count: state.global.get('follow_count'),
            };
        },
        dispatch => ({
            login: () => {
                dispatch(user.actions.showLogin());
            },
            clearTransferDefaults: () => {
                dispatch(user.actions.clearTransferDefaults());
            },
            showTransfer: transferDefaults => {
                dispatch(user.actions.setTransferDefaults(transferDefaults));
                dispatch(user.actions.showTransfer());
            },
            withdrawVesting: ({
                account,
                vesting_shares,
                errorCallback,
                successCallback,
            }) => {
                const successCallbackWrapper = (...args) => {
                    dispatch({
                        type: 'FETCH_STATE',
                        payload: { pathname: `@${account}/transfers` },
                    });
                    return successCallback(...args);
                };
                dispatch(
                    transaction.actions.broadcastOperation({
                        type: 'withdraw_vesting',
                        operation: { account, vesting_shares },
                        errorCallback,
                        successCallback: successCallbackWrapper,
                    })
                );
            },
            requestData: args =>
                dispatch({ type: 'REQUEST_DATA', payload: args }),
        })
    )(UserProfile),
};
