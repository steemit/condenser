/* eslint react/prop-types: 0 */
import React from 'react';
import {connect} from 'react-redux';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import Apis from 'shared/api_client/ApiInstances';
import {PrivateKey} from 'shared/ecc';
import user from 'app/redux/User';
import {validate_account_name} from 'app/utils/ChainValidation';
import SignUp from 'app/components/modules/SignUp';
import runTests from 'shared/ecc/test/BrowserTests';
import GeneratedPasswordInput from 'app/components/elements/GeneratedPasswordInput';
import SignupProgressBar from 'app/components/elements/SignupProgressBar';
import { translate } from 'app/Translator';
import { localizedCurrency } from 'app/components/elements/LocalizedCurrency';
import { FormattedHTMLMessage } from 'react-intl';
import { SUPPORT_EMAIL } from 'config/client_config';

class CreateAccount extends React.Component {

    static propTypes = {
        loginUser: React.PropTypes.func.isRequired,
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
        const cryptoTestResult = undefined; // = runTests(); // temporarily switch BrowserTests off
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
                    window.location = '/enter_email';
                }
                this.setState({server_error: res.error || translate('unknown'), loading: false});
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
                this.setState({name_error: ''});
                promise = Apis.db_api('get_accounts', [name]).then(res => {
                    return res && res.length > 0 ? 'Account name is not available' : '';
                });
            }
        }
        if (promise) {
            promise
                .then(name_error => this.setState({name_error}))
                .catch(() => this.setState({
                    name_error: "Account name can't be verified right now due to server failure. Please try again later."
                }));
        } else {
            this.setState({name_error});
        }
    }

    render() {
        if (!process.env.BROWSER) { // don't render this page on the server
            return <div className="row">
                <div className="column">
                    {translate('loading')}...
                </div>
            </div>;
        }

        const {
            name, password_valid, //showPasswordString,
            name_error, server_error, loading, cryptographyFailure, showRules
        } = this.state;

        const {loggedIn, logout, offchainUser, serverBusy} = this.props;
        const submit_btn_disabled =
            loading || !name || !password_valid ||
            name_error;
        const submit_btn_class = 'button action' + (submit_btn_disabled ? ' disabled' : '');

        if (serverBusy || $STM_Config.disable_signups) {
            return <div className="row">
                <div className="column">
                    <div className="callout alert">
                        <p>{translate('membership_invitation_only')}</p>
                    </div>
                </div>
            </div>;
        }
        if (cryptographyFailure) {
            return <div className="row">
                <div className="column">
                    <div className="callout alert">
                        <h4>{translate('ctyptography_test_failed')}</h4>
                        <p>{translate('we_will_be_unable_to_create_account_with_this_browser')}.</p>
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
        if (!offchainUser) {
            return <SignUp />;
        }

        if (loggedIn) {
            return <div className="row">
                <div className="column">
                    <div className="callout alert">
                        <p>{translate('you_need_to_logout_before_creating_account', { logoutLink: <a href="#" onClick={logout}>{translate('logout')}</a>})}.</p>
                        <p>{translate('steemit_can_only_register_one_account_per_verified_user')}.</p>
                    </div>
                </div>
            </div>;
        }

        const existingUserAccount = offchainUser.get('account');
        if (existingUserAccount) {
            return <div className="row">
                <div className="column">
                    <div className="callout alert">
                        <p>{translate('our_records_indicate_you_already_have_account')}: <strong>{existingUserAccount}</strong></p>
                        <p>{translate('to_prevent_abuse_APP_NAME_can_only_register_one_account_per_user', {amount: localizedCurrency(3)})}</p>
                        <p>
                            {translate('you_can_either') + ' '}
                            <a href="/login.html">{translate('login')}</a>
                            {translate('to_your_existing_account_or') + ' '}
                            <a href={"mailto:" + SUPPORT_EMAIL}>{translate('send_us_email')}</a>
                            {' ' + translate('if_you_need_a_new_account')}.
                        </p>
                    </div>
                </div>
            </div>;
        }

        let next_step = null;
        if (server_error) {
            if (server_error === 'Email address is not confirmed') {
                next_step = <div className="callout alert">
                    <a href="/enter_email">{translate('confirm_email')}</a>
                </div>;
            } else if (server_error === 'Phone number is not confirmed') {
                next_step = <div className="callout alert">
                    <a href="/enter_mobile">Please verify your phone number</a>
                </div>;
            } else {
                next_step = <div className="callout alert">
                    <h5>{translate('couldnt_create_account_server_returned_error')}:</h5>
                    <p>{server_error}</p>
                </div>;
            }
        }

        // 'goddamn syntax highlighting
        return (
            <div>
                <SignupProgressBar steps={[translate('email'), translate('phone'), translate('golos_account')]} current={3} />
                <div className="CreateAccount row">
                    <div className="column" style={{maxWidth: '36rem', margin: '0 auto'}}>
                        <br />
                        {/* currently translateHtml() does not work, using <FormattedHTMLMessage /> instead */}
                        {showRules ? <div className="CreateAccount__rules">
                            <p>
                                <FormattedHTMLMessage id="the_rules_of_APP_NAME" />
                            </p>
                            <div>
                                <a className="CreateAccount__rules-button" href="#" onClick={() => this.setState({showRules: false})}>
                                    <span style={{display: 'inline-block', transform: 'rotate(-90deg)'}}>&raquo;</span>
                                </a>
                            </div>
                            <hr />
                        </div> : <div className="text-center">
                            <a className="CreateAccount__rules-button" href="#" onClick={() => this.setState({showRules: true})}>{translate('show_rules')}&nbsp; &raquo;</a>
                        </div>}
                        <form onSubmit={this.onSubmit} autoComplete="off" noValidate method="post">
                            <div className={name_error ? 'error' : ''}>
                                <label>{translate('username').toUpperCase()}
                                    <input type="text" name="name" autoComplete="off" onChange={this.onNameChange} value={name} />
                                </label>
                                <p>{name_error}</p>
                            </div>
                            <GeneratedPasswordInput onChange={this.onPasswordChange} disabled={loading} showPasswordString={name.length > 0 && !name_error} />
                            <br />
                            {next_step && <div>{next_step}<br /></div>}
                            <noscript>
                                <div className="callout alert">
                                    <p>{translate('form_requires_javascript_to_be_enabled')}</p>
                                </div>
                            </noscript>
                            {loading && <LoadingIndicator type="circle" />}
                            <input disabled={submit_btn_disabled} type="submit" className={submit_btn_class} value={translate('sign_up')} />
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
            logout: e => {
                if (e) e.preventDefault();
                dispatch(user.actions.logout())
            }
        })
    )(CreateAccount)
};
