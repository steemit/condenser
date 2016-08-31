/* eslint react/prop-types: 0 */
import React, { PropTypes, Component } from 'react';
import ReactDOM from 'react-dom';
import {reduxForm} from 'redux-form';
import {PublicKey} from 'shared/ecc'
import transaction from 'app/redux/Transaction'
import g from 'app/redux/GlobalReducer'
import user from 'app/redux/User'
import {validate_account_name} from 'app/utils/ChainValidation';
import runTests from 'shared/ecc/test/BrowserTests';
import {cleanReduxInput} from 'app/utils/ReduxForms';
import { translate } from '../../Translator';

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
        this.state = {
            cryptographyFailure
        }
        this.usernameOnChange = e => {
            e.target.value = e.target.value.toLowerCase()
            this.props.fields.username.onChange(e)
        }
        this.onCancel = () => {
            const {onCancel, loginBroadcastOperation} = this.props
            const errorCallback = loginBroadcastOperation && loginBroadcastOperation.get('errorCallback')
            if (errorCallback) errorCallback('Canceled')
            if (onCancel) onCancel()
        }
        this.initFunc(props)
    }
    componentDidMount() {
        if (this.refs.username) ReactDOM.findDOMNode(this.refs.username).focus()
        // ReactDOM.findDOMNode(this.refs.pw).focus() // does not work
    }
    componentWillReceiveProps(nextProps) {
        this.initFunc(nextProps)
    }
    initFunc(props) {
        const {qrReader, fields: {password}} = props
        this.qrReader = () => {
            qrReader(data => {password.onChange(data)})
        }
    }
    saveLoginToggle = (e) => {
        const {saveLogin} = this.props.fields
        saveLoginDefault = !saveLoginDefault
        localStorage.setItem('saveLogin', saveLoginDefault ? 'yes' : 'no')
        saveLogin.onChange(e) // change UI
    }
    showChangePassword = () => {
        const {username, password} = this.props.fields
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

        const {
            loginBroadcastOperation,
            fields: {username, password, saveLogin},
            handleSubmit, dispatchSubmit,
            submitting, afterLoginRedirectToAccount, suggestedAccountName, msg
        } = this.props;

        const {usernameOnChange, onCancel, /*qrReader*/} = this
        const disabled = submitting;

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
                    <p>{translate("password_update_succes", { accountName: suggestedAccountName })}.</p>
                </div>;
            }
        }

        const form = (
            <form onSubmit={handleSubmit(data => {
                // bind redux-form to react-redux
                // console.log('Login\tdispatchSubmit');
                return dispatchSubmit(data, loginBroadcastOperation, afterLoginRedirectToAccount)
            })}
                onChange={this.props.clearError}
                method="post"
            >
                <div>
                    <input type="text" placeholder={translate('enter_username')} ref="username" {...cleanReduxInput(username)}
                        onChange={usernameOnChange} autoComplete="on" disabled={submitting} defaultValue={suggestedAccountName} />
                    <div className="error">{username.touched && username.error && username.error}&nbsp;</div>
                </div>

                <div>
                    <input type="password" ref="pw" placeholder={translate('password_or_wif')} {...cleanReduxInput(password)} autoComplete="on" disabled={submitting} />
                    <div className="error">{error}&nbsp;</div>
                </div>
                {loginBroadcastOperation && <div>
                    <div className="info">
                        {translate("requires_auth_key", { authType })} />.
                    </div>
                </div>}
                <div>
                    <label htmlFor="saveLogin">{translate("keep_me_logged_in") + ' '}<input id="saveLogin" type="checkbox" ref="pw" {...cleanReduxInput(saveLogin)} onChange={this.saveLoginToggle} disabled={submitting} /></label>
                </div>
                <br />
                <div>
                    <button type="submit" disabled={disabled} className="button">
                        {submitLabel}
                    </button>
                    {this.props.onCancel && <button type="button" disabled={submitting} className="button hollow" onClick={onCancel}>
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

const validate = values => ({
    username: ! values.username ? translate('required') : validate_account_name(values.username.split('/')[0]),
    password: ! values.password ? translate('required') :
        values.password.length < 16 ? translate('password_must_be_characters_or_more', {amount: 16}) :
        PublicKey.fromString(values.password) ? translate('need_password_or_key') :
        null,
})

let hasError
let saveLoginDefault = true
if (process.env.BROWSER) {
    const s = localStorage.getItem('saveLogin')
    if (s === 'no') saveLoginDefault = false
}

export default reduxForm(
    // config
    { form: 'login', validate },

    // mapStateToProps
    (state) => {
        const login_error = state.user.get('login_error')
        const currentUser = state.user.get('current')
        const loginBroadcastOperation = state.user.get('loginBroadcastOperation')
        const initialValues = {
            username: currentUser && currentUser.get('username'),
            saveLogin: saveLoginDefault,
        }
        const loginDefault = state.user.get('loginDefault')
        if(loginDefault) {
            const {username, authType} = loginDefault.toJS()
            if(username && authType) initialValues.username = username + '/' + authType
        }
        const account_match = window.location.hash.match(/account\=([\w\d\-\.]+)/);
        let suggestedAccountName = '';
        if (account_match && account_match.length > 1) suggestedAccountName = account_match[1];
        let msg = '';
        const msg_match = window.location.hash.match(/msg\=([\w]+)/);
        if (msg_match && msg_match.length > 1) msg = msg_match[1];
        const fields = ['username', 'password', 'saveLogin']
        hasError = !!login_error
        return {
            login_error,
            loginBroadcastOperation,
            fields,
            initialValues,
            suggestedAccountName,
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
