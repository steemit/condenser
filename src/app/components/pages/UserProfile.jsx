/* eslint react/prop-types: 0 */
import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import classnames from 'classnames';
import * as transactionActions from 'app/redux/TransactionReducer';
import * as userActions from 'app/redux/UserReducer';
import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';
import Icon from 'app/components/elements/Icon';
import UserKeys from 'app/components/elements/UserKeys';
import PasswordReset from 'app/components/elements/PasswordReset';
import UserWallet from 'app/components/modules/UserWallet';
import Settings from 'app/components/modules/Settings';
import CurationRewards from 'app/components/modules/CurationRewards';
import AuthorRewards from 'app/components/modules/AuthorRewards';
import UserList from 'app/components/elements/UserList';
import Follow from 'app/components/elements/Follow';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import PostsList from 'app/components/cards/PostsList';
import { isFetchingOrRecentlyUpdated } from 'app/utils/StateFunctions';
import { repLog10 } from 'app/utils/ParsersAndFormatters.js';
import Tooltip from 'app/components/elements/Tooltip';
import VerticalMenu from 'app/components/elements/VerticalMenu';
import NotifiCounter from 'app/components/elements/NotifiCounter';
import DateJoinWrapper from 'app/components/elements/DateJoinWrapper';
import tt from 'counterpart';
import WalletSubMenu from 'app/components/elements/WalletSubMenu';
import Userpic from 'app/components/elements/Userpic';
import Callout from 'app/components/elements/Callout';
import normalizeProfile from 'app/utils/NormalizeProfile';
import userIllegalContent from 'app/utils/userIllegalContent';
import proxifyImageUrl from 'app/utils/ProxifyUrl';
import ArticleLayoutSelector from 'app/components/modules/ArticleLayoutSelector';
import DropdownMenu from 'app/components/elements/DropdownMenu';

export default class UserProfile extends React.Component {
    constructor() {
        super();
        this.state = {};
        this.onPrint = () => {
            window.print();
        };
        this.loadMore = this.loadMore.bind(this);
    }

