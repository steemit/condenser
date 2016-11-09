import React from 'react';
import {connect} from 'react-redux';
import Apis from 'shared/api_client/ApiInstances';
import GeneratedPasswordInput from 'app/components/elements/GeneratedPasswordInput';
import {PrivateKey} from 'shared/ecc';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import { translate } from 'app/Translator';
import Callout from 'app/components/elements/Callout';

function passwordToOwnerPubKey(account_name, password) {
    let pub_key;
    try {
        pub_key = PrivateKey.fromWif(password);
    } catch(e) {
        pub_key = PrivateKey.fromSeed(account_name + 'owner' + password);
    }
    return pub_key.toPublicKey().toString();
}

class RecoverAccountStep2 extends React.Component {

    static propTypes = {
        account_to_recover: React.PropTypes.string,
        recoverAccount: React.PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            name_error: '',
            oldPassword: '',
            newPassword: '',
            valid: false,
            error: '',
            progress_status: '',
            success: false,
        };
        this.onPasswordChange = this.onPasswordChange.bind(this);
        this.oldPasswordChange = this.oldPasswordChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onRecoverFailed = this.onRecoverFailed.bind(this);
        this.onRecoverSuccess = this.onRecoverSuccess.bind(this);
    }

    oldPasswordChange(e) {
        const oldPassword = e.target.value.trim();
        this.setState({oldPassword});
    }

    onPasswordChange(newPassword, valid) {
        this.setState({newPassword, valid});
    }

    onRecoverFailed(error) {
        this.setState({error: error.msg || error.toString(), progress_status: ''});
    }

    onRecoverSuccess() {
        this.setState({success: true, progress_status: ''});
    }

    checkOldOwner(name, oldOwner) {
        return Apis.db_api('get_owner_history', name).then(history => {
            const res = history.filter(a => {
                const owner = a.previous_owner_authority.key_auths[0][0];
                return owner === oldOwner;
            });
            return res.length > 0;
        });
    }

    requestAccountRecovery(name, oldPassword, newPassword) {
        const old_owner_key = passwordToOwnerPubKey(name, oldPassword);
        const new_owner_key = passwordToOwnerPubKey(name, newPassword);
        const new_owner_authority = {weight_threshold: 1, account_auths: [], key_auths: [[new_owner_key, 1]]}
        fetch('/api/v1/request_account_recovery', {
            method: 'post',
            mode: 'no-cors',
            credentials: 'same-origin',
            headers: {
                Accept: 'application/json',
                'Content-type': 'application/json'
            },
            body: JSON.stringify({csrf: $STM_csrf, name, old_owner_key, new_owner_key, new_owner_authority})
        }).then(r => r.json()).then(res => {
            if (res.error) {
                console.error('request_account_recovery server error (1)', res.error);
                this.setState({error: res.error || translate('unknown'), progress_status: ''});
            } else {
                this.setState({error: '', progress_status: translate('recovering_account') + '..'});
                this.props.recoverAccount(name, oldPassword, newPassword, this.onRecoverFailed, this.onRecoverSuccess);
            }
        }).catch(error => {
            console.error('request_account_recovery server error (2)', error);
            this.setState({error: (error.message ? error.message : error), progress_status: ''});
        });
    }

    onSubmit(e) {
        e.preventDefault();
        const {oldPassword, newPassword} = this.state;
        const name = this.props.account_to_recover;
        const oldOwner = passwordToOwnerPubKey(name, oldPassword);
        this.setState({progress_status: translate('checking_account_owner') + '..'});
        this.checkOldOwner(name, oldOwner).then(res => {
            if (res) {
                this.setState({progress_status: translate('sending_recovery_request') + '..'});
                this.requestAccountRecovery(name, oldPassword, newPassword);
            } else {
                this.setState({error: translate('cant_confirm_account_ownership'), progress_status: ''});
            }
        });
    }

    render() {
        if (!process.env.BROWSER) { // don't render this page on the server
            return <div className="row">
                <div className="column">
                    {translate('loading')}..
                </div>
            </div>;
        }
        const {account_to_recover} = this.props;
        if (!account_to_recover) {
            return <Callout body={translate('account_recovery_request_not_confirmed')} />;
        }
        const {oldPassword, valid, error, progress_status, name_error, success} = this.state;
        const submit_btn_class = 'button action' + (!valid || !oldPassword ? ' disabled' : '');

        let submit = null;
        if (progress_status) {
            submit = <span><LoadingIndicator type="circle" inline /> {progress_status}</span>;
        } else {
            if (success) {
                // submit = <h4>Congratulations! Your account has been recovered. Please login using your new password.</h4>;
                window.location = `/login.html#account=${account_to_recover}&msg=accountrecovered`;
            } else {
                submit = <input disabled={!valid} type="submit" className={submit_btn_class} value="Submit" />;
            }
        }
        const disable_password_input = success || progress_status !== '';

        return (
            <div className="RestoreAccount SignUp">
                <div className="row">
                    <div className="column large-6">
                        <h2>{translate('recover_account')}</h2>
                        <form onSubmit={this.onSubmit} autoComplete="off" noValidate>
                            <div className={name_error ? 'error' : ''}>
                                <label>{translate('account_name')}
                                    <input type="text" disabled="true" autoComplete="off" value={account_to_recover} />
                                </label>
                                <p className="help-text">{name_error}</p>
                            </div>
                            <br />
                            <div>
                                <label>{translate('recent_password')}
                                    <input type="password"
                                           disabled={disable_password_input}
                                           autoComplete="off"
                                           value={oldPassword}
                                           onChange={this.oldPasswordChange} />
                                </label>
                            </div>
                            <br />
                            <GeneratedPasswordInput onChange={this.onPasswordChange} disabled={disable_password_input} showPasswordString={oldPassword.length > 0} />
                            <div className="error">{error}</div>
                            <br />
                            {submit}
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = {
    path: 'recover_account_step_2',
    component: connect(
        state => {
            return {
                account_to_recover: state.offchain.get('recover_account'),
            };
        },
        dispatch => ({
            recoverAccount: (
                account_to_recover, old_password, new_password, onError, onSuccess
            ) => {
                dispatch({type: 'transaction/RECOVER_ACCOUNT',
                    payload: {account_to_recover, old_password, new_password, onError, onSuccess}
                })
                dispatch({type: 'user/LOGOUT'})
            },
        })
    )(RecoverAccountStep2)
};
