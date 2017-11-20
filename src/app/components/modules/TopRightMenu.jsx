import React from 'react';
import { Link } from 'react-router';
import {connect} from 'react-redux';
import Icon from 'app/components/elements/Icon';
import Userpic from 'app/components/elements/Userpic';
import { browserHistory } from 'react-router';
import { LinkWithDropdown } from 'react-foundation-components/lib/global/dropdown';
import VerticalMenu from 'app/components/elements/VerticalMenu';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import NotifiCounter from 'app/components/elements/NotifiCounter';
import tt from 'counterpart';

const defaultNavigate = (e) => {
    if (e.metaKey || e.ctrlKey) {
        // prevent breaking anchor tags
    } else {
        e.preventDefault();
    }
    const a = e.target.nodeName.toLowerCase() === 'a' ? e.target : e.target.parentNode;
    browserHistory.push(a.pathname + a.search + a.hash);
};

function TopRightMenu({username, showLogin, logout, loggedIn, vertical, navigate, toggleOffCanvasMenu, probablyLoggedIn, nightmodeEnabled, toggleNightmode}) {
    const mcn = 'menu' + (vertical ? ' vertical show-for-small-only' : '');
    const mcl = vertical ? '' : ' sub-menu';
    const lcn = vertical ? '' : 'show-for-medium';
    const nav = navigate || defaultNavigate;
    const submit_story = $STM_Config.read_only_mode ? null : <li className={lcn + ' submit-story' + (vertical ? ' last' : '')}><a href="/submit.html" onClick={nav}>{tt('g.submit_a_story')}</a></li>;
    const submit_icon = $STM_Config.read_only_mode ? null : <li className="show-for-small-only"><Link to="/submit.html"><Icon name="pencil2" /></Link></li>;
    const feed_link = `/@${username}/feed`;
    const replies_link = `/@${username}/recent-replies`;
    const wallet_link = `/@${username}/transfers`;
    const account_link = `/@${username}`;
    const comments_link = `/@${username}/comments`;
    const reset_password_link = `/@${username}/password`;
    const settings_link = `/@${username}/settings`;
    const tt_search = tt('g.search');
    if (loggedIn) { // change back to if(username) after bug fix:  Clicking on Login does not cause drop-down to close #TEMP!
        const user_menu = [
            {link: feed_link, icon: "home", value: tt('g.feed'), addon: <NotifiCounter fields="feed" />},
            {link: account_link, icon: 'profile', value: tt('g.blog')},
            {link: comments_link, icon: 'replies', value: tt('g.comments')},
            {link: replies_link, icon: 'reply', value: tt('g.replies'), addon: <NotifiCounter fields="comment_reply" />},
            {link: wallet_link, icon: 'wallet', value: tt('g.wallet'), addon: <NotifiCounter fields="follow,send,receive,account_update" />},
            {link: '#', icon: 'eye', onClick: toggleNightmode, value: tt('g.toggle_nightmode') },
            {link: reset_password_link, icon: 'key', value: tt('g.change_password')},
            {link: settings_link, icon: 'cog', value: tt('g.settings')},
            loggedIn ?
                {link: '#', icon: 'enter', onClick: logout, value: tt('g.logout')} :
                {link: '#', onClick: showLogin, value: tt('g.login')}
        ];
        return (
            <ul className={mcn + mcl}>
                <li className={lcn + " Header__search"}><a href="/static/search.html" title={tt_search}>{vertical ? <span>{tt_search}</span> : <Icon name="search" />}</a></li>
                {submit_story}
                {!vertical && submit_icon}
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
                            <Userpic account={username} />
                        </a>
                        <div className="TopRightMenu__notificounter"><NotifiCounter fields="total" /></div>
                    </li>}
                </LinkWithDropdown>
                {toggleOffCanvasMenu && <li className="toggle-menu Header__hamburger"><a href="#" onClick={toggleOffCanvasMenu}>
                    <span className="hamburger" />
                </a></li>}
            </ul>
        );
    }
    if (probablyLoggedIn) {
        return (
            <ul className={mcn + mcl}>
                {!vertical && <li className="Header__search"><a href="/static/search.html" title={tt_search}><Icon name="search" /></a></li>}
                <li className={lcn} style={{paddingTop: 0, paddingBottom: 0}}><LoadingIndicator type="circle" inline /></li>
                {toggleOffCanvasMenu && <li className="toggle-menu Header__hamburger"><a href="#" onClick={toggleOffCanvasMenu}>
                    <span className="hamburger" />
                </a></li>}
            </ul>
        );
    }
    return (
        <ul className={mcn + mcl}>
            {!vertical && <li className="Header__search"><a href="/static/search.html" title={tt_search}><Icon name="search" /></a></li>}
            <li className={lcn}><a href="/pick_account">{tt('g.sign_up')}</a></li>
            <li className={lcn}><a href="/login.html" onClick={showLogin}>{tt('g.login')}</a></li>
            {submit_story}
            {!vertical && submit_icon}
            {toggleOffCanvasMenu && <li className="toggle-menu Header__hamburger"><a href="#" onClick={toggleOffCanvasMenu}>
                <span className="hamburger" />
            </a></li>}
        </ul>
    );
}

TopRightMenu.propTypes = {
    username: React.PropTypes.string,
    loggedIn: React.PropTypes.bool,
    probablyLoggedIn: React.PropTypes.bool,
    showLogin: React.PropTypes.func.isRequired,
    logout: React.PropTypes.func.isRequired,
    vertical: React.PropTypes.bool,
    navigate: React.PropTypes.func,
    toggleOffCanvasMenu: React.PropTypes.func,
    nightmodeEnabled: React.PropTypes.bool,
    toggleNightmode: React.PropTypes.func,
};

export default connect(
    state => {
        if (!process.env.BROWSER) {
            return {
                username: null,
                loggedIn: false,
                probablyLoggedIn: !!state.getIn(['offchain', 'account'])
            }
        }
        const username = state.getIn(['user', 'current', 'username']);
        const loggedIn = !!username;
        return {
            username,
            loggedIn,
            probablyLoggedIn: false,
            nightmodeEnabled: state.getIn(['user', 'user_preferences', 'nightmode']),
        }
    },
    dispatch => ({
        showLogin: e => {
            if (e) e.preventDefault();
            dispatch({type: 'user/SHOW_LOGIN'})
        },
        logout: e => {
            if (e) e.preventDefault();
            dispatch({type: 'user/LOGOUT'})
        },
        toggleNightmode: e => {
            if (e) e.preventDefault();
            dispatch({ type: 'TOGGLE_NIGHTMODE' });
        },
    })
)(TopRightMenu);
