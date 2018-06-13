/* eslint react/prop-types: 0 */
/*global $STM_csrf, $STM_Config */
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { api } from '@steemit/steem-js';

import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import { PrivateKey } from '@steemit/steem-js/lib/auth/ecc';
import * as userActions from 'app/redux/UserReducer';
import { validate_account_name } from 'app/utils/ChainValidation';
import runTests from 'app/utils/BrowserTests';
import GeneratedPasswordInput from 'app/components/elements/GeneratedPasswordInput';
import { saveCords } from 'app/utils/ServerApiClient';
import { SIGNUP_URL } from 'shared/constants';

class CreateAccount extends React.Component {
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
            showPass: false,
            account_has_keys_warning: false, // remove this after May 20th
            // user_name_picked: this.props.offchainUser.getIn(["name"])
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.onNameChange = this.onNameChange.bind(this);
        this.onPasswordChange = this.onPasswordChange.bind(this);
        this.preventDoubleClick = this.preventDoubleClick.bind(this);
    }

    componentDidMount() {
        const newState = { showPass: true };
        const cryptoTestResult = runTests();
        if (cryptoTestResult !== undefined) {
            console.error(
                'CreateAccount - cryptoTestResult: ',
                cryptoTestResult
            );
            newState.cryptographyFailure = true;
        } else {
            newState.showPass = true;
        }
        // let's find out if there is pre-approved not created account name
        const offchainAccount = this.props.offchainUser
            ? this.props.offchainUser.get('account')
            : null;
        if (offchainAccount) {
            newState.name = offchainAccount;
            this.validateAccountName(offchainAccount);
            // remove below after May 20th
            if (this.props.offchainUser.get('account_has_keys')) {
                newState.account_has_keys_warning = true;
            }
        }
        this.props.showTerms();
        this.setState(newState);
    }

    mousePosition(e) {
        // log x/y cords
        console.log('--> mouse position --', e.type, e.screenX, e.screenY);
        if (e.type === 'click') {
            saveCords(e.screenX, e.screenY);
        }
    }

    onSubmit(e) {
        e.preventDefault();
        this.setState({ server_error: '', loading: true });
        const { password, password_valid } = this.state;
        const name = this.state.name;
        if (!password || !password_valid) return;

        let public_keys;
        try {
            const pk = PrivateKey.fromWif(password);
            public_keys = [1, 2, 3, 4].map(() => pk.toPublicKey().toString());
        } catch (error) {
            public_keys = ['owner', 'active', 'posting', 'memo'].map(role => {
                const pk = PrivateKey.fromSeed(`${name}${role}${password}`);
                return pk.toPublicKey().toString();
            });
        }

        // createAccount
        fetch('/api/v1/accounts', {
            method: 'post',
            mode: 'no-cors',
            credentials: 'same-origin',
            headers: {
                Accept: 'application/json',
                'Content-type': 'application/json',
            },
            body: JSON.stringify({
                csrf: $STM_csrf,
                name,
                owner_key: public_keys[0],
                active_key: public_keys[1],
                posting_key: public_keys[2],
                memo_key: public_keys[3],
            }),
        })
            .then(r => r.json())
            .then(res => {
                if (res.error || res.status !== 'ok') {
                    console.error('CreateAccount server error', res.error);
                    this.setState({
                        server_error: res.error || 'Unknown server error',
                        loading: false,
                    });
                } else {
                    window.location = `/login.html#account=${
                        name
                    }&msg=accountcreated`;
                }
            })
            .catch(error => {
                console.error('Caught CreateAccount server error', error);
                this.setState({
                    server_error: error.message ? error.message : error,
                    loading: false,
                });
            });
    }

    onPasswordChange(password, password_valid) {
        this.setState({ password, password_valid });
    }

    preventDoubleClick() {
        // return false;
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
                .then(error => this.setState({ name_error: error }))
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
            // don't render this page on the server - it will not work until rendered in browser
            return (
                <div className="CreateAccount row ">
                    <div className="column">
                        <p className="text-center">LOADING..</p>
                    </div>
                </div>
            );
        }

        const {
            name,
            password_valid, //showPasswordString,
            name_error,
            server_error,
            loading,
            cryptographyFailure,
            showRules,
        } = this.state;

        const { loggedIn, logout, serverBusy } = this.props;
        const submit_btn_disabled = loading || !password_valid;
        const submit_btn_class =
            'button action' + (submit_btn_disabled ? ' disabled' : '');

        const account_status = this.props.offchainUser
            ? this.props.offchainUser.get('account_status')
            : null;

        if (serverBusy || $STM_Config.disable_signups) {
            return (
                <div className="row">
                    <div className="column">
                        <br />
                        <div className="callout alert">
                            <p>
                                Membership to Steemit.com is now under
                                invitation only because of unexpectedly high
                                sign up rate.
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
                        <br />
                        <div className="callout alert">
                            <h4>Cryptography test failed</h4>
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
                                are well tested and known to work with
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
                        <br />
                        <div className="callout alert">
                            <p>
                                You need to{' '}
                                <a href="#" onClick={logout}>
                                    Logout
                                </a>{' '}
                                before you can create another account.
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

        if (account_status !== 'approved') {
            return (
                <div className="row">
                    <div className="column">
                        <br />
                        <div className="callout alert">
                            <p>
                                It looks like your sign up request is not
                                approved yet or you already created an account.<br
                                />
                                Please try again later or contact{' '}
                                <a href="mailto:support@steemit.com">
                                    support@steemit.com
                                </a>{' '}
                                for the status of your request.<br />
                                If you didn't submit your sign up application
                                yet, <a href={SIGNUP_URL}>apply now</a>!
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

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
                            Couldn't create account. Server returned the
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
                    <div className="column">
                        <h4>
                            Please read the Steemit Rules and fill in the form
                            below to create your Steemit account
                        </h4>
                        {showRules ? (
                            <div className="CreateAccount__rules">
                                <p>
                                    The first rule of Steemit is: Do not lose
                                    your password.<br />
                                    The second rule of Steemit is: Do{' '}
                                    <strong>not</strong> lose your password.<br
                                    />
                                    The third rule of Steemit is: We cannot
                                    recover your password, or your account if
                                    you lose your password.<br />
                                    The forth rule: Do not tell anyone your
                                    password.<br />
                                    The fifth rule: Always back up your
                                    password.
                                    <br />
                                    <br />
                                    Seriously, we are, for technical reasons,
                                    entirely unable to gain access to an account
                                    without knowing the password. Steemit is a
                                    new model, entirely unlike other sites on
                                    the Internet. It's not simply policy:{' '}
                                    <strong>
                                        We cannot recover your account or
                                        password if you lose it.
                                    </strong>
                                    <br />
                                    Print out your password or write it down in
                                    a safe place.
                                </p>

                                <div className="text-center">
                                    <a
                                        className="CreateAccount__rules-button"
                                        href="#"
                                        onClick={() =>
                                            this.setState({ showRules: false })
                                        }
                                    >
                                        <span
                                            style={{
                                                display: 'inline-block',
                                                transform: 'rotate(-90deg)',
                                            }}
                                        >
                                            &raquo;
                                        </span>
                                    </a>
                                </div>
                                <hr />
                            </div>
                        ) : (
                            <div className="text-center">
                                <a
                                    className="CreateAccount__rules-button"
                                    href="#"
                                    onClick={() =>
                                        this.setState({ showRules: true })
                                    }
                                >
                                    Steemit Rules &nbsp; &raquo;
                                </a>
                            </div>
                        )}
                        <br />
                        <form
                            onSubmit={this.onSubmit}
                            autoComplete="off"
                            noValidate
                            method="post"
                        >
                            <div className={name_error ? 'error' : ''}>
                                <label>
                                    ACCOUNT NAME
                                    <input
                                        type="text"
                                        name="name"
                                        autoComplete="off"
                                        onChange={this.onNameChange}
                                        value={name}
                                    />
                                </label>
                                <p>{name_error}</p>
                            </div>
                            {// TODO: remove this after May 20th
                            this.state.account_has_keys_warning && (
                                <div className="warning">
                                    Please note: due to recent security changes
                                    if you chosen a password before during
                                    signup, this one below will override it —
                                    this is the one you need to save.
                                </div>
                            )}
                            <GeneratedPasswordInput
                                onChange={this.onPasswordChange}
                                disabled={loading}
                                showPasswordString={this.state.showPass}
                            />
                            <br />
                            {next_step && (
                                <div>
                                    {next_step}
                                    <br />
                                </div>
                            )}
                            <noscript>
                                <div className="callout alert">
                                    <p>
                                        This form requires javascript to be
                                        enabled in your browser
                                    </p>
                                </div>
                            </noscript>
                            {loading && <LoadingIndicator type="circle" />}
                            <input
                                disabled={submit_btn_disabled}
                                type="submit"
                                className={submit_btn_class}
                                onClick={this.mousePosition}
                                value="Create Account"
                            />
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = {
    path: 'create_account',
    component: connect(
        state => {
            return {
                loggedIn: !!state.user.get('current'),
                offchainUser: state.offchain.get('user'),
                serverBusy: state.offchain.get('serverBusy'),
                suggestedPassword: state.global.get('suggestedPassword'),
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
            showTerms: e => {
                if (e) e.preventDefault();
                dispatch(userActions.showTerms());
            },
        })
    )(CreateAccount),
};
