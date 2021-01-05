import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, browserHistory } from 'react-router';
import { imageProxy } from 'app/utils/ProxifyUrl';
import { highlightKeyword } from 'app/utils/ExtractContent';
import * as userActions from 'app/redux/UserReducer';

export const SIZE_SMALL = 'small';
export const SIZE_MED = 'medium';
export const SIZE_LARGE = 'large';

class SearchUserList extends Component {
    checkIfLogin = () => {
        const { loggedIn, showLogin } = this.props;
        if (!loggedIn) {
            return showLogin();
        }
        return true;
    };

    render() {
        const {
            profile_image,
            name,
            reputation,
            followers,
            post_count,
            loggedIn,
        } = this.props;
        const url = imageProxy() + `u/${name}/avatar/${SIZE_MED}`;
        const keyWord = decodeURI(window.location.search).split('=')[1];
        const highlightColor = '#00FFC8';
        return (
            <div className="search-userlist">
                <div className="search-userlist-left">
                    <div className="search-userlist-left-top">
                        <a>
                            <img className="user-logo" src={url} />
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
                        <span className="user-repution">{`(${
                            reputation
                        })`}</span>
                    </div>
                    <div className="search-userlist-left-bottom">
                        <span className="user-follower">
                            {followers}个关注者
                        </span>
                        <span>{post_count}个帖子</span>
                    </div>
                </div>
                <div className="search-userlist-right">
                    <a className="follow-btn" onClick={this.checkIfLogin}>
                        {loggedIn ? '取消关注' : '关注'}
                    </a>
                </div>
            </div>
        );
    }
}

export default connect(
    (state, props) => {
        const { post } = props;
        const username = state.user.getIn(['current', 'username']);
        const loggedIn = !!username;
        return {
            follow: typeof props.follow === 'undefined' ? true : props.follow,
            name: post.get('name'),
            reputation: post.get('reputation'),
            followers: post.get('followers'),
            following: post.get('following'),
            post_count: post.get('post_count'),
            profile_image: post.get('profile_image'),
            username,
            loggedIn,
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
    })
)(SearchUserList);
