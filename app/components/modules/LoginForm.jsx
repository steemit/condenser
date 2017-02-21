/* eslint react/prop-types: 0 */
import React, { PropTypes, Component } from 'react';
import {PublicKey, PrivateKey} from 'shared/ecc'
import transaction from 'app/redux/Transaction'
import g from 'app/redux/GlobalReducer'
import user from 'app/redux/User'
import {validate_account_name} from 'app/utils/ChainValidation';
import runTests from 'shared/ecc/test/BrowserTests';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate'
import reactForm from 'app/utils/ReactForm'
import {serverApiRecordEvent} from 'app/utils/ServerApiClient';

class LoginForm extends Component {

    static propTypes = {
        //Steemit
        login_error: PropTypes.string,
        onCancel: PropTypes.func,
    };

    static defaultProps = {
        afterLoginRedirectToWelcome: false
    }

    constructor(props) {
        super()
        const cryptoTestResult = runTests();
        let cryptographyFailure = false;
        this.SignUp = this.SignUp.bind(this);
        if (cryptoTestResult !== undefined) {
            console.error('CreateAccount - cryptoTestResult: ', cryptoTestResult);
            cryptographyFailure = true
        }
        this.state = {cryptographyFailure}
        this.usernameOnChange = e => {
            const value = e.target.value.toLowerCase()
            this.state.username.props.onChange(value)
        }
        this.onCancel = (e) => {
            if(e.preventDefault) e.preventDefault()
            const {onCancel, loginBroadcastOperation} = this.props
            const errorCallback = loginBroadcastOperation && loginBroadcastOperation.get('errorCallback')
            if (errorCallback) errorCallback('Canceled')
            if (onCancel) onCancel()
        }
        this.qrReader = () => {
            const {qrReader} = props
            const {password} = this.state
            qrReader(data => {password.props.onChange(data)})
        }
        this.initForm(props)
    }

    componentDidMount() {
        if (this.refs.username && !this.refs.username.value) this.refs.username.focus();
        if (this.refs.username && this.refs.username.value) this.refs.pw.focus();
    }

    shouldComponentUpdate = shouldComponentUpdate(this, 'LoginForm')

    initForm(props) {
        reactForm({
            name: 'login',
            instance: this,
            fields: ['username', 'password', 'saveLogin:checked'],
            initialValues: props.initialValues,
            validation: values => ({
                username: ! values.username ? 'Required' : validate_account_name(values.username.split('/')[0]),
                password: ! values.password ? 'Required' :
                    PublicKey.fromString(values.password) ? 'You need a private password or key (not a public key)' :
                    null,
            })
        })
    }

    SignUp() {
        const onType = document.getElementsByClassName("OpAction")[0].textContent;
        serverApiRecordEvent('FreeMoneySignUp', onType);
        window.location.href = "/enter_email";
    }

    SignIn() {
        const onType = document.getElementsByClassName("OpAction")[0].textContent;
        serverApiRecordEvent('SignIn', onType);
    }

    saveLoginToggle = () => {
        const {saveLogin} = this.state;
        saveLoginDefault = !saveLoginDefault;
        localStorage.setItem('saveLogin', saveLoginDefault ? 'yes' : 'no');
        saveLogin.props.onChange(saveLoginDefault); // change UI
    };

    showChangePassword = () => {
        const {username, password} = this.state;
        this.props.showChangePassword(username.value, password.value)
    };

