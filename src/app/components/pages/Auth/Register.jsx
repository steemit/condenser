import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withCookies } from 'react-cookie';
import { Link } from 'react-router-dom';

import { Input } from 'components/_Common';

import logo from 'assets/images/logo.png';
import knowledr from 'assets/images/knowledr.png';

class Register extends Component {
    constructor(props) {
        super(props);

        this.state = {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            rememberMe: false,
        };
    }

    componentDidMount() {
        const { cookies } = this.props;
        if (cookies.get('token')) {
            this.props.history.push('/');
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

    render() {
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            rememberMe,
        } = this.state;

        return (
            <div className="AuthWrapper">
                <div className="Left">
                    <Link to="/">
                        <img className="Logo" src={logo} alt="Knowledr Logo" />
                    </Link>
                    <div className="AuthForm">
                        <div className="Title">
                            We are <span>Knowledr</span>
                        </div>
                        <div className="Description">
                            Welcome, let us introduce!
                        </div>
                        <form>
                            <Input
                                label="First Name"
                                placeholder="John"
                                value={firstName}
                                onChange={this.onInputChange('firstName')}
                            />
                            <Input
                                label="Last Name"
                                placeholder="Smith"
                                value={lastName}
                                onChange={this.onInputChange('lastName')}
                            />
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
                            <Input
                                label="Cpmfirm Password"
                                placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
                                type="password"
                                value={confirmPassword}
                                onChange={this.onInputChange('confirmPassword')}
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
                            <button className="Black" type="submit">
                                Sign Up
                            </button>
                            <Link className="Button" to="/login">
                                Log In
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

Register.defaultProps = {
    refCode: null,
};

Register.propTypes = {
    cookies: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    // refCode: PropTypes.string,
};

export default withCookies(Register);
