import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withCookies } from 'react-cookie';
import { withRouter, Link } from 'react-router';

import { Input } from 'app/components/pages/_Common';

import logo from 'assets/images/static/logo.png';
import knowledr from 'assets/images/static/knowledr.png';

class LogIn extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            password: '',
            rememberMe: false,
        };
    }

    componentDidMount() {
        const { cookies, match } = this.props;

        if (cookies.get('token')) {
            if (match.path === '/logout') {
                cookies.remove('token');
            } else {
                // this.props.history.push('/');
            }
        }
    }

    onInputChange(field) {
        return e => {
            this.setState({
                [field]:
                    e.target.type === 'checkbox'
                        ? e.target.checked
                        : e.target.value,
            });
        };
    }

    onSubmit() {
        const { cookies } = this.props;
        cookies.set('token', Math.random() * 98765);
        this.props.history.push('/');
    }

    render() {
        const { email, password, rememberMe } = this.state;

        return (
            <div className="AuthWrapper">
                <div className="Left">
                    <Link to="/">
                        <img className="Logo" src={logo} alt="Knowledr Logo" />
                    </Link>
                    <div className="AuthForm">
                        <div className="Title">
                            We are <span>Knowledgr</span>
                        </div>
                        <div className="Description">
                            Welcome back, please login to
                            <br />
                            your account
                        </div>
                        <form>
                            <Input
                                label="Email Address"
                                placeholder="john.smith@mail.com"
                                value={email}
                                onChange={this.onInputChange('email')}
                            />
                            <Input
                                label="Password"
                                placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
                                type="password"
                                value={password}
                                onChange={this.onInputChange('password')}
                            />
                        </form>
                        <div className="Extra">
                            <div className="RememberMe">
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    id="rememberMe"
                                    className="css-checkbox"
                                    checked={rememberMe}
                                    onChange={this.onInputChange('rememberMe')}
                                />
                                <label
                                    htmlFor="rememberMe"
                                    className="css-label"
                                >
                                    Remember Me
                                </label>
                            </div>
                            <div className="ForgetPassword">
                                Forget Password?
                            </div>
                        </div>
                        <div className="Buttons">
                            <button
                                className="Black"
                                onClick={this.onSubmit}
                                type="button"
                            >
                                Log In
                            </button>
                            <Link className="Button" to="/register">
                                Sign Up
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="Right">
                    <img
                        className="Knowledr"
                        src={knowledr}
                        alt="Knowledr Logo"
                    />
                </div>
            </div>
        );
    }
}

LogIn.defaultProps = {
    refCode: null,
};

LogIn.propTypes = {
    cookies: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    // refCode: PropTypes.string,
};

export default withRouter(withCookies(LogIn));
