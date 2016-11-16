/* eslint react/prop-types: 0 */
import React from 'react';
import { Link } from 'react-router';
import {connect} from 'react-redux';
import { browserHistory } from 'react-router';
import transaction from 'app/redux/Transaction';
import user from 'app/redux/User';
import Icon from 'app/components/elements/Icon'
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
import {isFetchingOrRecentlyUpdated} from 'app/utils/StateFunctions';
import {repLog10} from 'app/utils/ParsersAndFormatters.js';
import Tooltip from 'app/components/elements/Tooltip';
import { LinkWithDropdown } from 'react-foundation-components/lib/global/dropdown';
import VerticalMenu from 'app/components/elements/VerticalMenu';
import MarkNotificationRead from 'app/components/elements/MarkNotificationRead';
import NotifiCounter from 'app/components/elements/NotifiCounter';
import DateJoinWrapper from 'app/components/elements/DateJoinWrapper';
import { translate } from 'app/Translator';
import WalletSubMenu from 'app/components/elements/WalletSubMenu';
import Userpic from 'app/components/elements/Userpic';

export default class UserProfile extends React.Component {
    constructor() {
        super()
        this.state = {}
        this.onPrint = () => {window.print()}
        this.loadMore = this.loadMore.bind(this);
    }

    componentWillUnmount() {
        this.props.clearTransferDefaults()
    }

    loadMore(last_post, category) {
        const {accountname} = this.props.routeParams
        if (!last_post) return;

        let order;
        switch(category) {
          case 'feed': order = 'by_feed'; break;
          case 'blog': order = 'by_author'; break;
          case 'comments': order = 'by_comments'; break;
          case 'recent_replies': order = 'by_replies'; break;
          default: console.log('unhandled category:', category);
        }

        if (isFetchingOrRecentlyUpdated(this.props.global.get('status'), order, category)) return;
        const [author, permlink] = last_post.split('/');
        this.props.requestData({author, permlink, order, category, accountname});
    }

