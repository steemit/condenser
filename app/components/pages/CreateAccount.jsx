/* eslint react/prop-types: 0 */
import React from 'react';
import { connect } from 'react-redux';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import Apis from 'shared/api_client/ApiInstances';
import { PrivateKey } from 'shared/ecc';
import user from 'app/redux/User';
import {validate_account_name} from 'app/utils/ChainValidation';
import SignUp from 'app/components/modules/SignUp';
import runTests from 'shared/ecc/test/BrowserTests';
import GeneratedPasswordInput from 'app/components/elements/GeneratedPasswordInput';
import SignupProgressBar from 'app/components/elements/SignupProgressBar';

class CreateAccount extends React.Component {

    static propTypes = {
        loginUser: React.PropTypes.func.isRequired,
        showSignUp: React.PropTypes.func.isRequired,
        serverBusy: React.PropTypes.bool
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
            showRules: false
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.onNameChange = this.onNameChange.bind(this);
        this.onPasswordChange = this.onPasswordChange.bind(this);
    }

    componentDidMount() {
        const cryptoTestResult = runTests();
        if (cryptoTestResult !== undefined) {
            console.error('CreateAccount - cryptoTestResult: ', cryptoTestResult);
            this.setState({cryptographyFailure: true}); // TODO: do not use setState in componentDidMount
        }
    }

