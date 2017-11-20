/* eslint react/prop-types: 0 */
import React from 'react'
import LoadingIndicator from 'app/components/elements/LoadingIndicator'
import {validate_account_name} from 'app/utils/ChainValidation'
import {cleanReduxInput} from 'app/utils/ReduxForms'
import tt from 'counterpart';
import { APP_NAME } from 'app/client_config';
import {PrivateKey, PublicKey, key_utils} from 'steem/lib/auth/ecc';
import {api} from 'steem';

const {string, oneOf} = React.PropTypes

class ChangePassword extends React.Component {
    static propTypes = {
        // HTML properties
        username: string,
        defaultPassword: string,
        authType: oneOf(['posting', 'active', 'owner', 'memo']), // null for all
        priorAuthKey: string, // Required pubkey if authType is given
    }
    constructor(props) {
        super(props)
        this.state = {accountName: props.username, nameError: '', generated: false}
        this.onNameChange = this.onNameChange.bind(this)
        this.generateWif = this.generateWif.bind(this)
    }
    componentWillMount() {
    }
    componentWillUnmount() {
        newWif = null
    }

    generateWif(e) {
        newWif = 'P' + key_utils.get_random_key().toWif()
        this.setState({generated: true})
    }
    validateAccountName(name) {
        let nameError = '';
        let promise;
        if (name.length > 0) {
            nameError = validate_account_name(name);
            if (!nameError) {
                promise = api.getAccountsAsync([name]).then(res => {
                    return !(res && res.length > 0) ? tt('g.account_not_found') : '';
                });
            }
        }
        if (promise) {
            promise
                .then(nameError => this.setState({nameError}))
                .catch(() => this.setState({
                    nameError: "Account name can't be verified right now due to server failure. Please try again later."
                }));
        } else {
            this.setState({nameError});
        }
    }
    onNameChange(e) {
        const accountName = e.target.value.trim().toLowerCase();
        this.validateAccountName(accountName);
        this.setState({accountName});
    }
    dispatchSubmit = () => {
        const {changePassword, authType, priorAuthKey} = this.props
        const {resetForm, notify} = this.props
        const {password, twofa} = this.props.fields
        const accountName = this.state.accountName;
        const success = () => {
            this.setState({loading: false, error: null})
            const {onClose} = this.props
            if(onClose) onClose()
            if(resetForm) resetForm()
            notify('Password Updated')
            window.location = `/login.html#account=${accountName}&msg=passwordupdated`;
        }
        const error = (e) => {
            this.setState({loading: false, error: e})
        }
        this.setState({loading: true, error: null})
        changePassword(accountName, authType, priorAuthKey,
            password.value, twofa.value, success, error)
    }
    render() {
        if (!process.env.BROWSER) { // don't render this page on the server
            return <div className="row">
                <div className="column">
                    {tt('g.loading')}..
                </div>
            </div>;
        }
        const {generated, loading, error} = this.state
        const {username, authType, priorAuthKey, /*enable2fa*/} = this.props
        const {handleSubmit, submitting, onClose} = this.props // form stuff
        const {password, confirmPassword, confirmCheck, confirmSaved /*twofa*/} = this.props.fields

        if(authType && !priorAuthKey)
            console.error('Missing priorAuthKey')

        const error2 = /Missing Owner Authority/.test(error) ?
            <span>{tt('g.this_is_wrong_password')}. {tt('g.do_you_need_to') + ' '}<a href="/recover_account_step_1">{tt('g.recover_your_account')}</a>?</span> :
            error;

        const {accountName, nameError} = this.state;
        const readOnlyAccountName = username && username.length > 0;

        return (
            <span className="ChangePassword">
                <form onSubmit={handleSubmit(() => {this.dispatchSubmit()})}>
                    {username && <h4>{tt('g.reset_usernames_password', {username})}</h4>}
                    {authType ?
                        <p>{tt('g.this_will_update_usernames_authtype_key', {
                                username, authType
                            })}</p> :
                        <div className="ChangePassword__rules">
                            <hr />
                            <p>
                                {tt('g.the_rules_of_APP_NAME.one', {APP_NAME})}
                                <br />
                                {tt('g.the_rules_of_APP_NAME.second', {APP_NAME})}
                                <br />
                                {tt('g.the_rules_of_APP_NAME.third', {APP_NAME})}
                                <br />
                                {tt('g.the_rules_of_APP_NAME.fourth')}
                                <br />
                                {tt('g.the_rules_of_APP_NAME.fifth')}
                                <br />
                                {tt('g.the_rules_of_APP_NAME.sixth')}
                                <br />
                                {tt('g.the_rules_of_APP_NAME.seventh')}
                            </p>
                        <hr />
                        </div>
                    }

                    <div className={nameError ? 'error' : ''}>
                        <label>{tt('g.account_name')}
                            <input type="text" disabled={readOnlyAccountName} autoComplete="off" value={accountName} onChange={this.onNameChange} />
                        </label>
                        <p className="help-text">{nameError}</p>
                    </div>
                    <br />
                    <label>
                        <div className="float-right"><a href="/recover_account_step_1">{tt('g.recover_password')}</a></div>
                        {tt('g.current_password')}
                        <br />
                        <input {...cleanReduxInput(password)} type="password" disabled={loading} />
                    </label>
                    {password.touched && password.error && <div className="error">{password.error}</div>}

                    <br></br>

                    <label>
                        {tt('g.generated_password') + ' ' } <span className="secondary">({tt('g.new')})</span><br />
                    </label>
                    {generated &&
                        <span>
                            <div>
                                {/* !! Do not put keys in a label, labels have an uppercase css style applied !! */}
                                <div className="overflow-ellipsis"><code style={{display: 'block', padding: '0.2rem 0.5rem', background: 'white', color: '#c7254e', wordWrap: 'break-word', fontSize: '100%', textAlign: 'center'}}>{newWif}</code></div>
                            </div>
                            <label className="ChangePassword__backup_text">
                                {tt('g.backup_password_by_storing_it')}.
                            </label>
                        </span>
                        ||
                        <button type="button" className="button hollow" onClick={this.generateWif}>{tt('g.click_to_generate_password')}</button>
                    }

                    <br></br>

                    <label>
                        {tt('g.re_enter_generate_password')}
                        <br />
                        <input {...cleanReduxInput(confirmPassword)} type="password" disabled={loading} />
                    </label>
                    {confirmPassword.touched && confirmPassword.error && <div className="error">{confirmPassword.error}</div>}

                    <br />

                    <label><input {...cleanReduxInput(confirmCheck)} type="checkbox" /> {tt('g.understand_that_APP_NAME_cannot_recover_password', {APP_NAME})}</label>
                    {confirmCheck.touched && confirmCheck.error && <div className="error">{confirmCheck.error}</div>}

                    <label><input {...cleanReduxInput(confirmSaved)} type="checkbox" />{tt('g.i_saved_password')}</label>
                    {confirmSaved.touched && confirmSaved.error && <div className="error">{confirmSaved.error}</div>}
                    <br />
                    {loading && <div><LoadingIndicator type="circle" /></div>}
                    {!loading && <div className="ChangePassword__btn-container">
                        <div className="error">{error2}</div>
                        <button type="submit" className="button" disabled={loading}>
                            {tt('g.update_password')}
                        </button>
                        {onClose && <button type="button" disabled={submitting} className="button hollow float-right" onClick={onClose}>
                            {tt('g.cancel')}
                        </button>}
                    </div>}
                </form>
            </span>
        )
                    // {enable2fa && <p>
                    //     <h4>Enable Steemit Account Recovery</h4>
                    //     <input type="checkbox" {...twofa} />
                    //     {twofa.touched && twofa.error && <div className="error">{twofa.error}</div>}
                    //     <br />
                    //     <p>
                    //         This feature will add a Steemit account as an additional owner on your account.  This is a service that can be used by yourself and Steemit to recover your account should it get compromised or you loose your password.
                    //     </p>
                    //     <small><a href="//@steemit" target="_blank">@Steemit</a></small>
                    // </p>}
                    // <br />
    }
}

