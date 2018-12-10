import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router';
import { User, ChevronDown, Settings, LogOut } from 'react-feather';
import { Transition } from 'react-spring';

import logo from 'assets/images/static/logo_white.png';

class NavBar extends Component {
    state = { showUserMenu: false };

    toggleUserMenu = () => {
        this.setState({ showUserMenu: !this.state.showUserMenu });
    };

    render() {
        const { showUserMenu } = this.state;
        return (
            ['/login', '/logout', '/register'].indexOf(
                this.props.location.pathname
            ) === -1 && (
                <div className="Navigation">
                    <div className="LogoContainer">
                        <Link to="/">
                            <img
                                className="Logo"
                                src={logo}
                                alt="Knowledgr Logo"
                            />
                        </Link>
                    </div>
                    <div className="Content">
                        <div className="Menu">
                            <Link className="Item" to="/posts?type=questions">
                                Q<span className="desktop">uestions</span>
                            </Link>
                            <Link className="Item" to="/posts?type=hypotheses">
                                H<span className="desktop">ypotheses</span>
                            </Link>
                            <Link
                                className="Item"
                                to="/posts?type=observations"
                            >
                                Ob
                                <span className="desktop">servations</span>
                            </Link>
                            <Link className="Item" to="/create">
                                <span className="desktop">Submit </span>
                                New
                            </Link>
                        </div>
                        <div className="SearchContainer">
                            <input type="text" onKeyPress={() => {}} />
                        </div>
                        <div className="UserMenu" onClick={this.toggleUserMenu}>
                            <div>
                                <User />
                                <ChevronDown />
                            </div>
                            <Transition
                                items={showUserMenu}
                                from={{ height: 0, overflow: 'hidden' }}
                                enter={{ height: 'auto' }}
                                leave={{ height: 0, overflow: 'hidden' }}
                            >
                                {showUserMenu &&
                                    (props => (
                                        <div
                                            className="DropdownList"
                                            style={props}
                                        >
                                            <Link
                                                className="UserInfo"
                                                to="/user/joe"
                                            >
                                                <span className="Avatar">
                                                    <img
                                                        src="https://via.placeholder.com/1x1"
                                                        alt="User"
                                                    />
                                                </span>
                                                <span className="Username">
                                                    Joe Sample
                                                </span>
                                            </Link>
                                            <div className="List">
                                                <Link
                                                    className="Item"
                                                    to="/settings"
                                                >
                                                    <Settings /> Settings
                                                </Link>
                                                <Link
                                                    className="Item"
                                                    to="/logout"
                                                >
                                                    <LogOut /> Log Out
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                            </Transition>
                        </div>
                    </div>
                </div>
            )
        );
    }
}

NavBar.defaultProps = {};

NavBar.propTypes = {
    location: PropTypes.object.isRequired,
};

export default withRouter(NavBar);