    shouldComponentUpdate(np) {
        const { follow } = this.props;
        const { follow_count } = this.props;

        let followersLoading = false,
            npFollowersLoading = false;
        let followingLoading = false,
            npFollowingLoading = false;

        const account = np.routeParams.accountname.toLowerCase();
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
            np.routeParams.accountname !== this.props.routeParams.accountname ||
            np.follow_count !== this.props.follow_count ||
            np.blogmode !== this.props.blogmode
        );
    }

    componentWillUnmount() {
        this.props.clearTransferDefaults();
        this.props.clearPowerdownDefaults();
    }

    loadMore(last_post, category) {
        const { accountname } = this.props.routeParams;
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
            accountname,
        });
    }

    render() {
        const {
            props: { current_user, wifShown, global_status, follow },
            onPrint,
        } = this;
        let { accountname, section } = this.props.routeParams;
        // normalize account from cased params
        accountname = accountname.toLowerCase();
        const username = current_user ? current_user.get('username') : null;
        // const gprops = this.props.global.getIn( ['props'] ).toJS();
        if (!section) section = 'blog';

        // @user/"posts" is deprecated in favor of "comments" as of oct-2016 (#443)
        if (section == 'posts') section = 'comments';

        // const isMyAccount = current_user ? current_user.get('username') === accountname : false;

        // Loading status
        const status = global_status
            ? global_status.getIn([section, 'by_author'])
            : null;
        const fetching = (status && status.fetching) || this.props.loading;

        let account;
        let accountImm = this.props.accounts.get(accountname);
        if (accountImm) {
            account = accountImm.toJS();
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
        const followers =
            follow && follow.getIn(['getFollowersAsync', accountname]);
        const following =
            follow && follow.getIn(['getFollowingAsync', accountname]);

        // instantiate following items
        let totalCounts = this.props.follow_count;
        let followerCount = 0;
        let followingCount = 0;

        if (totalCounts && accountname) {
            totalCounts = totalCounts.get(accountname);
            if (totalCounts) {
                totalCounts = totalCounts.toJS();
                followerCount = totalCounts.follower_count;
                followingCount = totalCounts.following_count;
            }
        }

        const rep = repLog10(account.reputation);

        const isMyAccount = username === account.name;
        let tab_content = null;

        // const global_status = this.props.global.get('status');

        // let balance_steem = parseFloat(account.balance.split(' ')[0]);
        // let vesting_steem = vestingSteem(account, gprops).toFixed(2);
        // const steem_balance_str = numberWithCommas(balance_steem.toFixed(2)) + " STEEM";
        // const power_balance_str = numberWithCommas(vesting_steem) + " STEEM POWER";
        // const sbd_balance = parseFloat(account.sbd_balance)
        // const sbd_balance_str = numberWithCommas('$' + sbd_balance.toFixed(2));

        let rewardsClass = '',
            walletClass = '';
        if (section === 'transfers') {
            walletClass = 'active';
            tab_content = (
                <div>
                    <UserWallet
                        account={accountImm}
                        showTransfer={this.props.showTransfer}
                        showPowerdown={this.props.showPowerdown}
                        current_user={current_user}
                        withdrawVesting={this.props.withdrawVesting}
                    />
                </div>
            );
        } else if (section === 'curation-rewards') {
            rewardsClass = 'active';
            tab_content = (
                <CurationRewards
                    account={account}
                    current_user={current_user}
                />
            );
        } else if (section === 'author-rewards') {
            rewardsClass = 'active';
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
        } else if (section === 'comments' && account.post_history) {
            if (account.comments) {
                let posts =
                    accountImm.get('posts') || accountImm.get('comments');
                if (!fetching && (posts && !posts.size)) {
                    tab_content = (
                        <Callout>
                            {tt('user_profile.user_hasnt_made_any_posts_yet', {
                                name: accountname,
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
                        {tt(
                            'user_profile.looks_like_you_havent_posted_anything_yet'
                        )}
                        <br />
                        <br />
                        <Link to="/submit.html">
                            {tt('user_profile.create_a_post')}
                        </Link>
                        <br />
                        <Link to="/trending">
                            {tt('user_profile.explore_trending_articles')}
                        </Link>
                        <br />
                        <Link to="/welcome">
                            {tt('user_profile.read_the_quick_start_guide')}
                        </Link>
                        <br />
                        <Link to="/faq.html">
                            {tt('user_profile.browse_the_faq')}
                        </Link>
                        <br />
                    </div>
                ) : (
                    tt('user_profile.user_hasnt_started_bloggin_yet', {
                        name: accountname,
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
                                name: accountname,
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
                    <div className="row">
                        <div className="column">
                            <WalletSubMenu account_name={account.name} />
                        </div>
                    </div>
                    <br />
                    <UserKeys account={accountImm} />
                </div>
            );
        } else if (section === 'password') {
            walletClass = 'active';
            tab_content = (
                <div>
                    <div className="row">
                        <div className="column">
                            <WalletSubMenu account_name={account.name} />
                        </div>
                    </div>
                    <br />
                    <PasswordReset account={accountImm} />
                </div>
            );
        } else {
            //    console.log( "no matches" );
        }

        // detect illegal users
        if (userIllegalContent.includes(accountname)) {
            tab_content = <div>Unavailable For Legal Reasons.</div>;
        }

        var page_title = '';
        // Page title

        if (isMyAccount) {
            if (section === 'blog') {
                page_title = tt('g.myblog');
            } else if (section === 'comments') {
                page_title = tt('g.mycomments');
            } else if (section === 'recent-replies') {
                page_title = tt('g.myreplies');
            } else if (section === 'settings') {
                page_title = tt('g.settings');
            } else if (section === 'curation-rewards') {
                page_title = tt('g.curation_rewards');
            } else if (section === 'author-rewards') {
                page_title = tt('g.author_rewards');
            }
        } else {
            if (section === 'blog') {
                page_title = tt('g.blog');
            } else if (section === 'comments') {
                page_title = tt('g.comments');
            } else if (section === 'recent-replies') {
                page_title = tt('g.replies');
            } else if (section === 'settings') {
                page_title = tt('g.settings');
            } else if (section === 'curation-rewards') {
                page_title = tt('g.curation_rewards');
            } else if (section === 'author-rewards') {
                page_title = tt('g.author_rewards');
            }
        }

        const layoutClass = this.props.blogmode
            ? 'layout-block'
            : 'layout-list';

        const blog_header = (
            <div>
                <div className="articles__header">
                    <div className="articles__header-col">
                        <h1 className="articles__h1">{page_title}</h1>
                    </div>
                    <div className="articles__header-col articles__header-col--right">
                        <ArticleLayoutSelector />
                    </div>
                </div>
                <hr className="articles__hr" />
            </div>
        );

        if (
            !(
                section === 'transfers' ||
                section === 'permissions' ||
                section === 'password'
            )
        ) {
            tab_content = (
                <div className="row">
                    <div
                        className={classnames(
                            'UserProfile__tab_content',
                            'column',
                            layoutClass,
                            section
                        )}
                    >
                        <article className="articles">
                            {section === 'blog' || 'comments'
                                ? blog_header
                                : null}
                            {tab_content}
                        </article>
                    </div>
                </div>
            );
        }

        let printLink = null;
        if (section === 'permissions') {
            if (isMyAccount && wifShown) {
                printLink = (
                    <div>
                        <a className="float-right noPrint" onClick={onPrint}>
                            <Icon name="printer" />&nbsp;{tt('g.print')}&nbsp;&nbsp;
                        </a>
                    </div>
                );
            }
        }

        // const wallet_tab_active = section === 'transfers' || section === 'password' || section === 'permissions' ? 'active' : ''; // className={wallet_tab_active}

        let rewardsMenu = [
            {
                link: `/@${accountname}/curation-rewards`,
                label: tt('g.curation_rewards'),
                value: tt('g.curation_rewards'),
            },
            {
                link: `/@${accountname}/author-rewards`,
                label: tt('g.author_rewards'),
                value: tt('g.author_rewards'),
            },
        ];

        // set account join date
        let accountjoin = account.created;

        const top_menu = (
            <div className="row UserProfile__top-menu">
                <div className="columns small-10 medium-12 medium-expand">
                    <ul className="menu" style={{ flexWrap: 'wrap' }}>
                        <li>
                            <Link
                                to={`/@${accountname}`}
                                activeClassName="active"
                            >
                                {tt('g.blog')}
                            </Link>
                        </li>
                        <li>
                            <Link
                                to={`/@${accountname}/comments`}
                                activeClassName="active"
                            >
                                {tt('g.comments')}
                            </Link>
                        </li>
                        <li>
                            <Link
                                to={`/@${accountname}/recent-replies`}
                                activeClassName="active"
                            >
                                {tt('g.replies')}{' '}
                                {isMyAccount && (
                                    <NotifiCounter fields="comment_reply" />
                                )}
                            </Link>
                        </li>
                        {/*<li><Link to={`/@${accountname}/feed`} activeClassName="active">Feed</Link></li>*/}
                        <DropdownMenu
                            className={rewardsClass}
                            items={rewardsMenu}
                            el="li"
                            selected={tt('g.rewards')}
                            position="right"
                        />
                    </ul>
                </div>
                <div className="columns shrink">
                    <ul className="menu" style={{ flexWrap: 'wrap' }}>
                        <li>
                            <a
                                href={`/@${accountname}/transfers`}
                                className={walletClass}
                                onClick={e => {
                                    e.preventDefault();
                                    browserHistory.push(e.target.pathname);
                                    return false;
                                }}
                            >
                                {tt('g.wallet')}{' '}
                                {isMyAccount && (
                                    <NotifiCounter fields="send,receive,account_update" />
                                )}
                            </a>
                        </li>
                        {isMyAccount && (
                            <li>
                                <Link
                                    to={`/@${accountname}/settings`}
                                    activeClassName="active"
                                >
                                    {tt('g.settings')}
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        );

        const {
            name,
            location,
            about,
            website,
            cover_image,
        } = normalizeProfile(account);
        const website_label = website
            ? website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
            : null;

        let cover_image_style = {};
        if (cover_image) {
            cover_image_style = {
                backgroundImage:
                    'url(' + proxifyImageUrl(cover_image, '2048x512') + ')',
            };
        }

        return (
            <div className="UserProfile">
                <div className="UserProfile__banner row expanded">
                    <div className="column" style={cover_image_style}>
                        <div style={{ position: 'relative' }}>
                            <div className="UserProfile__buttons hide-for-small-only">
                                <Follow
                                    follower={username}
                                    following={accountname}
                                />
                            </div>
                        </div>
                        <h1>
                            <Userpic account={account.name} hideIfDefault />
                            {name || account.name}{' '}
                            <Tooltip
                                t={tt(
                                    'user_profile.this_is_users_reputations_score_it_is_based_on_history_of_votes',
                                    { name: accountname }
                                )}
                            >
                                <span className="UserProfile__rep">
                                    ({rep})
                                </span>
                            </Tooltip>
                        </h1>

                        <div>
                            {about && (
                                <p className="UserProfile__bio">{about}</p>
                            )}
                            <div className="UserProfile__stats">
                                <span>
                                    <Link to={`/@${accountname}/followers`}>
                                        {tt('user_profile.follower_count', {
                                            count: followerCount,
                                        })}
                                    </Link>
                                    {isMyAccount && (
                                        <NotifiCounter fields="follow" />
                                    )}
                                </span>
                                <span>
                                    <Link to={`/@${accountname}`}>
                                        {tt('user_profile.post_count', {
                                            count: account.post_count || 0,
                                        })}
                                    </Link>
                                </span>
                                <span>
                                    <Link to={`/@${accountname}/followed`}>
                                        {tt('user_profile.followed_count', {
                                            count: followingCount,
                                        })}
                                    </Link>
                                </span>
                            </div>
                            <p className="UserProfile__info">
                                {location && (
                                    <span>
                                        <Icon name="location" /> {location}
                                    </span>
                                )}
                                {website && (
                                    <span>
                                        <Icon name="link" />{' '}
                                        <a
                                            href={website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {website_label}
                                        </a>
                                    </span>
                                )}
                                <Icon name="calendar" />{' '}
                                <DateJoinWrapper date={accountjoin} />
                            </p>
                        </div>
                        <div className="UserProfile__buttons_mobile show-for-small-only">
                            <Follow
                                follower={username}
                                following={accountname}
                                what="blog"
                            />
                        </div>
                    </div>
                </div>
                <div className="UserProfile__top-nav row expanded noPrint">
                    {top_menu}
                </div>
                <div>{printLink}</div>
                <div>{tab_content}</div>
            </div>
        );
    }
}

module.exports = {
    path: '@:accountname(/:section)',
    component: connect(
        state => {
            const wifShown = state.global.get('UserKeys_wifShown');
            const current_user = state.user.get('current');
            // const current_account = current_user && state.global.getIn(['accounts', current_user.get('username')])

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
                blogmode: state.app.getIn(['user_preferences', 'blogmode']),
            };
        },
        dispatch => ({
            login: () => {
                dispatch(userActions.showLogin());
            },
            clearTransferDefaults: () => {
                dispatch(userActions.clearTransferDefaults());
            },
            showTransfer: transferDefaults => {
                dispatch(userActions.setTransferDefaults(transferDefaults));
                dispatch(userActions.showTransfer());
            },
            clearPowerdownDefaults: () => {
                dispatch(userActions.clearPowerdownDefaults());
            },
            showPowerdown: powerdownDefaults => {
                console.log('power down defaults:', powerdownDefaults);
                dispatch(userActions.setPowerdownDefaults(powerdownDefaults));
                dispatch(userActions.showPowerdown());
            },
            withdrawVesting: ({
                account,
                vesting_shares,
                errorCallback,
                successCallback,
            }) => {
                const successCallbackWrapper = (...args) => {
                    dispatch(
                        globalActions.getState({ url: `@${account}/transfers` })
                    );
                    return successCallback(...args);
                };
                dispatch(
                    transactionActions.broadcastOperation({
                        type: 'withdraw_vesting',
                        operation: { account, vesting_shares },
                        errorCallback,
                        successCallback: successCallbackWrapper,
                    })
                );
            },
            requestData: args =>
                dispatch(fetchDataSagaActions.requestData(args)),
        })
    )(UserProfile),
};