    render() {
        const {
            props: {current_user, wifShown},
            onPrint
        } = this;
        let { accountname, section } = this.props.routeParams;
        const username = current_user ? current_user.get('username') : null
        // const gprops = this.props.global.getIn( ['props'] ).toJS();
        if( !section ) section = 'blog';

        // @user/"posts" is deprecated in favor of "comments" as of oct-2016 (#443)
        if( section == 'posts' ) section = 'comments';

        // const isMyAccount = current_user ? current_user.get('username') === accountname : false;
        let account
        let accountImm = this.props.global.getIn(['accounts', accountname]);
        if( accountImm ) {
            account = accountImm.toJS();
        }
        else {
            return <div><center>{translate('unknown_account')}</center></div>
        }

        let followerCount, followingCount;
        const followers = this.props.global.getIn( ['follow', 'get_followers', accountname] );
        const following = this.props.global.getIn( ['follow', 'get_following', accountname] );

        if(followers) {
            const status_followers = followers.get('blog')
            const followers_loaded = status_followers.get('loading') === false && status_followers.get('error') == null
            if (followers_loaded) {
                followerCount = followers.get('result').filter(a => {
                    return a.get(0) === "blog";
                }).size;
            }
        }

        if (following) {
            const status_following = following.get('blog')
            const following_loaded = status_following.get('loading') === false && status_following.get('error') == null
            if (following_loaded) {
                followingCount = following.get('result').filter(a => {
                    return a.get(0) === "blog";
                }).size;
            }
        }

        const rep = repLog10(account.reputation);

        const isMyAccount = username === account.name
        const name = account.name;
        let tab_content = null;

        const global_status = this.props.global.get('status');
        const status = global_status ? global_status.getIn([section, 'by_author']) : null;
        const fetching = (status && status.fetching) || this.props.loading;

        // let balance_steem = parseFloat(account.balance.split(' ')[0]);
        // let vesting_steem = vestingSteem(account, gprops).toFixed(2);
        // const steem_balance_str = numberWithCommas(balance_steem.toFixed(2)) + " STEEM";
        // const power_balance_str = numberWithCommas(vesting_steem) + " STEEM POWER";
        // const sbd_balance = parseFloat(account.sbd_balance)
        // const sbd_balance_str = numberWithCommas('$' + sbd_balance.toFixed(2));

        let rewardsClass = "", walletClass = "";
        if( section === 'transfers' ) {
            walletClass = 'active'
            tab_content = <div>
                <UserWallet global={this.props.global}
                          account={account}
                          showTransfer={this.props.showTransfer}
                          current_user={current_user}
                          withdrawVesting={this.props.withdrawVesting} />
                {isMyAccount && <div><MarkNotificationRead fields="send,receive" account={account.name} /></div>}
                </div>;
        }
        else if( section === 'curation-rewards' ) {
            rewardsClass = "active";
            tab_content = <CurationRewards global={this.props.global}
                          account={account}
                          current_user={current_user}
                          />
        }
        else if( section === 'author-rewards' ) {
            rewardsClass = "active";
            tab_content = <AuthorRewards global={this.props.global}
                          account={account}
                          current_user={current_user}
                          />
        }
        else if( section === 'followers' ) {
            if (followers && followers.has('result')) {
                tab_content = <div>
                    <UserList
                          title={translate('followers')}
                          account={account}
                          users={followers} />
                    {isMyAccount && <MarkNotificationRead fields="follow" account={account.name} />}
                    </div>
            }
        }
        else if( section === 'followed' ) {
            if (following && following.has('result')) {
                tab_content = <UserList
                          title="Followed"
                          account={account}
                          users={following}
                          />
            }
        }
        else if( section === 'settings' ) {
            tab_content = <Settings routeParams={this.props.routeParams} />
        }
        else if( section === 'comments' && account.post_history ) {
           // NOTE: `posts` key will be renamed to `comments` (https://github.com/steemit/steem/issues/507)
           //   -- see also GlobalReducer.js
           if( account.posts )
           {
              tab_content = <PostsList
                  emptyText={translate('user_hasnt_made_any_posts_yet', {name})}
                  posts={account.posts}
                  loading={fetching}
                  category="comments"
                  loadMore={this.loadMore}
                  showSpam />;
           }
           else {
              tab_content = (<center><LoadingIndicator type="circle" /></center>);
           }
        } else if(!section || section === 'blog') {
            if (account.blog) {
                const emptyText = isMyAccount ? <div>
                    Looks like you haven't posted anything yet.<br /><br />
                    <Link to="/submit.html">Submit a Story</Link><br />
                    <a href="/steemit/@thecryptofiend/the-missing-faq-a-beginners-guide-to-using-steemit">Read The Beginner's Guide</a><br />
                    <a href="/welcome">Read The Steemit Welcome Guide</a>
                </div>:
                    <div>{translate('user_hasnt_started_bloggin_yet', {name})}</div>;
                tab_content = <PostsList
                    emptyText={emptyText}
                    account={account.name}
                    posts={account.blog}
                    loading={fetching}
                    category="blog"
                    loadMore={this.loadMore}
                    showSpam />;
            } else {
                tab_content = (<center><LoadingIndicator type="circle" /></center>);
            }
        }
        else if( (section === 'recent-replies') && account.recent_replies ) {
              tab_content = <div>
                  <PostsList
                  emptyText={translate('user_hasnt_had_any_replies_yet', {name}) + '.'}
                  posts={account.recent_replies}
                  loading={fetching}
                  category="recent_replies"
                  loadMore={this.loadMore}
                  showSpam={false} />
                  {isMyAccount && <MarkNotificationRead fields="comment_reply" account={account.name} />}
              </div>;
        }
        else if( section === 'permissions' && isMyAccount ) {
            walletClass = 'active'
            tab_content = <div>
                <div className="row">
                    <div className="column">
                        <WalletSubMenu account_name={account.name} />
                    </div>
                </div>
                <br />
                <UserKeys account={accountImm} />
                {isMyAccount && <MarkNotificationRead fields="account_update" account={account.name} />}
                </div>;
        } else if( section === 'password' ) {
            walletClass = 'active'
            tab_content = <div>
                    <div className="row">
                        <div className="column">
                            <WalletSubMenu account_name={account.name} />
                        </div>
                    </div>
                    <br />
                    <PasswordReset account={accountImm} />
                </div>
        } else {
        //    console.log( "no matches" );
        }

        if (!(section === 'transfers' || section === 'permissions' || section === 'password')) {
            tab_content = <div className="row">
                <div className="UserProfile__tab_content column">
                    {tab_content}
                </div>
            </div>;
        }

        let printLink = null;
        if( section === 'permissions' ) {
           if(isMyAccount && wifShown) {
               printLink = <div><a className="float-right noPrint" onClick={onPrint}>
                       <Icon name="printer" />&nbsp;{translate('print')}&nbsp;&nbsp;
                   </a></div>
           }
        }

        const wallet_tab_active = section === 'transfers' || section === 'password' || section === 'permissions' ? 'active' : ''; // className={wallet_tab_active}

        let rewardsMenu = [
            {link: `/@${accountname}/curation-rewards`, label: translate('curation_rewards'), value: translate('curation_rewards')},
            {link: `/@${accountname}/author-rewards`, label: translate('author_rewards'), value: translate('author_rewards')}
        ];

        // set account join date
        let accountjoin = account.created;

        const top_menu = <div className="row UserProfile__top-menu">
            <div className="columns small-10 medium-12 medium-expand">
                <ul className="menu" style={{flexWrap: "wrap"}}>
                    <li><Link to={`/@${accountname}`} activeClassName="active">{translate('blog')}</Link></li>
                    <li><Link to={`/@${accountname}/comments`} activeClassName="active">{translate('comments')}</Link></li>
                    <li><Link to={`/@${accountname}/recent-replies`} activeClassName="active">
                        {translate('replies')} {isMyAccount && <NotifiCounter fields="comment_reply"/>}
                    </Link></li>
                    {/*<li><Link to={`/@${accountname}/feed`} activeClassName="active">Feed</Link></li>*/}
                    <li>
                        <LinkWithDropdown
                            closeOnClickOutside
                            dropdownPosition="bottom"
                            dropdownAlignment="right"
                            dropdownContent={
                                <VerticalMenu items={rewardsMenu} />
                            }
                        >
                            <a className={rewardsClass}>
                                {translate('rewards')}
                                <Icon name="dropdown-arrow" />
                            </a>
                        </LinkWithDropdown>
                    </li>
                </ul>
            </div>
            <div className="columns shrink">
                <ul className="menu" style={{flexWrap: "wrap"}}>
                    <li>
                        <a href={`/@${accountname}/transfers`} className={walletClass} onClick={e => { e.preventDefault(); browserHistory.push(e.target.pathname); return false; }}>
                            {translate('wallet')} {isMyAccount && <NotifiCounter fields="send,receive,account_update" />}
                        </a>
                    </li>
                    {isMyAccount && <li>
                        <Link to={`/@${accountname}/settings`} activeClassName="active">{translate('settings')}</Link>
                    </li>}
                </ul>
            </div>
         </div>;

        return (
            <div className="UserProfile">

                <div className="UserProfile__banner row expanded">

                    <div className="column">
                        <div style={{position: "relative"}}>
                            <div className="UserProfile__buttons">
                                <Follow follower={username} following={accountname} what="blog" />
                            </div>
                        </div>
                        <h2>
                            <Userpic account={account.name} hideIfDefault />
                            {account.name}{' '}
                            <Tooltip t={translate('this_is_users_reputations_score_it_is_based_on_history_of_votes', {name})}><span style={{fontSize: "80%"}}>({rep})</span></Tooltip>
                        </h2>

                        <div>
                            <div className="UserProfile__stats">
                                <span>
                                    <Link to={`/@${accountname}/followers`}>{followerCount ? translate('follower_count', {followerCount}) : translate('followers')}</Link>
                                    {isMyAccount && <NotifiCounter fields="follow" />}
                                </span>
                                <span><Link to={`/@${accountname}`}>{translate('post_count', {postCount: account.post_count || 0})}</Link></span>
                                <span><Link to={`/@${accountname}/followed`}>{followingCount ? translate('followed_count', {followingCount}) : translate('following')}</Link></span>
                            </div>
                        </div>
                        <DateJoinWrapper date={accountjoin}></DateJoinWrapper>
                    </div>
                </div>
                <div className="UserProfile__top-nav row expanded noPrint">
                    {top_menu}
                </div>
                <div>
                  {printLink}
                </div>
                <div>
                  {tab_content}
                </div>
            </div>
        );
    }
}

