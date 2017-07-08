/* eslint react/prop-types: 0 */
import React from 'react';
import { connect } from 'react-redux';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import {PrivateKey} from 'golos-js/lib/auth/ecc';
import user from 'app/redux/User';
import {validate_account_name} from 'app/utils/ChainValidation';
import SignUp from 'app/components/modules/SignUp';
import runTests from 'app/utils/BrowserTests';
import g from 'app/redux/GlobalReducer';
import GeneratedPasswordInput from 'app/components/elements/GeneratedPasswordInput';
import { APP_DOMAIN, SUPPORT_EMAIL } from 'app/client_config';
import tt from 'counterpart';
import {api} from 'golos-js';
import SignupProgressBar from 'app/components/elements/SignupProgressBar';

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
        const cryptoTestResult = runTests();
        if (cryptoTestResult !== undefined) {
            console.error('CreateAccount - cryptoTestResult: ', cryptoTestResult);
            this.setState({cryptographyFailure: true}); // TODO: do not use setState in componentDidMount
        }
        // Facebook Pixel events #200
        //if (process.env.BROWSER) fbq('track', 'Lead');
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
                this.setState({server_error: res.error || tt('g.unknown'), loading: false});
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
                promise = api.getAccountsAsync([name]).then(res => {
                    return res && res.length > 0 ? tt('postfull_jsx.account_name_is_not_available') : '';
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
                    {tt('g.loading')}...
                </div>
            </div>;
        }

        const APP_NAME = tt('g.APP_NAME');

        const {
            name, password_valid, showPasswordString,
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
                        <p>{tt('g.membership_invitation_only', {APP_DOMAIN})}</p>
                    </div>
                </div>
            </div>;
        }
        if (cryptographyFailure) {
            return <div className="row">
                <div className="column">
                    <div className="callout alert">
                        <h4>{tt('createaccount_jsx.ctyptography_test_failed')}</h4>
                        <p>{tt('createaccount_jsx.we_will_be_unable_to_create_account_with_this_browser', {APP_NAME})}.</p>
                        <p>
                            {tt('loginform_jsx.the_latest_versions_of') + ' '}
                            <a href="https://www.google.com/chrome/">Chrome</a>
                            {' ' + tt('g.and')}
                            <a href="https://www.mozilla.org/en-US/firefox/new/">Firefox</a>
                            {' ' + tt('loginform_jsx.are_well_tested_and_known_to_work_with', {APP_DOMAIN})}
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
                        <p>
                          {tt('createaccount_jsx.you_need_to')}
                          <a href="#" onClick={logout}>{tt('g.logout')}</a>
                          {tt('createaccount_jsx.before_creating_account')}
                        </p>
                        <p>
                          {tt('createaccount_jsx.APP_NAME_can_only_register_one_account_per_verified_user', {APP_NAME})}
                        </p>
                    </div>
                </div>
            </div>;
        }

        const existingUserAccount = offchainUser.get('account');
        if (existingUserAccount) {
            return <div className="row">
                <div className="column">
                    <div className="callout alert">
                        <p>{tt('createaccount_jsx.our_records_indicate_you_already_have_account', {APP_NAME})}: <strong>{existingUserAccount}</strong></p>
                        <p>{tt('createaccount_jsx.in_order_to_prevent_abuse_APP_NAME_can_only_register_one_account_per_user', {APP_NAME})}</p>
                        <p>
                            {tt('createaccount_jsx.next_3_blocks.you_can_either') + ' '}
                            <a href="/login.html">{tt('g.login')}</a>
                            {tt('createaccount_jsx.next_3_blocks.to_your_existing_account_or') + ' '}
                            <a href={"mailto:" + SUPPORT_EMAIL}>{tt('createaccount_jsx.send_us_email')}</a>
                            {' ' + tt('createaccount_jsx.next_3_blocks.if_you_need_a_new_account')}.
                        </p>
                    </div>
                </div>
            </div>;
        }

        let next_step = null;
        if (server_error) {
            if (server_error === 'Email address is not confirmed') {
                next_step = <div className="callout alert">
                    <a href="/enter_email">{tt('tips_js.confirm_email')}</a>
                </div>;
            } else if (server_error === 'Phone number is not confirmed') {
                next_step = <div className="callout alert">
                    <a href="/enter_mobile">{tt('tips_js.confirm_phone')}</a>
                </div>;
            } else {
                next_step = <div className="callout alert">
                    <strong>{tt('createaccount_jsx.couldnt_create_account_server_returned_error')}:</strong>
                    <p>{server_error}</p>
                </div>;
            }
        }

        return (
            <div>
                <SignupProgressBar steps={[translate('email'), translate('phone'), translate('golos_account')]} current={3} />
                <div className="CreateAccount row">
                    <div className="column" style={{maxWidth: '36rem', margin: '0 auto'}}>
                        <h2>{tt('g.sign_up')}</h2>
                        <hr />
                        {/* currently translateHtml() does not work, using <FormattedHTMLMessage /> instead */}
                        {showRules ? <div className="CreateAccount__rules">
                            <p>
                                {tt('g.the_rules_of_APP_NAME.one', {APP_NAME})}<br/>
                                {tt('g.the_rules_of_APP_NAME.second', {APP_NAME})}<br/>
                                {tt('g.the_rules_of_APP_NAME.third', {APP_NAME})}<br/>
                                {tt('g.the_rules_of_APP_NAME.fourth')}<br/>
                                {tt('g.the_rules_of_APP_NAME.fifth')}<br/>
                                {tt('g.the_rules_of_APP_NAME.sixth')}<br/>
                                {tt('g.the_rules_of_APP_NAME.seventh')}
                            </p>
                            <div>
                                <a className="CreateAccount__rules-button" href="#" onClick={() => this.setState({showRules: false})}>
                                    <span style={{display: 'inline-block', transform: 'rotate(-90deg)'}}>&raquo;</span>
                                </a>
                            </div>
                            <hr />
                        </div> : <div className="text-center">
                            <a className="CreateAccount__rules-button" href="#" onClick={() => this.setState({showRules: true})}>{tt('g.show_rules')}&nbsp; &raquo;</a>
                        </div>}
                        <form onSubmit={this.onSubmit} autoComplete="off" noValidate method="post">
                            <div className={name_error ? 'error' : ''}>
                                <label className="uppercase">{tt('g.username')}
                                    <input type="text" name="name" autoComplete="off" onChange={this.onNameChange} value={name} />
                                </label>
                                <p>{name_error}</p>
                            </div>
                            <GeneratedPasswordInput onChange={this.onPasswordChange} disabled={loading} showPasswordString={name.length > 0 && !name_error} />
                            <br />
                            {next_step}
                            <noscript>
                                <div className="callout alert">
                                    <p>{tt('createaccount_jsx.form_requires_javascript_to_be_enabled')}</p>
                                </div>
                            </noscript>
                            {loading && <LoadingIndicator type="circle" />}
                            <input disabled={submit_btn_disabled} type="submit" className={submit_btn_class + ' uppercase'} value={tt('g.sign_up')} />
                        </form>
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
