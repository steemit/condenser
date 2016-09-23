/* eslint react/prop-types: 0 */
import React from 'react'
import transaction from 'app/redux/Transaction'
import LoadingIndicator from 'app/components/elements/LoadingIndicator'
import {PrivateKey} from 'shared/ecc'
import {key_utils} from 'shared/ecc'
import Apis from 'shared/api_client/ApiInstances'
import {validate_account_name} from 'app/utils/ChainValidation'
import {cleanReduxInput} from 'app/utils/ReduxForms'

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
                promise = Apis.db_api('get_accounts', [name]).then(res => {
                    return !(res && res.length > 0) ? 'Account not found' : '';
                });
            }
        }
        if (promise) {
            promise.then(error => this.setState({nameError: error}));
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
                    Loading..
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
            <span>This is the wrong password.  Do you need to <a href="/recover_account_step_1">recover your account</a>?</span> :
            error;

        const {accountName, nameError} = this.state;
        const readOnlyAccountName = username && username.length > 0;

        return (
            <span className="ChangePassword">
                <form onSubmit={handleSubmit(() => {this.dispatchSubmit()})}>
                    {username && <h4>Reset {username}&apos;s Password</h4>}
                    {authType ?
                        <p>This will update {username}&apos; {authType} key.</p> :
                        <div className="ChangePassword__rules">
                            <hr />
                            <p>
                                The first rule of Steemit is: Do not lose your password.<br />
                                The second rule of Steemit is: Do <strong>not</strong> lose your password.<br />
                                The third rule of Steemit is: We cannot recover your password.<br />
                                The fourth rule: If you can remember the password, it&apos;s not secure.<br />
                                The fifth rule: Use only randomly-generated passwords.<br />
                                The sixth rule: Do not tell anyone your password.<br />
                                The seventh rule: Always back up your password.
                            </p>
                            <hr />
                        </div>
                    }

                    <div className={nameError ? 'error' : ''}>
                        <label>Account Name
                            <input type="text" disabled={readOnlyAccountName} autoComplete="off" value={accountName} onChange={this.onNameChange} />
                        </label>
                        <p className="help-text">{nameError}</p>
                    </div>
                    <br />
                    <label>
                        <div className="float-right"><a href="/recover_account_step_1">Recover Account</a></div>
                        Current Password
                        <br />
                        <input {...cleanReduxInput(password)} type="password" disabled={loading} />
                    </label>
                    {password.touched && password.error && <div className="error">{password.error}</div>}

                    <br></br>

                    <label>
                        Generated Password <span className="secondary">(new)</span><br />
                    </label>
                    {generated &&
                        <span>
                            <div>
                                {/* !! Do not put keys in a label, labels have an uppercase css style applied !! */}
                                <div className="overflow-ellipsis"><code style={{display: 'block', padding: '0.2rem 0.5rem', background: 'white', color: '#c7254e', wordWrap: 'break-word', fontSize: '100%', textAlign: 'center'}}>{newWif}</code></div>
                            </div>
                            <label className="ChangePassword__backup_text">
                                Back it up by storing in your password manager or a text file.
                            </label>
                        </span>
                        ||
                        <center><button type="button" className="button hollow" onClick={this.generateWif}>Click to generate password</button></center>
                    }

                    <br></br>

                    <label>
                        Re-enter Generated Password
                        <br />
                        <input {...cleanReduxInput(confirmPassword)} type="password" disabled={loading} />
                    </label>
                    {confirmPassword.touched && confirmPassword.error && <div className="error">{confirmPassword.error}</div>}

                    <br />

                    <label><input {...cleanReduxInput(confirmCheck)} type="checkbox" /> I understand that Steemit cannot recover lost passwords.</label>
                    {confirmCheck.touched && confirmCheck.error && <div className="error">{confirmCheck.error}</div>}

                    <label><input {...cleanReduxInput(confirmSaved)} type="checkbox" /> I have securely saved my generated password.</label>
                    {confirmSaved.touched && confirmSaved.error && <div className="error">{confirmSaved.error}</div>}
                    <br />
                    {loading && <div><LoadingIndicator type="circle" /></div>}
                    {!loading && <div>
                        <div className="error">{error2}</div>
                        <button type="submit" className="button" disabled={loading}>
                            Update Password
                        </button>
                        {onClose && <button type="button" disabled={submitting} className="button hollow float-right" onClick={onClose}>
                            Cancel
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

import {PublicKey} from 'shared/ecc'
let newWif = null
const keyValidate = (values) => ({
    password: ! values.password ? 'Required' :
        PublicKey.fromString(values.password) ? 'You need a private password or key (not a public key)' :
        null,
    confirmPassword: ! values.confirmPassword ? 'Required' :
        values.confirmPassword.trim() !== newWif ? 'Passwords do not match' : null,
    confirmCheck: ! values.confirmCheck ? 'Required' : null,
    confirmSaved: ! values.confirmSaved ? 'Required' : null,
})

import {reduxForm} from 'redux-form'
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
            dispatch(transaction.actions.updateAuthorities({
                twofa,
                // signingKey provides the password if it was not provided in auths
                signingKey: authType ? password : null,
                accountName, auths,
                onSuccess: success, onError: error,
                // notifySuccess: 'Change password success'
            }))
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
