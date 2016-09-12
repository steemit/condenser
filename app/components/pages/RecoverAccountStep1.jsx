import React from 'react';
import Apis from 'shared/api_client/ApiInstances';
import SvgImage from 'app/components/elements/SvgImage';
import PasswordInput from 'app/components/elements/PasswordInput';
import constants from 'app/redux/constants';
import {PrivateKey} from 'shared/ecc';
import { translate } from 'app/Translator';
import { FormattedHTMLMessage } from 'react-intl';

const email_regex = /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/;

function passwordToOwnerPubKey(account_name, password) {
    let pub_key;
    try {
        pub_key = PrivateKey.fromWif(password);
    } catch(e) {
        pub_key = PrivateKey.fromSeed(account_name + 'owner' + password);
    }
    return pub_key.toPublicKey().toString();
}

class RecoverAccountStep1 extends React.Component {

    static propTypes = {
    };

    constructor(props) {
        super(props);
        this.state = {
            name: '',
            name_error: '',
            email: '',
            email_error: '',
            error: '',
            progress_status: '',
            password: {value: '', valid: false},
            show_social_login: '',
            email_submitted: false
        };
        this.onNameChange = this.onNameChange.bind(this);
        this.onEmailChange = this.onEmailChange.bind(this);
        this.onPasswordsChange = this.onPasswordsChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onSubmitEmail = this.onSubmitEmail.bind(this);
    }

    onNameChange(e) {
        const name = e.target.value.trim().toLowerCase();
        this.validateAccountName(name);
        this.setState({name, error: ''});
    }

    onEmailChange(e) {
        const email = e.target.value.trim().toLowerCase();
        let email_error = '';
        if (!email_regex.test(email.toLowerCase())) email_error = translate('not_valid');
        this.setState({email, email_error});
    }

