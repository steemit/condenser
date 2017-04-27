import Immutable from 'immutable';
import React from 'react';
import { Link } from 'react-router';
import {connect} from 'react-redux';
import Icon from 'app/components/elements/Icon';
import user from 'app/redux/User';
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

function TopRightMenu({username, showLogin, logout, loggedIn, vertical, navigate, toggleOffCanvasMenu, probablyLoggedIn, showSignUp, location}) {
    const mcn = 'menu' + (vertical ? ' vertical show-for-small-only' : '');
    const mcl = vertical ? '' : ' sub-menu';
    const lcn = vertical ? '' : 'show-for-medium';
    const nav = navigate || defaultNavigate;
    const submit_story = $STM_Config.read_only_mode ? null : <li className={lcn + ' submit-story'}><a href="/submit.html" onClick={nav}>{tt('g.submit_a_story')}</a></li>;
    const user_information_button = <li className={lcn + ' buttons'}><Link to="/about" className="button success">{tt('g.about_project')}</Link></li>;
    const feed_link = `/@${username}/feed`;
    const replies_link = `/@${username}/recent-replies`;
    const wallet_link = `/@${username}/transfers`;
    const settings_link = `/@${username}/settings`;
    const account_link = `/@${username}`;
    const comments_link = `/@${username}/comments`;
    const posts_link = `/@${username}/posts`;
    const reset_password_link = `/@${username}/password`;

    const inIco = location && location.pathname.indexOf("/about") == 0;
    const ico_menu = [
        {link: '#what-is-golos', value: tt('g.video')},
        {link: '#docs', value: tt('g.documentation')},
        {link: '#faq', value: tt('navigation.faq')},
        {link: '#team', value: tt('g.team')},
    ];
    if (loggedIn) { // change back to if(username) after bug fix:  Clicking on Login does not cause drop-down to close #TEMP!
        const user_menu = [
            {link: feed_link, value: tt('g.feed'), addon: <NotifiCounter fields="feed" />},
            {link: account_link, value: tt('g.blog')},
            {link: comments_link, value: tt('g.comments')},
            {link: replies_link, value: tt('g.replies'), addon: <NotifiCounter fields="comment_reply" />},
            {link: wallet_link, value: tt('g.wallet'), addon: <NotifiCounter fields="follow,send,receive,account_update" />},
            {link: reset_password_link, value: tt('g.change_password')},
            {link: settings_link, value: tt('g.settings')},
            loggedIn ?
                {link: '#', onClick: logout, value: tt('g.logout')} :
                {link: '#', onClick: showLogin, value: tt('g.login')}
        ];
        return (
            <ul className={mcn + mcl}>
                {inIco ? ico_menu.map((o,i) => {return <li key={i} className={lcn}><a href={o.link}>{o.value}</a></li>}) : user_information_button}
                {!inIco && <li className={lcn}><a href="/static/search.html" title="Search">{vertical ? <span>{tt('g.search')}</span> : <Icon name="search" />}</a></li>}
                {!inIco && submit_story}
                <LinkWithDropdown
                    closeOnClickOutside
                    dropdownPosition="bottom"
                    dropdownAlignment="right"
                    dropdownContent={<VerticalMenu items={user_menu} title={username} />}
                >
                    {!vertical && <li className={'Header__userpic '}>
                        <a href={account_link} title={username} onClick={e => e.preventDefault()}>
                            <Userpic account={username} />
                        </a>
                        <div className="TopRightMenu__notificounter"><NotifiCounter fields="total" /></div>
                    </li>}
                </LinkWithDropdown>
                {toggleOffCanvasMenu && <li className="toggle-menu"><a href="#" onClick={toggleOffCanvasMenu}>
                    <span className="hamburger" />
                </a></li>}
            </ul>
        );
    }
    return (
        <ul className={mcn + mcl}>
            {inIco ? ico_menu.map((o,i) => {return <li key={i} className={lcn}><a href="{o.link}">{o.value}</a></li>}) : user_information_button }
            {!inIco && !vertical && <li><a href="/static/search.html" title={tt('g.search')}><Icon name="search" /></a></li>}
            {!inIco && !probablyLoggedIn && <li className={lcn}><a href="/create_account" onClick={showSignUp}>{tt('g.sign_up')}</a></li>}
            {!inIco && !probablyLoggedIn && <li className={lcn}><a href="/login.html" onClick={showLogin}>{tt('g.login')}</a></li>}
            {!inIco && !probablyLoggedIn && submit_story}
            {probablyLoggedIn && <li className={lcn}><LoadingIndicator type="circle" inline /></li>}
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
    showLogin: React.PropTypes.func.isRequired,
    logout: React.PropTypes.func.isRequired,
    vertical: React.PropTypes.bool,
    navigate: React.PropTypes.func,
    toggleOffCanvasMenu: React.PropTypes.func,
    showSignUp: React.PropTypes.func.isRequired
};

export default connect(
    state => {
        if (!process.env.BROWSER) {
            return {
                username: null,
                loggedIn: false,
                probablyLoggedIn: !!state.offchain.get('account')
            }
        }
        const username = state.user.getIn(['current', 'username']);
        const loggedIn = !!username;
        return {
            username,
            loggedIn,
            probablyLoggedIn: false
        }
    },
    dispatch => ({
        showLogin: e => {
            if (e) e.preventDefault();
            dispatch(user.actions.showLogin())
        },
        showSignUp: e => {
            if (e) e.preventDefault();
            dispatch(user.actions.showSignUp())
        },
        logout: e => {
            if (e) e.preventDefault();
            dispatch(user.actions.logout())
        }
    })
)(TopRightMenu);