    render() {
        if (!process.env.BROWSER) {
            return <div className="row">
                <div className="column">
                    <p>Loading..</p>
                </div>
            </div>;
        }
        if (this.state.cryptographyFailure) {
            return <div className="row">
                <div className="column">
                    <div className="callout alert">
                        <h4>Cryptography test failed</h4>
                        <p>We will be unable to log you in with this browser.</p>
                        <p>The latest versions of <a href="https://www.google.com/chrome/">Chrome</a> and <a href="https://www.mozilla.org/en-US/firefox/new/">Firefox</a> are well tested and known to work with steemit.com.</p>
                    </div>
                </div>
            </div>;
        }

        if ($STM_Config.read_only_mode) {
            return <div className="row">
                <div className="column">
                    <div className="callout alert">
                        <p>Due to server maintenance we are running in read only mode. We are sorry for the inconvenience.</p></div>
                </div>
            </div>;
        }

        const {loginBroadcastOperation, dispatchSubmit, afterLoginRedirectToWelcome, msg} = this.props;
        const {username, password, saveLogin} = this.state;
        const {submitting, valid, handleSubmit} = this.state.login;
        const {usernameOnChange, onCancel, /*qrReader*/} = this;
        const disabled = submitting || !valid;
        const opType = loginBroadcastOperation ? loginBroadcastOperation.get('type') : null;
        let postType = "";
        if (opType === "vote") {
            postType = 'Login to Vote'
        } else if (loginBroadcastOperation) {
            // check for post or comment in operation
            postType = loginBroadcastOperation.getIn(['operation', 'title']) ? 'Login to Post' : 'Login to Comment';
        }
        const title = postType ? postType : 'Login to your Steem Account';
        const authType = /^vote|comment/.test(opType) ? 'Posting' : 'Active or Owner';
        const submitLabel = loginBroadcastOperation ? 'Sign In' : 'Login';
        let error = password.touched && password.error ? password.error : this.props.login_error;
        if (error === 'owner_login_blocked') {
            error = <span>This password is bound to your account&apos;s owner key and can not be used to login to this site.
                However, you can use it to <a onClick={this.showChangePassword}>update your password</a> to obtain a more secure set of keys.</span>
        } else if (error === 'active_login_blocked') {
            error = <span>This password is bound to your account&apos;s active key and can not be used to login to this page.  You may use this
                active key on other more secure pages like the Wallet or Market pages.</span>
        }
        let message = null;
        if (msg) {
            if (msg === 'accountcreated') {
                message =<div className="callout primary">
                        <p>You account has been successfully created!</p>
                    </div>;
            }
            else if (msg === 'accountrecovered') {
                message =<div className="callout primary">
                    <p>You account has been successfully recovered!</p>
                </div>;
            }
            else if (msg === 'passwordupdated') {
                message = <div className="callout primary">
                    <p>The password for `{username.value}` was successfully updated.</p>
                </div>;
            }
        }
        const password_info = checkPasswordChecksum(password.value) === false ?
            'This password or private key was entered incorrectly.  There is probably a handwriting or data-entry error.  Hint: A password or private key generated by Steemit will never contain 0 (zero), O (capital o), I (capital i) and l (lower case L) characters.' :
            null

        const form = (
            <center>
            <form onSubmit={handleSubmit(({data}) => {
                // bind redux-form to react-redux
                console.log('Login\tdispatchSubmit');
                return dispatchSubmit(data, loginBroadcastOperation, afterLoginRedirectToWelcome)
            })}
                onChange={this.props.clearError}
                method="post"
            >
                <div className="input-group">
                    <span className="input-group-label">@</span>
                    <input className="input-group-field" type="text" required placeholder="Enter your username" ref="username"
                        {...username.props} onChange={usernameOnChange} autoComplete="on" disabled={submitting}
                    />
                </div>
                {username.touched && username.blur && username.error ? <div className="error">{username.error}&nbsp;</div> : null}

                <div>
                    <input type="password" required ref="pw" placeholder="Password or WIF" {...password.props} autoComplete="on" disabled={submitting} />
                    {error && <div className="error">{error}&nbsp;</div>}
                    {error && password_info && <div className="warning">{password_info}&nbsp;</div>}
                </div>
                {loginBroadcastOperation && <div>
                    <div className="info">This operation requires your {authType} key or Master password.</div>
                </div>}
                {!loginBroadcastOperation && <div>
                    <label htmlFor="saveLogin">
                        Keep me logged in &nbsp;
                        <input id="saveLogin" type="checkbox" ref="pw" {...saveLogin.props} onChange={this.saveLoginToggle} disabled={submitting} /></label>
                </div>}
                <div>
                    <button type="submit" disabled={submitting || disabled} className="button" onClick={this.SignIn}>
                        {submitLabel}
                    </button>
                    {this.props.onCancel && <button type="button float-right" disabled={submitting} className="button hollow" onClick={onCancel}>
                        Cancel
                    </button>}
                </div>
                <hr />
                <div>
                    <p>Join our <span className="free-slogan">amazing community</span> to comment and reward others.</p>
                    <button type="button" className="button sign-up" onClick={this.SignUp}>Sign up now to receive <span className="free-money">FREE MONEY!</span></button>
                </div>
            </form>
        </center>
        );

        return (
           <div className="LoginForm">
               {message}
               <center>
                   <h3>Returning Users: <span className="OpAction">{title}</span></h3>
               </center>
               <br />
               {form}
           </div>
       )
    }
}

