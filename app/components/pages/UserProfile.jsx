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
import Follow from 'app/components/elements/Follow';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import PostsList from 'app/components/cards/PostsList';
import {isFetchingOrRecentlyUpdated} from 'app/utils/StateFunctions';

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
        if (!last_post) return;
        const order = 'by_author';
        if (isFetchingOrRecentlyUpdated(this.props.global.get('status'), order, category)) return;
        const [author, permlink] = last_post.split('/');
        this.props.requestData({author, permlink, order, category});
    }

    render() {
        const {
            props: {current_user, wifShown},
            onPrint
        } = this;
        let { accountname, section } = this.props.routeParams;
        const username = current_user ? current_user.get('username') : null
        if( !section ) section = 'blog';

        // const isMyAccount = current_user ? current_user.get('username') === accountname : false;
        let account
        let accountImm = this.props.global.getIn(['accounts', accountname]);
        if( accountImm ) account = accountImm.toJS();
        else {
            return <div><center>Unknown Account</center></div>
        }
        const isMyAccount = username === account.name
        let tab_content = null;

        const global_status = this.props.global.get('status');
        const status = global_status ? global_status.getIn([section, 'by_author']) : null;
        const fetching = (status && status.fetching) || this.props.loading;

        if( section === 'transfers' ) {
            tab_content = <UserWallet global={this.props.global}
                          account={account}
                          showTransfer={this.props.showTransfer}
                          current_user={current_user}
                          withdrawVesting={this.props.withdrawVesting} />
        }
        else if( section === 'curation-rewards' ) {
            tab_content = <CurationRewards global={this.props.global}
                          account={account}
                          current_user={current_user}
                          />
        }
        else if( section === 'author-rewards' ) {
            tab_content = <AuthorRewards global={this.props.global}
                          account={account}
                          current_user={current_user}
                          />
        }
        else if( section === 'posts' && account.post_history ) {
           if( account.posts )
           {
              // const post_log = account.posts.map( item => {
              //     return (<li style={{listStyleType: 'none'}} key={item}>
              //         <PostSummary post={account.name+'/'+item} currentCategory="-" />
              //     </li>);
              //  });
              tab_content = <PostsList
                  emptyText={`Looks like ${account.name} hasn't made any posts yet!`}
                  posts={account.posts.map(p => `${account.name}/${p}`)}
                  loading={fetching}
                  category="posts"
                  loadMore={null} />;
           }
           else {
              tab_content = (<center><LoadingIndicator type="circle" /></center>);
           }
        } else if(!section  || section === 'blog') {
            if (account.blog) {
                // const blog_summary = account.blog.map(item => {
                //     return (<li style={{listStyleType: 'none'}} key={item}>
                //         <PostSummary post={accountname + '/' + item} currentCategory="-" />
                //     </li>);
                // });
                tab_content = <PostsList
                    emptyText={`Looks like ${account.name} hasn't started blogging yet!`}
                    posts={account.blog.map(p => `${account.name}/${p}`)}
                    loading={fetching}
                    category="blog"
                    loadMore={this.loadMore} />;
            } else {
                tab_content = (<center><LoadingIndicator type="circle" /></center>);
            }

        }
        else if( (section === 'recent-replies') && account.recent_replies ) {
           const reply_summary = account.recent_replies.map( item => {
               return (<li style={{listStyleType: 'none'}} key={item}>
                   <PostSummary post={item} currentCategory="-" />
               </li>);
            });
            tab_content = reply_summary.length ? reply_summary :
                <div>{account.name} hasn't had any replies yet.</div>;
        }
        else if( section === 'permissions' && isMyAccount ) {
            tab_content = <UserKeys account={accountImm} />
        } else if( section === 'password' ) {
            tab_content = <PasswordReset account={accountImm} />
        } else {
        //    console.log( "no matches" );
        }

        let printLink = null;
        let section_title = account.name + ' / ' + section;
        if( section === 'blog' ) {
           section_title = account.name + "'s blog";
        } else if( section === 'transfers' ) {
           section_title = account.name + "'s wallet";
        } else if( section === 'curation-rewards' ) {
          section_title = account.name + "'s curation rewards";
      } else if( section === 'author-rewards' ) {
        section_title = account.name + "'s author rewards";
        } else if( section === 'password' ) {
           section_title = ''
        } else if( section === 'permissions' ) {
           section_title = account.name + "'s permissions"
           if(isMyAccount && wifShown) {
               printLink = <a className="float-right" onClick={onPrint}>
                   <Icon name="printer" />&nbsp;Print&nbsp;&nbsp;
               </a>
           }
        } else if( section === 'posts' ) {
           section_title = account.name + "'s posts";
        } else if( section === 'recent-replies' ) {
           section_title = 'Recent replies to ' + account.name + "'s posts";
        }

        const wallet_tab_active = section === 'transfers' || section === 'password' || section === 'permissions' ? 'active' : '';

        const top_menu = <div className="UserProfile__top-nav row">
            <div className="columns small-12 medium-expand">
                <ul className="menu">
                    <li><Link to={`/@${accountname}`} activeClassName="active">Blog</Link></li>
                    <li><Link to={`/@${accountname}/posts`} activeClassName="active">Posts</Link></li>
                    <li><Link to={`/@${accountname}/recent-replies`} activeClassName="active">Replies</Link></li>
                    <li><Link to={`/@${accountname}/curation-rewards`} activeClassName="active">Curation rewards</Link></li>
                    <li><Link to={`/@${accountname}/author-rewards`} activeClassName="active">Author rewards</Link></li>
                    <li><Link to={`/@${accountname}/transfers`} className={wallet_tab_active} activeClassName="active">Wallet</Link></li>
                </ul>
            </div>
            {isMyAccount && <div className="columns shrink">
                <ul className="menu">
                    <li><Link to={`/@${account.name}/permissions`} activeClassName="active">Permissions</Link></li>
                    <li><Link to={`/@${account.name}/password`} activeClassName="active">Change Password</Link></li>
                </ul>
            </div>}
         </div>;
        return (
            <div className="UserProfile">
                <div className="row">
                    <div className="column">
                        {top_menu}
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <span className="float-right">
                            {section === 'blog' && <Follow follower={username} following={accountname} what={section} />}
                        </span>
                        {printLink}
                        {/*section_title && <h2 className="UserProfile__section-title">{section_title}</h2>*/}
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
                loading: state.app.get('loading'),
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
