import React, { Component } from 'react';
// import PropTypes from 'prop-types';
// import { withRouter } from 'react-router';

import { connect } from 'react-redux';
import tt from 'counterpart';

// import { APP_NAME } from 'app/client_config';
import { SIGNUP_URL } from 'shared/constants';

import * as userActions from 'app/redux/UserReducer';
import * as appActions from 'app/redux/AppReducer';
import normalizeProfile from 'app/utils/NormalizeProfile';

import { User, ChevronDown, Settings, LogOut } from 'react-feather';
// import { Transition } from 'react-spring';

import logo from 'assets/images/static/logo_white.png';

class NavBar extends Component {
    state = { showUserMenu: false };

    toggleUserMenu = () => {
        this.setState({ showUserMenu: !this.state.showUserMenu });
    };

    render() {
        const {
            category,
            order,
            pathname,
            current_account_name,
            username,
            showLogin,
            logout,
            loggedIn,
            vertical,
            nightmodeEnabled,
            toggleNightmode,
            userPath,
            showSidePanel,
            navigate,
            account_meta,
        } = this.props;

        const { showUserMenu } = this.state;
        return (
            ['/login', '/logout', '/register'].indexOf(
                // this.props.location.pathname
                'window.location.href'
            ) === -1 && (
                <div className="Navigation">
                    <div className="LogoContainer">
                        <a href="/">
                            <img
                                className="Logo"
                                src={logo}
                                alt="Knowledgr Logo"
                            />
                        </a>
                    </div>
                    <div className="Content">
                        <div className="Menu">
                            <a
                                className="Item"
                                href="/static_home?type=questions"
                            >
                                Q<span className="desktop">uestions</span>
                            </a>
                            <a
                                className="Item"
                                href="/static_home?type=hypotheses"
                            >
                                H<span className="desktop">ypotheses</span>
                            </a>
                            <a
                                className="Item"
                                href="/static_home?type=observations"
                            >
                                Ob
                                <span className="desktop">servations</span>
                            </a>
                            <a className="Item" href="/static_create">
                                <span className="desktop">Submit </span>
                                New
                            </a>
                        </div>
                        <div className="SearchContainer">
                            <input type="text" onKeyPress={() => {}} />
                        </div>
                        {!loggedIn ? (
                            <div className="Menu Header__user-signup show-for-medium">
                                <a
                                    className="Header__login-link"
                                    href="/login.html"
                                >
                                    {tt('g.login')}
                                </a>
                                <a
                                    className="Header__signup-link"
                                    href={SIGNUP_URL}
                                >
                                    {tt('g.sign_up')}
                                </a>
                            </div>
                        ) : (
                            <div
                                className="UserMenu"
                                onClick={() => {
                                    this.setState({
                                        showUserMenu: !this.state.showUserMenu,
                                    });
                                }}
                            >
                                <div>
                                    <User />
                                    <ChevronDown />
                                </div>
                                {/* <Transition
                                items={showUserMenu}
                                from={{ height: 0, overflow: 'hidden' }}
                                enter={{ height: 'auto' }}
                                leave={{ height: 0, overflow: 'hidden' }}
                            > */}
                                {showUserMenu && (
                                    // (props => (
                                    <div
                                        className="DropdownList" /*style={props}*/
                                    >
                                        <a
                                            className="UserInfo"
                                            href={`/@${username}`}
                                        >
                                            <span className="Avatar">
                                                <img
                                                    src="https://via.placeholder.com/1x1"
                                                    alt="User"
                                                />
                                            </span>
                                            <span className="Username">
                                                {username}
                                            </span>
                                        </a>
                                        <div className="List">
                                            <a
                                                className="Item"
                                                // href={`/@${username}/settings`}
                                                href={`/static_settings`}
                                            >
                                                <Settings /> {tt('g.settings')}
                                            </a>
                                            <a
                                                className="Item"
                                                onClick={logout}
                                            >
                                                <LogOut /> {tt('g.logout')}
                                            </a>
                                        </div>
                                    </div>
                                )
                                // ))
                                }
                                {/* </Transition> */}
                            </div>
                        )}
                    </div>
                </div>
            )
        );
    }
}

NavBar.defaultProps = {};

NavBar.propTypes = {
    // location: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => {
    // SSR code split.
    if (!process.env.BROWSER) {
        return {
            username: null,
            loggedIn: false,
        };
    }

    const userPath = state.routing.locationBeforeTransitions.pathname;
    const username = state.user.getIn(['current', 'username']);
    const loggedIn = !!username;
    const account_user = state.global.get('accounts');
    const current_account_name = username
        ? username
        : state.offchain.get('account');

    return {
        username,
        loggedIn,
        userPath,
        nightmodeEnabled: state.user.getIn(['user_preferences', 'nightmode']),
        account_meta: account_user,
        current_account_name,
        showAnnouncement: state.user.get('showAnnouncement'),
        ...ownProps,
    };
};

const mapDispatchToProps = dispatch => ({
    showLogin: e => {
        if (e) e.preventDefault();
        dispatch(userActions.showLogin());
    },
    logout: e => {
        if (e) e.preventDefault();
        dispatch(userActions.logout());
    },
    toggleNightmode: e => {
        if (e) e.preventDefault();
        dispatch(appActions.toggleNightmode());
    },
    showSidePanel: () => {
        dispatch(userActions.showSidePanel());
    },
    hideSidePanel: () => {
        dispatch(userActions.hideSidePanel());
    },
    hideAnnouncement: () => dispatch(userActions.hideAnnouncement()),
});

export default connect(mapStateToProps, mapDispatchToProps)(NavBar);
