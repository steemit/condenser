import Immutable from 'immutable';
import React from 'react';
import { Link } from 'react-router';
import {connect} from 'react-redux';
import Icon from 'app/components/elements/Icon';
import user from 'app/redux/User';
import { browserHistory } from 'react-router';
import { LinkWithDropdown } from 'react-foundation-components/lib/global/dropdown';
import VerticalMenu from 'app/components/elements/VerticalMenu';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';

const defaultNavigate = (e) => {
    e.preventDefault();
    const a = e.target.nodeName.toLowerCase() === 'a' ? e.target : e.target.parentNode;
    browserHistory.push(a.pathname + a.search + a.hash);
};

function TopRightMenu({username, showLogin, logout, loggedIn, showSignUp, userpic, vertical, navigate, toggleOffCanvasMenu, probablyLoggedIn}) {
    const mcn = 'menu' + (vertical ? ' vertical show-for-small-only' : '');
    const mcl = vertical ? '' : ' sub-menu';
    const lcn = vertical ? '' : 'show-for-medium';
    const nav = navigate || defaultNavigate;
    const submit_story = $STM_Config.read_only_mode ? null : <li className={lcn + ' submit-story'}><a href="/submit.html" onClick={nav}>Submit a Story</a></li>;
    const userpic_src = userpic || require('app/assets/images/user.png');
    const feed_link = `/@${username}/feed`;
    const replies_link = `/@${username}/recent-replies`;
    const wallet_link = `/@${username}/transfers`;
    const account_link = `/@${username}`;
    const posts_link = `/@${username}/posts`;
    const reset_password_link = `/@${username}/password`;
    if (loggedIn) { // change back to if(username) after bug fix:  Clicking on Login does not cause drop-down to close #TEMP!
        const user_menu = [
            {link: feed_link, value: 'Feed'},
            {link: account_link, value: 'Blog'},
            {link: posts_link, value: 'Comments'},
            {link: replies_link, value: 'Replies'},
            {link: wallet_link, value: 'Wallet'},
            {link: reset_password_link, value: 'Change Password'},
            loggedIn ?
                {link: '#', onClick: logout, value: 'Logout'} :
                {link: '#', onClick: showLogin, value: 'Login'}
        ];
        return (
            <ul className={mcn + mcl}>
                <li className={lcn}><a href="/static/search.html" title="Search">{vertical ? <span>Search</span> : <Icon name="search" />}</a></li>
                {submit_story}
                <LinkWithDropdown
                    closeOnClickOutside
                    dropdownPosition="bottom"
                    dropdownAlignment="right"
                    dropdownContent={
                                <VerticalMenu items={user_menu} title={username} />
                              }
                >
                    {!vertical && <li className={'Header__userpic '}>
                        <a href={account_link} title={username} onClick={e => e.preventDefault()}>
                            <img src={userpic_src} width="36" height="36" />
                        </a>
                    </li>}
                </LinkWithDropdown>
                {toggleOffCanvasMenu && <li className="toggle-menu"><a href="#" onClick={toggleOffCanvasMenu}>
                    <span className="hamburger" />
                </a></li>}
            </ul>
        );
    }
    if (probablyLoggedIn) {
        return (
            <ul className={mcn + mcl}>
                {!vertical && <li><a href="/static/search.html" title="Search"><Icon name="search" /></a></li>}
                <li className={lcn}><LoadingIndicator type="circle" inline /></li>
                {toggleOffCanvasMenu && <li className="toggle-menu"><a href="#" onClick={toggleOffCanvasMenu}>
                    <span className="hamburger" />
                </a></li>}
            </ul>
        );
    }
    return (
        <ul className={mcn + mcl}>
            {!vertical && <li><a href="/static/search.html" title="Search"><Icon name="search" /></a></li>}
            <li className={lcn}><a href="/create_account" onClick={showSignUp}>Sign Up</a></li>
            <li className={lcn}><a href="/login.html" onClick={showLogin}>Login</a></li>
            {submit_story}
            {toggleOffCanvasMenu && <li className="toggle-menu"><a href="#" onClick={toggleOffCanvasMenu}>
                <span className="hamburger" />
            </a></li>}
        </ul>
    );
}

TopRightMenu.propTypes = {
    username: React.PropTypes.string,
    loggedIn: React.PropTypes.bool,
    probablyLoggedIn: React.PropTypes.bool,
    userpic: React.PropTypes.string,
    showLogin: React.PropTypes.func.isRequired,
    showSignUp: React.PropTypes.func.isRequired,
    logout: React.PropTypes.func.isRequired,
    vertical: React.PropTypes.bool,
    navigate: React.PropTypes.func,
    toggleOffCanvasMenu: React.PropTypes.func
};

export default connect(
    state => {
        if (!process.env.BROWSER) {
            return {
                username: null,
                userpic: null,
                loggedIn: false,
                probablyLoggedIn: !!state.offchain.get('account')
            }
        }
        const username = state.user.getIn(['current', 'username']);
        const loggedIn = !!username;
        return {
            username,
            userpic: null, // state.offchain.getIn(['user', 'picture']),
            loggedIn,
            probablyLoggedIn: false
        }
    },
    dispatch => ({
        showLogin: e => {
            if (e) e.preventDefault();
            dispatch(user.actions.showLogin())
        },
        logout: e => {
            if (e) e.preventDefault();
            dispatch(user.actions.logout())
        },
        showSignUp: e => {
            if (e) e.preventDefault();
            dispatch(user.actions.showSignUp())
        }
    })
)(TopRightMenu);