    onSubmit(e) {
        e.preventDefault();
        this.setState({server_error: '', loading: true});
        const {name, password, password_valid} = this.state;
        if (!name || !password || !password_valid) return;

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
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                csrf: $STM_csrf,
                name,
                owner_key: public_keys[0],
                active_key: public_keys[1],
                posting_key: public_keys[2],
                memo_key: public_keys[3]
            })
        }).then(r => r.json()).then(res => {
            if (res.error || res.status !== 'ok') {
                console.error('CreateAccount server error', res.error);
                if (res.error === 'Unauthorized') {
                    this.props.showSignUp();
                }
                this.setState({server_error: res.error || 'Unknown', loading: false});
            } else {
                window.location = `/login.html#account=${name}&msg=accountcreated`;
                // this.props.loginUser(name, password);
                // const redirect_page = localStorage.getItem('redirect');
                // if (redirect_page) {
                //     localStorage.removeItem('redirect');
                //     browserHistory.push(redirect_page);
                // }
                // else {
                //     browserHistory.push('/@' + name);
                // }
            }
        }).catch(error => {
            console.error('Caught CreateAccount server error', error);
            this.setState({server_error: (error.message ? error.message : error), loading: false});
        });
    }

    onPasswordChange(password, password_valid) {
        this.setState({password, password_valid});
    }

    onNameChange(e) {
        const name = e.target.value.trim().toLowerCase();
        this.validateAccountName(name);
        this.setState({name});
    }

    validateAccountName(name) {
        let name_error = '';
        let promise;
        if (name.length > 0) {
            name_error = validate_account_name(name);
            if (!name_error) {
                promise = Apis.db_api('get_accounts', [name]).then(res => {
                    return res && res.length > 0 ? 'Account name is not available' : '';
                });
            }
        }
        if (promise) {
            promise.then(error => this.setState({name_error: error}));
        } else {
            this.setState({name_error});
        }
    }

    render() {
        if (!process.env.BROWSER) { // don't render this page on the server
            return <div className="row">
                <div className="column">
                    Loading..
                </div>
            </div>;
        }

        const {
            name, password_valid, //showPasswordString,
            name_error, server_error, loading, cryptographyFailure, showRules
        } = this.state;

        const {loggedIn, logout, offchainUser, serverBusy} = this.props;
        const submit_btn_disabled =
            loading ||
            !name ||
            !password_valid ||
            name_error;
        const submit_btn_class = 'button action' + (submit_btn_disabled ? ' disabled' : '');

        if (serverBusy || $STM_Config.disable_signups) {
            return <div className="row">
                <div className="column">
                    <div className="callout alert">
                        <p>Membership to Steemit.com is now under invitation only because of unexpectedly high sign up rate.</p>
                    </div>
                </div>
            </div>;
        }
        if (cryptographyFailure) {
            return <div className="row">
                <div className="column">
                    <div className="callout alert">
                        <h4>Cryptography test failed</h4>
                        <p>We will be unable to create your Steem account with this browser.</p>
                        <p>The latest versions of <a href="https://www.google.com/chrome/">Chrome</a> and <a href="https://www.mozilla.org/en-US/firefox/new/">Firefox</a> are well tested and known to work with steemit.com.</p>
                    </div>
                </div>
            </div>;
        }
        if (!offchainUser) {
            return <SignUp />;
        }

        if (loggedIn) {
            return <div className="row">
                <div className="column">
                    <div className="callout alert">
                        <p>You need to <a href="#" onClick={logout}>Logout</a> before you can create another account.</p>
                        <p>Please note that Steemit can only register one account per verified user.</p>
                    </div>
                </div>
            </div>;
        }

        const existingUserAccount = offchainUser.get('account');
        if (existingUserAccount) {
            return <div className="row">
                <div className="column">
                    <div className="callout alert">
                        <p>Our records indicate that you already have steem account: <strong>{existingUserAccount}</strong></p>
                        <p>In order to prevent abuse (each registered account costs 3 STEEM) Steemit can only register one account per verified user.</p>
                        <p>You can either <a href="/login.html">login</a> to your existing account
                           or <a href="mailto:support@steemit.com">send us email</a> if you need a new account.</p>
                    </div>
                </div>
            </div>;
        }

        const next_step = !server_error ? null :
            server_error === 'Mobile is not confirmed' ? <div>
                <a href="/enter_mobile">Verify a Mobile</a>
            </div> : <div className="callout alert">
                <h5>Couldn't create account. Server returned the following error:</h5>
                <p>{server_error}</p>
                {server_error === 'Email address is not confirmed' && <a href="/enter_email">Confirm Email</a>}
            </div>

        return (
            <div>
                <SignupProgressBar steps={[offchainUser.get('prv') || 'identity', 'email', 'phone', 'steem account']} current={4} />
                <div className="CreateAccount row">
                    <div className="column" style={{maxWidth: '36rem', margin: '0 auto'}}>
                        <br />
                        {showRules ? <div className="CreateAccount__rules">
                            <p>
                                The first rule of Steemit is: Do not lose your password.<br />
                                The second rule of Steemit is: Do <strong>not</strong> lose your password.<br />
                                The third rule of Steemit is: We cannot recover your password.<br />
                                The fourth rule: If you can remember the password, it&apos;s not secure.<br />
                                The fifth rule: Use only randomly-generated passwords.<br />
                                The sixth rule: Do not tell anyone your password.<br />
                                The seventh rule: Always back up your password.
                            </p>
                            <div className="text-center">
                                <a className="CreateAccount__rules-button" href="#" onClick={() => this.setState({showRules: false})}>
                                    <span style={{display: 'inline-block', transform: 'rotate(-90deg)'}}>&raquo;</span>
                                </a>
                            </div>
                            <hr />
                        </div> : <div className="text-center">
                            <a className="CreateAccount__rules-button" href="#" onClick={() => this.setState({showRules: true})}>Steemit Rules &nbsp; &raquo;</a>
                        </div>}
                        <form onSubmit={this.onSubmit} autoComplete="off" noValidate method="post">
                            <div className={name_error ? 'error' : ''}>
                                <label>ACCOUNT NAME
                                    <input type="text" name="name" autoComplete="off" onChange={this.onNameChange} value={name} />
                                </label>
                                <p>{name_error}</p>
                            </div>
                            <GeneratedPasswordInput onChange={this.onPasswordChange} disabled={loading} showPasswordString={name.length > 0 && !name_error} />
                            <br />
                            {next_step && <div>{next_step}<br /></div>}
                            <noscript>
                                <div className="callout alert">
                                    <p>This form requires javascript to be enabled in your browser</p>
                                </div>
                            </noscript>
                            {loading && <LoadingIndicator type="circle" />}
                            <input disabled={submit_btn_disabled} type="submit" className={submit_btn_class} value="Create Account" />
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
            }
        },
        dispatch => ({
            loginUser: (username, password) => dispatch(user.actions.usernamePasswordLogin({username, password, saveLogin: true})),
            showSignUp: () => dispatch(user.actions.showSignUp()),
            logout: e => {
                if (e) e.preventDefault();
                dispatch(user.actions.logout())
            }
        })
    )(CreateAccount)
};
