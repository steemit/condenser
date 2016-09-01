/* eslint react/prop-types: 0 */
import React, { PropTypes, Component } from 'react';
import ReactDOM from 'react-dom';
import {PublicKey} from 'shared/ecc'
import transaction from 'app/redux/Transaction'
import g from 'app/redux/GlobalReducer'
import user from 'app/redux/User'
import {validate_account_name} from 'app/utils/ChainValidation';
import runTests from 'shared/ecc/test/BrowserTests';
import { translate } from '../../Translator';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate'
import reactForm from 'app/utils/ReactForm'

class LoginForm extends Component {

    static propTypes = {
        //Steemit
        login_error: PropTypes.string,
        onCancel: PropTypes.func,
    };

    static defaultProps = {
        afterLoginRedirectToAccount: false
    }

    constructor(props) {
        super()
        const cryptoTestResult = runTests();
        let cryptographyFailure = false;
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

    componentWillMount() {
        // Use username.value as the defult (input types should not contain both value and defaultValue)
        const username = {...this.state.username}
        username.value = this.props.initialUsername
        this.setState({username})
    }

    componentDidMount() {
        if (this.refs.username) ReactDOM.findDOMNode(this.refs.username).focus()
    }

    shouldComponentUpdate = shouldComponentUpdate(this, 'LoginForm')

    initForm(props) {
        reactForm({
            name: 'login',
            instance: this,
            fields: ['username', 'password', 'saveLogin:bool'],
            initialValues: props.initialValues,
            validation: values => ({
                username: ! values.username ? 'Required' : validate_account_name(values.username.split('/')[0]),
                password: ! values.password ? 'Required' :
                    values.password.length < 16 ? 'Password must be 16 characters or more' :
                    PublicKey.fromString(values.password) ? 'You need a private password or key (not a public key)' :
                    null,
            })
        })
    }

    saveLoginToggle = () => {
        const {saveLogin} = this.state
        saveLoginDefault = !saveLoginDefault
        localStorage.setItem('saveLogin', saveLoginDefault ? 'yes' : 'no')
        saveLogin.props.onChange(saveLoginDefault) // change UI
    }
    showChangePassword = () => {
        const {username, password} = this.state
        this.props.showChangePassword(username.value, password.value)
    }
    render() {
        if (!process.env.BROWSER) {
            return <div className="row">
                        <div className="column">
                            <p>{translate("loading")}..</p>
                        </div>
                    </div>;
        }
        if (this.state.cryptographyFailure) {
            return <div className="row">
                <div className="column">
                    <div className="callout alert">
                        <h4>{translate("cryptography_test_failed")}</h4>
                        <p>{translate("unable_to_log_you_in")}.</p>
                        <p>
                            {translate('latest_browsers_do_work', {
                                chromeLink: <a href="https://www.google.com/chrome/">Chrome</a>,
                                mozillaLink: <a href="https://www.mozilla.org/en-US/firefox/new/">Firefox</a>
                            })}
                        </p>
                    </div>
                </div>
            </div>;
        }

        if ($STM_Config.read_only_mode) {
            return <div className="row">
                        <div className="column">
                            <div className="callout alert">
                                <p>{translate("read_only_mode")}</p>
                            </div>
                        </div>
                    </div>;
        }

        const {loginBroadcastOperation, dispatchSubmit, afterLoginRedirectToAccount, msg} = this.props;
        const {username, password, saveLogin} = this.state
        const {submitting, valid, handleSubmit} = this.state.login
        const {usernameOnChange, onCancel, /*qrReader*/} = this
        const disabled = submitting || !valid;

        const title = loginBroadcastOperation ?
            'Authenticate for this transaction' :
            'Login to your Steem Account';
        const opType = loginBroadcastOperation ? loginBroadcastOperation.get('type') : null
        const authType = /vote|comment/.test(opType) ? 'Posting, Active, or Owner' : 'Active or Owner'
        const submitLabel = loginBroadcastOperation ? 'Sign' : 'Login';
        let error = password.touched && password.error ? password.error : this.props.login_error
        if (error === 'owner_login_blocked') {
            error = <span>
                        {translate("password_is_bound_to_account", {
                                changePasswordLink: <a onClick={this.showChangePassword} >
                                                        {translate('update_your_password')}
                                                    </a>
                            })} />
                    </span>
                } else if (error === 'active_login_blocked') {
                    error = <span>{translate('this_password_is_bound_to_your_accounts_private_key')}</span>
        }
        let message = null;
        if (msg) {
            if (msg === 'accountcreated') {
                message =<div className="callout primary">
                        <p>{translate("account_creation_succes")}</p>
                    </div>;
            }
            else if (msg === 'accountrecovered') {
                message =<div className="callout primary">
                    <p>{translate("account_recovery_succes")}</p>
                </div>;
            }
            else if (msg === 'passwordupdated') {
                message = <div className="callout primary">
                    <p>{translate("password_update_succes", { accountName: username.value })}.</p>
                </div>;
            }
        }
        const form = (
            <form onSubmit={handleSubmit(data => {
                // bind redux-form to react-redux
                console.log('Login\tdispatchSubmit');
                return dispatchSubmit(data, loginBroadcastOperation, afterLoginRedirectToAccount)
            })}
                onChange={this.props.clearError}
                method="post"
            >
                <div>
                    <input type="text" required placeholder={translate('enter_username')} ref="username"
                        {...username.props} onChange={usernameOnChange} autoComplete="on" disabled={submitting} />
                    <div className="error">{username.touched && username.error && username.error}&nbsp;</div>
                </div>

                <div>
                    <input type="password" required ref="pw" placeholder={translate('password_or_wif')} {...password.props} autoComplete="on" disabled={submitting} />
                    <div className="error">{error}&nbsp;</div>
                </div>
                {loginBroadcastOperation && <div>
                    <div className="info">
                        {translate("requires_auth_key", { authType })} />.
                    </div>
                </div>}
                <div>
                    <label htmlFor="saveLogin">
                        {translate("keep_me_logged_in") + ' '}
                        <input id="saveLogin" type="checkbox" ref="pw" {...saveLogin.props} onChange={this.saveLoginToggle} disabled={submitting} /></label>
                </div>
                <br />
                <div>
                    <button type="submit" disabled={submitting || disabled} className="button">
                        {submitLabel}
                    </button>
                    {this.props.onCancel && <button type="button float-right" disabled={submitting} className="button hollow" onClick={onCancel}>
                        {translate("cancel")}
                    </button>}
                </div>
            </form>
        )

        return (
           <div className="LoginForm">
               {message}
               <h3>{title}</h3>
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
        dispatchSubmit: (data, loginBroadcastOperation, afterLoginRedirectToAccount) => {
            const {password, saveLogin} = data
            const username = data.username.trim().toLowerCase()
            if (loginBroadcastOperation) {
                const {type, operation, successCallback, errorCallback} = loginBroadcastOperation.toJS()
                dispatch(transaction.actions.broadcastOperation({type, operation, username, password, successCallback, errorCallback}))
                dispatch(user.actions.usernamePasswordLogin({username, password, saveLogin, afterLoginRedirectToAccount, operationType: type}))
                if (!saveLogin) {
                    dispatch(user.actions.closeLogin())
                }
            } else {
                dispatch(user.actions.usernamePasswordLogin({username, password, saveLogin, afterLoginRedirectToAccount}))
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