let hasError
let saveLoginDefault = true
if (process.env.BROWSER) {
    const s = localStorage.getItem('saveLogin')
    if (s === 'no') saveLoginDefault = false
}

function urlAccountName() {
    let suggestedAccountName = '';
    const account_match = window.location.hash.match(/account\=([\w\d\-\.]+)/);
    if (account_match && account_match.length > 1) suggestedAccountName = account_match[1];
    return suggestedAccountName
}

function checkPasswordChecksum(password) {
    // A Steemit generated password is a WIF prefixed with a P ..
    // It is possible to login directly with a WIF
    const wif = /^P/.test(password) ? password.substring(1) : password

    if(!/^5[HJK].{45,}/i.test(wif)) {// 51 is the wif length
        // not even close
        return undefined
    }

    return PrivateKey.isWif(wif)
}

import {connect} from 'react-redux'
export default connect(

    // mapStateToProps
    (state) => {
        const login_error = state.user.get('login_error')
        const currentUser = state.user.get('current')
        const loginBroadcastOperation = state.user.get('loginBroadcastOperation')

        const initialValues = {
            saveLogin: saveLoginDefault,
        }

        // The username input has a value prop, so it should not use initialValues
        const initialUsername = currentUser && currentUser.has('username') ? currentUser.get('username') : urlAccountName()
        const loginDefault = state.user.get('loginDefault')
        if(loginDefault) {
            const {username, authType} = loginDefault.toJS()
            if(username && authType) initialValues.username = username + '/' + authType
        } else if (initialUsername) {
            initialValues.username = initialUsername;
        }
        let msg = '';
        const msg_match = window.location.hash.match(/msg\=([\w]+)/);
        if (msg_match && msg_match.length > 1) msg = msg_match[1];
        hasError = !!login_error
        return {
            login_error,
            loginBroadcastOperation,
            initialValues,
            initialUsername,
            msg,
            offchain_user: state.offchain.get('user')
        }
    },

    // mapDispatchToProps
    dispatch => ({
        dispatchSubmit: (data, loginBroadcastOperation, afterLoginRedirectToWelcome) => {
            const {password, saveLogin} = data
            const username = data.username.trim().toLowerCase()
            if (loginBroadcastOperation) {
                const {type, operation, successCallback, errorCallback} = loginBroadcastOperation.toJS()
                dispatch(transaction.actions.broadcastOperation({type, operation, username, password, successCallback, errorCallback}))
                // Avoid saveLogin, this could be a user-provided content page and the login might be an active key.  Security will reject that...
                dispatch(user.actions.usernamePasswordLogin({username, password, saveLogin: false, afterLoginRedirectToWelcome, operationType: type}))
                dispatch(user.actions.closeLogin())
            } else {
                dispatch(user.actions.usernamePasswordLogin({username, password, saveLogin, afterLoginRedirectToWelcome}))
            }
        },
        clearError: () => { if (hasError) dispatch(user.actions.loginError({error: null})) },
        qrReader: (dataCallback) => {
            dispatch(g.actions.showDialog({name: 'qr_reader', params: {handleScan: dataCallback}}));
        },
        showChangePassword: (username, defaultPassword) => {
            dispatch(user.actions.closeLogin())
            dispatch(g.actions.remove({key: 'changePassword'}))
            dispatch(g.actions.showDialog({name: 'changePassword', params: {username, defaultPassword}}))
        },
    })
)(LoginForm)
