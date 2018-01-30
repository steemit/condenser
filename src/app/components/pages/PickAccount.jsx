/* eslint react/prop-types: 0 */
/*global $STM_csrf, $STM_Config */
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import classNames from 'classnames';
import { api } from '@steemit/steem-js';

import * as userActions from 'app/redux/UserReducer';
import { validate_account_name } from 'app/utils/ChainValidation';
import runTests from 'app/utils/BrowserTests';
import { PARAM_VIEW_MODE } from 'shared/constants';
import { makeParams } from 'app/utils/Links';

class PickAccount extends React.Component {
    static propTypes = {
        loginUser: React.PropTypes.func.isRequired,
        serverBusy: React.PropTypes.bool,
    };

    constructor(props) {
        super(props);
        this.state = {
            name: '',
            password: '',
            password_valid: '',
            name_error: '',
            server_error: '',
            loading: false,
            cryptographyFailure: false,
            showRules: false,
            subheader_hidden: true,
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.onNameChange = this.onNameChange.bind(this);
        this.onPasswordChange = this.onPasswordChange.bind(this);
    }

    componentDidMount() {
        const cryptoTestResult = runTests();
        if (cryptoTestResult !== undefined) {
            console.error(
                'CreateAccount - cryptoTestResult: ',
                cryptoTestResult
            );
            this.setState({ cryptographyFailure: true }); // TODO: do not use setState in componentDidMount
        }
    }

    onSubmit(e) {
        e.preventDefault();
        this.setState({ server_error: '', loading: true });
        const { name } = this.state;
        if (!name) return;
        const params = { account: name };
        if (this.props.viewMode) {
            params[PARAM_VIEW_MODE] = this.props.viewMode;
        }
        window.location = '/enter_email' + makeParams(params);
    }

    onPasswordChange(password, password_valid) {
        this.setState({ password, password_valid });
    }

    onNameChange(e) {
        const name = e.target.value.trim().toLowerCase();
        this.validateAccountName(name);
        this.setState({ name });
    }

    validateAccountName(name) {
        let name_error = '';
        let promise;
        if (name.length > 0) {
            name_error = validate_account_name(name);
            if (!name_error) {
                this.setState({ name_error: '' });
                promise = api.getAccountsAsync([name]).then(res => {
                    return res && res.length > 0
                        ? 'Account name is not available'
                        : '';
                });
            }
        }
        if (promise) {
            promise
                .then(name_error => this.setState({ name_error }))
                .catch(() =>
                    this.setState({
                        name_error:
                            "Account name can't be verified right now due to server failure. Please try again later.",
                    })
                );
        } else {
            this.setState({ name_error });
        }
    }

    render() {
        if (!process.env.BROWSER) {
            // don't render this page on the server
            return (
                <div className="row">
                    <div className="column">
                        <p className="text-center">LOADING..</p>
                    </div>
                </div>
            );
        }

        const {
            name,
            name_error,
            server_error,
            loading,
            cryptographyFailure,
        } = this.state;

        const { loggedIn, logout, offchainUser, serverBusy } = this.props;
        const submit_btn_disabled = loading || !name || name_error;
        const submit_btn_class = classNames('button action', {
            disabled: submit_btn_disabled,
        });
        const account_status = offchainUser
            ? offchainUser.get('account_status')
            : null;

        if (serverBusy || $STM_Config.disable_signups) {
            return (
                <div className="row">
                    <div className="column">
                        <div className="callout alert">
                            <p>
                                The creation of new accounts is temporarily
                                disabled.
                            </p>
                        </div>
                    </div>
                </div>
            );
        }
        if (cryptographyFailure) {
            return (
                <div className="row">
                    <div className="column">
                        <div className="callout alert">
                            <h4>Browser Out of Date</h4>
                            <p>
                                We will be unable to create your Steem account
                                with this browser.
                            </p>
                            <p>
                                The latest versions of{' '}
                                <a href="https://www.google.com/chrome/">
                                    Chrome
                                </a>{' '}
                                and{' '}
                                <a href="https://www.mozilla.org/en-US/firefox/new/">
                                    Firefox
                                </a>
                                are well-tested and known to work well with
                                steemit.com.
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        if (loggedIn) {
            return (
                <div className="row">
                    <div className="column">
                        <div className="callout alert">
                            <p>
                                You need to{' '}
                                <a href="#" onClick={logout}>
                                    Logout
                                </a>{' '}
                                before you can create an additional account.
                            </p>
                            <p>
                                Please note that Steemit can only register one
                                account per verified user.
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        if (account_status === 'waiting') {
            return (
                <div className="row">
                    <div className="column">
                        <br />
                        <div className="callout alert">
                            <p>
                                Your sign up request is being processed and you
                                will receive an email from us when it is ready.
                            </p>
                            <p>
                                Signup requests can take up to 7 days to be
                                processed, but usually complete in a day or two.
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        if (account_status === 'approved') {
            return (
                <div className="row">
                    <div className="column">
                        <br />
                        <div className="callout success">
                            <p>
                                Congratulations! Your sign up request has been
                                approved.
                            </p>
                            <p>
                                <Link to="/create_account">
                                    Let's get your account created!
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        // const existingUserAccount = offchainUser.get('account');
        // if (existingUserAccount) {
        //     return <div className="row">
        //         <div className="column">
        //             <div className="callout alert">
        //                 <p>Our records indicate that you already have steem account: <strong>{existingUserAccount}</strong></p>
        //                 <p>In order to prevent abuse Steemit can only register one account per verified user.</p>
        //                 <p>You can either <a href="/login.html">login</a> to your existing account
        //                     or <a href="mailto:support@steemit.com">send us email</a> if you need a new account.</p>
        //             </div>
        //         </div>
        //     </div>;
        // }

        let next_step = null;
        if (server_error) {
            if (server_error === 'Email address is not confirmed') {
                next_step = (
                    <div className="callout alert">
                        <a href="/enter_email">
                            Please verify your email address
                        </a>
                    </div>
                );
            } else if (server_error === 'Phone number is not confirmed') {
                next_step = (
                    <div className="callout alert">
                        <a href="/enter_mobile">
                            Please verify your phone number
                        </a>
                    </div>
                );
            } else {
                next_step = (
                    <div className="callout alert">
                        <h5>
                            Couldn't create account. The server returned the
                            following error:
                        </h5>
                        <p>{server_error}</p>
                    </div>
                );
            }
        }

        return (
            <div>
                <div className="CreateAccount row">
                    <div
                        className="column"
                        style={{ maxWidth: '36rem', margin: '0 auto' }}
                    >
                        <br />
                        <div className="progress">
                            <div style={{ width: '10%' }} />
                        </div>

                        <br />
                        <h4 className="CreateAccount__title">
                            Welcome to Steemit
                        </h4>
                        <div>
                            <p>
                                Your account name is how you will be known on
                                steemit.com.<br />
                                {/*Your account name <strong>can never be changed</strong>, so please choose carefully.*/}
                            </p>
                        </div>
                        <form
                            onSubmit={this.onSubmit}
                            autoComplete="off"
                            noValidate
                            method="post"
                        >
                            <div className={name_error ? 'error' : ''}>
                                <label>ACCOUNT NAME</label>
                                <input
                                    type="text"
                                    name="name"
                                    autoComplete="off"
                                    onChange={this.onNameChange}
                                    value={name}
                                    placeholder={'Name...'}
                                />
                                <p>{name_error}</p>
                            </div>
                            <input
                                disabled={submit_btn_disabled}
                                type="submit"
                                className={submit_btn_class}
                                value="Continue"
                            />
                        </form>
                        <br />
                        <p className="secondary whistle-hidden">
                            Got an account? <Link to="/login.html">Login</Link>
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = {
    path: 'pick_account',
    component: connect(
        state => {
            return {
                viewMode: state.app.get('viewMode'),
                loggedIn: !!state.user.get('current'),
                offchainUser: state.offchain.get('user'),
                serverBusy: state.offchain.get('serverBusy'),
            };
        },
        dispatch => ({
            loginUser: (username, password) =>
                dispatch(
                    userActions.usernamePasswordLogin({
                        username,
                        password,
                        saveLogin: true,
                    })
                ),
            logout: e => {
                if (e) e.preventDefault();
                dispatch(userActions.logout());
            },
        })
    )(PickAccount),
};
