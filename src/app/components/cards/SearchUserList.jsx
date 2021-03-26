import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, browserHistory } from 'react-router';
import { imageProxy } from 'app/utils/ProxifyUrl';
import { highlightKeyword } from 'app/utils/ExtractContent';
import * as userActions from 'app/redux/UserReducer';
import * as transactionActions from 'app/redux/TransactionReducer';
import tt from 'counterpart';
import USERLOGO from 'app/assets/images/user-static.png';
import { Set, Map } from 'immutable';

export const SIZE_SMALL = 'small';
export const SIZE_MED = 'medium';
export const SIZE_LARGE = 'large';

class SearchUserList extends Component {
    imgErrorFun(event) {
        event.target.src = USERLOGO;
        event.target.οnerrοr = null; //控制图片显示区域不要一直跳动
    }

    checkIfLogin = isFollow => {
        const {
            loggedIn,
            allFollowing,
            username,
            name,
            showLogin,
            updateFollow,
            ignoreList,
        } = this.props;
        if (!loggedIn) {
            return showLogin();
        } else {
            if (isFollow) {
                updateFollow(username, name, '', ignoreList, () => {
                    //console.log('取消关注');
                });
            } else {
                updateFollow(username, name, 'blog', ignoreList, () => {
                    //console.log('关注');
                });
            }
        }
        return true;
    };

    renderFollow = () => {
        const { loggedIn, allFollowing, name } = this.props;
        let isFollow = false;
        if (!loggedIn) {
            isFollow = false;
        } else {
            allFollowing &&
                allFollowing.map((item, i) => {
                    if (item === name) {
                        isFollow = true;
                    }
                });
        }
        return (
            <a
                className="follow-btn"
                onClick={() => this.checkIfLogin(isFollow)}
            >
                {isFollow ? tt('g.unfollow') : tt('g.follow')}
            </a>
        );
    };

    render() {
        const {
            profile_image,
            name,
            reputation,
            followers,
            post_count,
            loggedIn,
            allFollowing,
            search_type,
        } = this.props;
        const url = imageProxy() + `u/${name}/avatar/${SIZE_MED}`;
        const keyWord = process.env.BROWSER
            ? decodeURI(window.location.search).split('=')[1]
            : null;
        const highlightColor = '#00FFC8';
        return (
            <div className="search-userlist">
                <div className="search-userlist-left">
                    <div className="search-userlist-left-top">
                        <a href={'/@' + name} target="_blank">
                            <img
                                className="user-logo"
                                src={url}
                                onError={event => this.imgErrorFun(event)}
                            />
                        </a>
                        <span
                            className="user-name"
                            dangerouslySetInnerHTML={{
                                __html: highlightKeyword(
                                    name,
                                    keyWord,
                                    highlightColor
                                ),
                            }}
                        />
                        <span className="user-repution">{`(${Math.floor(
                            reputation
                        )})`}</span>
                    </div>
                    <div className="search-userlist-left-bottom">
                        <span className="user-follower">
                            {followers > 1
                                ? tt('g.many_followers', { count: followers })
                                : tt('g.one_follower', { count: followers })}
                        </span>
                        <span>
                            {post_count > 1
                                ? tt('g.many_posts', { count: post_count })
                                : tt('g.one_post', { count: post_count })}
                        </span>
                    </div>
                </div>
                <div className="search-userlist-right">
                    {this.renderFollow()}
                </div>
            </div>
        );
    }
}

const emptyMap = Map();
const emptySet = Set();

export default connect(
    (state, props) => {
        const { post } = props;
        const username = state.user.getIn(['current', 'username']);
        const loggedIn = !!username;
        const f = state.global.getIn(
            ['follow', 'getFollowingAsync', username],
            emptyMap
        );

        // the line below was commented out by val - I think it's broken so sometimes the loading indicator is shown forever
        // const loading = f.get('blog_loading', false) || f.get('ignore_loading', false)
        const ignoreList = f.get('ignore_result', emptySet);

        return {
            follow: typeof props.follow === 'undefined' ? true : props.follow,
            name: post.get('name'),
            reputation: post.get('reputation'),
            followers: post.get('followers'),
            following: post.get('following'),
            post_count: post.get('post_count'),
            profile_image: post.get('profile_image'),
            search_type: post.get('_index'),
            allFollowing: state.global.getIn([
                'follow',
                'getFollowingAsync',
                username,
                'blog_result',
            ]),
            username,
            loggedIn,
            ignoreList,
        };
    },
    dispatch => ({
        showLogin: e => {
            if (e) e.preventDefault();
            dispatch(userActions.showLogin({ type: 'basic' }));
        },
        logout: e => {
            if (e) e.preventDefault();
            dispatch(userActions.logout({ type: 'default' }));
        },
        updateFollow: (follower, following, action, ignoreList, done) => {
            const what = [
                action,
                ignoreList.contains(following) ? 'ignore' : '',
            ];
            const json = ['follow', { follower, following, what }];
            dispatch(
                transactionActions.broadcastOperation({
                    type: 'custom_json',
                    operation: {
                        id: 'follow',
                        required_posting_auths: [follower],
                        json: JSON.stringify(json),
                    },
                    successCallback: done,
                    // TODO: Why?
                    errorCallback: done,
                })
            );
        },
    })
)(SearchUserList);