module.exports = {
    path: '@:accountname(/:section)',
    component: connect(
        state => {
            const wifShown = state.global.get('UserKeys_wifShown')
            const current_user = state.user.get('current')
            // const current_account = current_user && state.global.getIn(['accounts', current_user.get('username')])
            return {
                discussions: state.global.get('discussion_idx'),
                global: state.global,
                current_user,
                // current_account,
                wifShown,
                loading: state.app.get('loading')
            };
        },
        dispatch => ({
            login: () => {dispatch(user.actions.showLogin())},
            clearTransferDefaults: () => {dispatch(user.actions.clearTransferDefaults())},
            showTransfer: (transferDefaults) => {
                dispatch(user.actions.setTransferDefaults(transferDefaults))
                dispatch(user.actions.showTransfer())
            },
            withdrawVesting: ({account, vesting_shares, errorCallback, successCallback}) => {
                const successCallbackWrapper = (...args) => {
                    dispatch({type: 'global/GET_STATE', payload: {url: `@${account}/transfers`}})
                    return successCallback(...args)
                }
                dispatch(transaction.actions.broadcastOperation({
                    type: 'withdraw_vesting',
                    operation: {account, vesting_shares},
                    errorCallback,
                    successCallback: successCallbackWrapper,
                }))
            },
            requestData: (args) => dispatch({type: 'REQUEST_DATA', payload: args}),
        })
    )(UserProfile)
};