let newWif = null
const keyValidate = (values) => ({
    password: ! values.password ? tt('g.required') :
        PublicKey.fromString(values.password) ? tt('g.you_need_private_password_or_key_not_a_public_key') :
        null,
    confirmPassword: ! values.confirmPassword ? tt('g.required') :
        values.confirmPassword.trim() !== newWif ? tt('g.passwords_do_not_match') : null,
    confirmCheck: ! values.confirmCheck ? tt('g.required') : null,
    confirmSaved: ! values.confirmSaved ? tt('g.required') : null,
})

import {reduxForm} from 'redux-form' // @deprecated, instead use: app/utils/ReactForm.js
export default reduxForm(
    { form: 'changePassword', fields: ['password', 'confirmPassword', 'confirmCheck', 'confirmSaved', 'twofa'] },
    // mapStateToProps
    (state, ownProps) => {
        const {authType} = ownProps
        const enable2fa = authType == null
        return {
            ...ownProps, enable2fa,
            validate: keyValidate,
            initialValues: {twofa: false, password: ownProps.defaultPassword},
        }
    },
    // mapDispatchToProps
    dispatch => ({
        changePassword: (
            accountName, authType, priorAuthKey, password, twofa = false,
            success, error
        ) => {
            const ph = role => PrivateKey.fromSeed(`${accountName}${role}${newWif}`).toWif()
            const auths = authType ?
                [
                    {authType, oldAuth: priorAuthKey, newAuth: newWif}
                ] :
                [
                    {authType: 'owner', oldAuth: password, newAuth: ph('owner', newWif)},
                    {authType: 'active', oldAuth: password, newAuth: ph('active', newWif)},
                    {authType: 'posting', oldAuth: password, newAuth: ph('posting', newWif)},
                    {authType: 'memo', oldAuth: password, newAuth: ph('memo', newWif)},
                ]
            dispatch({type: 'transaction/UPDATE_AUTHORITIES', payload: {
                twofa,
                // signingKey provides the password if it was not provided in auths
                signingKey: authType ? password : null,
                accountName, auths,
                onSuccess: success, onError: error,
                // notifySuccess: 'Change password success'
            }})
        },
        notify: (message) => {
            dispatch({type: 'ADD_NOTIFICATION', payload: {
                key: "chpwd_" + Date.now(),
                message,
                dismissAfter: 5000}
            });
        },
    })
)(ChangePassword)
