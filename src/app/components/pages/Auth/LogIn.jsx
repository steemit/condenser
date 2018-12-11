import React, { Component } from 'react';
// import PropTypes from 'prop-types';

import Input from 'app/components/pages/_Common/Input';

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

    render() {
        const { email, password, rememberMe } = this.state;

        return (
            <div className="AuthWrapper">
                <div className="Left">
                    <a href="/">
                        <img className="Logo" src={logo} alt="Knowledr Logo" />
                    </a>
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
                            <a className="Button" href="/static_register">
                                Sign Up
                            </a>
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
    // refCode: PropTypes.string,
};

module.exports = {
    path: 'static_login',
    component: LogIn,
};
