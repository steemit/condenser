/* eslint react/prop-types: 0 */
import React from 'react';
import { Link } from 'react-router';
import {connect} from 'react-redux';
import transaction from 'app/redux/Transaction';
import user from 'app/redux/User';
import Icon from 'app/components/elements/Icon'
import PostSummary from 'app/components/cards/PostSummary';
import UserKeys from 'app/components/elements/UserKeys';
import PasswordReset from 'app/components/elements/PasswordReset';
import UserWallet from 'app/components/modules/UserWallet';
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
import DateJoinWrapper from 'app/components/elements/DateJoinWrapper'

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
        if( accountImm ) account = accountImm.toJS();
        else {
            return <div><center>Unknown Account</center></div>
        }

        let followerCount = 0, followingCount = 0;
        const followers = this.props.global.getIn( ['follow', 'get_followers', accountname] );
        const following = this.props.global.getIn( ['follow', 'get_following', accountname] );
        // let loadingFollowers = true, loadingFollowing = true;

        if (followers && followers.has('result')) {
            followerCount = followers.get('result').filter(a => {
                return a.get(0) === "blog";
            }).size;
            // loadingFollowers = followers.get("loading");
        }

        if (following && following.has('result')) {
            followingCount = following.get('result').filter(a => {
                return a.get(0) === "blog";
            }).size;
            // loadingFollowing = following.get("loading");
        }

        // Reputation
        const rep = repLog10(account.reputation);

        const isMyAccount = username === account.name
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

        let rewardsClass = "";
        if( section === 'transfers' ) {
            tab_content = <UserWallet global={this.props.global}
                          account={account}
                          showTransfer={this.props.showTransfer}
                          current_user={current_user}
                          withdrawVesting={this.props.withdrawVesting} />
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
                tab_content = <UserList
                          title="Followers"
                          account={account}
                          users={followers}
                          />
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
        else if( section === 'comments' && account.post_history ) {
           // NOTE: `posts` key will be renamed to `comments` (https://github.com/steemit/steem/issues/507)
           //   -- see also GlobalReducer.js
           if( account.posts )
           {
              tab_content = <PostsList
                  emptyText={`Looks like ${account.name} hasn't made any comments yet!`}
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
                    Looks like you haven't posted anything yet.<br />
                    <Link to="/submit.html">Submit a Story</Link><br />
                    <a href="/steemit/@thecryptofiend/the-missing-faq-a-beginners-guide-to-using-steemit">Read The Beginner's Guide</a>
                </div>:
                    <div>Looks like {account.name} hasn't started blogging yet!</div>;
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
        // else if(!section || section === 'feed') {
        //     if (account.feed) {
        //         tab_content = <PostsList
        //             emptyText={`Looks like ${account.name} hasn't followed anything yet!`}
        //             posts={account.feed}
        //             loading={fetching}
        //             category="feed"
        //             loadMore={this.loadMore}
        //             showSpam />;
        //     } else {
        //         tab_content = (<center><LoadingIndicator type="circle" /></center>);
        //     }
        // }
        else if( (section === 'recent-replies') && account.recent_replies ) {
              tab_content = <PostsList
                  emptyText={`${account.name} hasn't had any replies yet.`}
                  posts={account.recent_replies}
                  loading={fetching}
                  category="recent_replies"
                  loadMore={this.loadMore}
                  showSpam={false} />;
        }
        else if( section === 'permissions' && isMyAccount ) {
            tab_content = <UserKeys account={accountImm} />
        } else if( section === 'password' ) {
            tab_content = <PasswordReset account={accountImm} />
        } else {
        //    console.log( "no matches" );
        }

        let printLink = null;
        if( section === 'permissions' ) {
           if(isMyAccount && wifShown) {
               printLink = <div>
                   <a className="float-right noPrint" onClick={onPrint}>
                       <Icon name="printer" />&nbsp;
                       Print
                   </a>
               </div>
           }
        }

        const wallet_tab_active = section === 'transfers' || section === 'password' || section === 'permissions' ? 'active' : ''; // className={wallet_tab_active}

        let rewardsMenu = [
            {link: `/@${accountname}/curation-rewards`, label: "Curation rewards", value: "Curation rewards"},
            {link: `/@${accountname}/author-rewards`, label: "Author rewards", value: "Author rewards"}
        ];

        // set account join date
        let accountjoin = account.created;

        const top_menu = <div className="row UserProfile__top-menu">
            <div className="columns small-10 medium-12 medium-expand">
                <ul className="menu" style={{flexWrap: "wrap"}}>
                    <li><Link to={`/@${accountname}`} activeClassName="active">Blog</Link></li>
                    <li><Link to={`/@${accountname}/comments`} activeClassName="active">Comments</Link></li>
                    <li><Link to={`/@${accountname}/recent-replies`} activeClassName="active">Replies</Link></li>
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
                                Rewards
                                <Icon name="dropdown-arrow" />
                            </a>
                        </LinkWithDropdown>
                    </li>

                </ul>
            </div>
            <div className="columns shrink">
                <ul className="menu" style={{flexWrap: "wrap"}}>
                    <li><Link to={`/@${accountname}/transfers`} activeClassName="active">Wallet</Link></li>
                    {wallet_tab_active && isMyAccount && <li><Link to={`/@${account.name}/permissions`} activeClassName="active">Permissions</Link></li>}
                    {wallet_tab_active && isMyAccount && <li><Link to={`/@${account.name}/password`} activeClassName="active">Password</Link></li>}
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
                        <h2>{account.name} <Tooltip t={`This is ${accountname}'s reputation score.\n\nThe reputation score is based on the history of votes received by the account, and is used to hide low quality content.`}><span style={{fontSize: "80%"}}>({rep})</span></Tooltip></h2>
                        <div>
                            <div className="UserProfile__stats">
                                <span><Link to={`/@${accountname}/followers`}>{followerCount} followers</Link></span>
                                <span>{account.post_count} posts</span>
                                <span><Link to={`/@${accountname}/followed`}>{followingCount} followed</Link></span>
                            </div>
                        </div>
                        <DateJoinWrapper date={accountjoin}></DateJoinWrapper>
                    </div>
                </div>
                <div className="UserProfile__top-nav row expanded noPrint">
                    {top_menu}
                </div>
                <div className="row">
                    <div className="column">
                        {printLink}
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        {tab_content}
                    </div>
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
