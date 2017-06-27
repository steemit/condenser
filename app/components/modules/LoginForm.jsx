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
import { translate } from 'app/Translator';
import { translateError } from 'app/utils/ParsersAndFormatters';

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
        const cryptoTestResult = undefined; // = runTests(); // temporarily switch BrowserTests off
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
            if (errorCallback) errorCallback(translate('canceled'))
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
                username: ! values.username ? translate('required') : validate_account_name(values.username.split('/')[0]),
                password: ! values.password ? translate('required') :
                    PublicKey.fromString(values.password) ? translate('you_need_private_password_or_key_not_a_public_key') :
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
                    <p>{translate("loading")}...</p>
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
                            {translate('the_latest_versions_of') + ' '}
                            <a href="https://www.google.com/chrome/">Chrome</a>
                            {' ' + translate('and') + ' '}
                            <a href="https://www.mozilla.org/en-US/firefox/new/">Firefox</a>
                            {' ' + translate('are_well_tested_and_known_to_work_with')}
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

        const {loginBroadcastOperation, dispatchSubmit, afterLoginRedirectToWelcome, msg} = this.props;
        const {username, password, saveLogin} = this.state
        const {submitting, valid, handleSubmit} = this.state.login
        const {usernameOnChange, onCancel, /*qrReader*/} = this
        const disabled = submitting || !valid;

        const title = loginBroadcastOperation ?
            translate('authenticate_for_this_transaction') :
            translate('login_to_your_APP_NAME_account');
        const opType = loginBroadcastOperation ? loginBroadcastOperation.get('type') : null
        const authType = translate(/^vote|comment/.test(opType) ? 'posting' : 'active_or_owner')
        const submitLabel = translate(loginBroadcastOperation ? 'sign' : 'login');
        let error = password.touched && password.error ? password.error : this.props.login_error
        if (error === 'owner_login_blocked') {
            error = <span>
                        {translate("password_is_bound_to_account", {
                                changePasswordLink: <a onClick={this.showChangePassword} >
                                                        {translate('update_your_password')}
                                                    </a>
                            })} />
                        {translate('password_is_bound_to_your_accounts_owner_key')}.
                        <br />
                        {translate('however_you_can_use_it_to') + ' '}
                        <a onClick={this.showChangePassword}>{translate('update_your_password')}</a>.
                        {' ' + translate('to_obtaion_a_more_secure_set_of_keys')}.
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
        const password_info = checkPasswordChecksum(password.value) === false ? translate("password_info") : null
        const form = (
            <form onSubmit={handleSubmit(({data}) => {
                // bind redux-form to react-redux
                return dispatchSubmit(data, loginBroadcastOperation, afterLoginRedirectToWelcome)
            })}
                onChange={this.props.clearError}
                method="post"
            >
                <div className="input-group">
                    <span className="input-group-label">@</span>
                    <input className="input-group-field" type="text" required placeholder={translate('enter_username')} ref="username"
                        {...username.props} onChange={usernameOnChange} autoComplete="on" disabled={submitting}
                    />
                </div>
                {username.touched && username.blur && username.error ? <div className="error">{translateError(username.error)}&nbsp;</div> : null}

                <div>
                    <input type="password" required ref="pw" placeholder={translate('password_or_wif')} {...password.props} autoComplete="on" disabled={submitting} />
                    {error && <div className="error">{translateError(error)}&nbsp;</div>}
                    {error && password_info && <div className="warning">{password_info}&nbsp;</div>}
                </div>
                {loginBroadcastOperation && <div>
                    <div className="info">{translate("requires_auth_key")}.</div>
                </div>}
                {!loginBroadcastOperation && <div>
                    <label htmlFor="saveLogin">
                        {translate("keep_me_logged_in") + ' '}
                        <input id="saveLogin" type="checkbox" ref="pw" {...saveLogin.props} onChange={this.saveLoginToggle} disabled={submitting} /></label>
                </div>}
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