    validateAccountName(name) {
        if (!name) return;
        Apis.db_api('get_accounts', [name]).then(res => {
            this.setState({name_error: !res || res.length === 0 ? translate('account_name_is_not_found') : ''});
            if(res.length) {
                const [account] = res
                // if your last owner key update is prior to July 14th then the old key will not be able to recover
                const ownerUpdate = /Z$/.test(account.last_owner_update) ? account.last_owner_update : account.last_owner_update + 'Z'
                const ownerUpdateTime = new Date(ownerUpdate).getTime()
                const THIRTY_DAYS_AGO = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)).getTime()
                if(ownerUpdateTime < Math.max(THIRTY_DAYS_AGO, constants.JULY_14_HACK))
                    this.setState({name_error: translate('unable_to_recover_account_not_change_ownership_recently')})
            }
        })
    }

    validateAccountOwner(name) {
        const oldOwner = passwordToOwnerPubKey(name, this.state.password.value);
        return Apis.db_api('get_owner_history', name).then(history => {
            const res = history.filter(a => {
                const owner = a.previous_owner_authority.key_auths[0][0];
                return owner === oldOwner;
            });
            return res.length > 0;
        });
    }

    getAccountIdentityProviders(name, owner_key) {
        return fetch('/api/v1/account_identity_providers', {
            method: 'post',
            mode: 'no-cors',
            credentials: 'same-origin',
            headers: {
                Accept: 'application/json',
                'Content-type': 'application/json'
            },
            body: JSON.stringify({csrf: $STM_csrf, name, owner_key})
        }).then(r => r.json()).then(res => {
            console.log('-- validateOffchainAccount -->', res);
            return res.error ? 'email' : res.provider;
        });
    }

    onPasswordsChange({oldPassword, valid}) {
        this.setState({password: {value: oldPassword, valid}, error: ''});
    }

    onSubmit(e) {
        e.preventDefault();
        const owner_key = passwordToOwnerPubKey(this.state.name, this.state.password.value);
        this.validateAccountOwner(this.state.name).then(result => {
            if (result) {
                this.getAccountIdentityProviders(this.state.name, owner_key).then(provider => {
                    this.setState({show_social_login: provider});
                });
            }
            else this.setState({error: translate('password_not_used_in_last_days')});
        });
    }

    onSubmitEmail(e) {
        e.preventDefault();
        const {name, password} = this.state;
        const owner_key = passwordToOwnerPubKey(name, password.value);
        fetch('/api/v1/initiate_account_recovery_with_email', {
            method: 'post',
            mode: 'no-cors',
            credentials: 'same-origin',
            headers: {
                Accept: 'application/json',
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                csrf: $STM_csrf,
                contact_email: this.state.email,
                account_name: name,
                owner_key
            })
        }).then(r => r.json()).then(res => {
            if (res.error) {
                this.setState({email_error: res.error || 'Unknown'});
            } else {
                if (res.status === 'ok') {
                    this.setState({email_submitted: true});
                }
                if (res.status === 'duplicate') {
                    this.setState({email_error: translate('request_already_submitted_contact_support')});
                }
            }
        }).catch(error => {
            console.error('request_account_recovery server error (2)', error);
            this.setState({email_error: (error.message ? error.message : error)});
        });
    }

    render() {
        const {name, name_error, email, email_error, error, progress_status, password, show_social_login, email_submitted} = this.state;
        const owner_key = passwordToOwnerPubKey(name, password.value);
        const valid = name && !name_error && password.valid;
        const submit_btn_class = 'button action' + (!valid ? ' disabled' : '');
        const show_account_and_passwords = !email_submitted && !show_social_login;
        return (
            <div className="RestoreAccount SignUp">
                {show_account_and_passwords && <div className="row">
                    <div className="column large-4">
                        <h2>{translate('stolen_account_recovery')}</h2>
                        <p>
                            {translate('recover_account_intro')}
                        </p>
                        <form onSubmit={this.onSubmit} noValidate>
                            <div className={name_error ? 'error' : ''}>
                                <label>
                                    {translate('account_name')}
                                    <input type="text" name="name" autoComplete="off" onChange={this.onNameChange} value={name} />
                                </label>
                                <p className="error">{name_error}</p>
                            </div>
                            <PasswordInput passwordLabel={translate('recent_password')} onChange={this.onPasswordsChange} />
                            <br />
                            <div className="error">{error}</div>
                            {progress_status ? <span><LoadingIndicator type="circle" inline /> {progress_status}</span>
                        : <input disabled={!valid} type="submit" className={submit_btn_class} value= {translate('begin_recovery')} />}
                        </form>
                    </div>
                </div>}

                {show_social_login && show_social_login !== 'email' &&
                <form action="/initiate_account_recovery" method="post">
                    <input type="hidden" name="csrf" value={$STM_csrf} />
                    <input type="hidden" name="account_name" value={name} />
                    <input type="hidden" name="owner_key" value={owner_key} />
                    <div className="row">
                        <div className="column large-4">
                            {show_social_login === 'both' ? <p>{translate('login_with_facebook_or_reddit_media_to_verify_identity')}.</p>
                        : <p>{translate('login_with_social_media_to_verify_identity', {
                            provider: show_social_login
                        })}.</p>}
                        </div>
                    </div>
                    <div className="row">
                        &nbsp;
                    </div>
                    {(show_social_login === 'both' || show_social_login === 'facebook') && <div className="row">
                        <div className="column large-4 shrink">
                            <SvgImage name="facebook" width="64px" height="64px" />
                        </div>
                        <div className="column large-8">
                            <input type="submit" name="provider" value="facebook" className="button SignUp--fb-button" />
                        </div>
                    </div>}
                    <div className="row">
                        &nbsp;
                    </div>
                    {(show_social_login === 'both' || show_social_login === 'reddit') && <div className="row">
                        <div className="column large-4">
                            <SvgImage name="reddit" width="64px" height="64px" />
                        </div>
                        <div className="column large-8">
                            <input type="submit" name="provider" value="reddit" className="button SignUp--reddit-button" />
                        </div>
                    </div>}
                    <div className="row">
                        <div className="column">&nbsp;</div>
                    </div>
                </form>
                }
                {show_social_login && show_social_login === 'email' &&
                    <div className="row">
                        <div className="column large-4">
                            {
                                email_submitted
                                ?   <div>
                                        {/* currently translateHtml() does not work, using <FormattedHTMLMessage /> instead */}
                                        <FormattedHTMLMessage id="thanks_for_submitting_request_for_account_recovery" />
                                    </div>
                                : <form onSubmit={this.onSubmitEmail} noValidate>
                                <p>{translate('enter_email_toverify_identity')}</p>
                                <div className={email_error ? 'column large-4 shrink error' : 'column large-4 shrink'}>
                                    <label>{translate('email')}
                                        <input type="text" name="email" autoComplete="off" onChange={this.onEmailChange} value={email} />
                                    </label>
                                    <p className="error">{email_error}</p>
                                    <input type="submit" disabled={email_error || !email} className="button hollow" value={translate('continue_with_email')} />
                                </div>
                            </form>
                            }
                        </div>
                    </div>
                }
            </div>
        );
    }
}

module.exports = {
    path: 'recover_account_step_1',
    component: RecoverAccountStep1
};
