import React, { Component } from 'react';
// import PropTypes from 'prop-types';
// import { withRouter } from 'react-router';
import { User, ChevronDown, Settings, LogOut } from 'react-feather';
// import { Transition } from 'react-spring';

import logo from 'assets/images/static/logo_white.png';

class NavBar extends Component {
    state = { showUserMenu: true };

    toggleUserMenu = () => {
        this.setState({ showUserMenu: !this.state.showUserMenu });
    };

    render() {
        const { showUserMenu } = this.state;
        return (
            ['/login', '/logout', '/register'].indexOf(
                // this.props.location.pathname
                window.location.href
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
                            <a className="Item" href="/posts?type=questions">
                                Q<span className="desktop">uestions</span>
                            </a>
                            <a className="Item" href="/posts?type=hypotheses">
                                H<span className="desktop">ypotheses</span>
                            </a>
                            <a className="Item" href="/posts?type=observations">
                                Ob
                                <span className="desktop">servations</span>
                            </a>
                            <a className="Item" href="/create">
                                <span className="desktop">Submit </span>
                                New
                            </a>
                        </div>
                        <div className="SearchContainer">
                            <input type="text" onKeyPress={() => {}} />
                        </div>
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
                                <div className="DropdownList" /*style={props}*/>
                                    <a className="UserInfo" href="/user/joe">
                                        <span className="Avatar">
                                            <img
                                                src="https://via.placeholder.com/1x1"
                                                alt="User"
                                            />
                                        </span>
                                        <span className="Username">
                                            Joe Sample
                                        </span>
                                    </a>
                                    <div className="List">
                                        <a className="Item" href="/settings">
                                            <Settings /> Settings
                                        </a>
                                        <a className="Item" href="/logout">
                                            <LogOut /> Log Out
                                        </a>
                                    </div>
                                </div>
                            )
                            // ))
                            }
                            {/* </Transition> */}
                        </div>
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

// export default withRouter(NavBar);
export default NavBar;
