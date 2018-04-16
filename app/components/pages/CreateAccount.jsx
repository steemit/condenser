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
import CountryCode from "app/components/elements/CountryCode";
import { APP_DOMAIN, SUPPORT_EMAIL, SMS_SERVICES } from 'app/client_config';
import tt from 'counterpart';
import {api} from 'golos-js';
import SignupProgressBar from 'app/components/elements/SignupProgressBar';
import { successReg } from 'app/utils/Analytics';

class CreateAccount extends React.Component {

    static propTypes = {
        loginUser: React.PropTypes.func.isRequired,
        serverBusy: React.PropTypes.bool
    };

    constructor(props) {
        super(props);
        this.state = {
            fetch_state: {
              checking : false,
              success: false,
              status: '',
              message: ''
            },
            fetchCounter: 0,
            phone: '',
            country: 7,
            name: '',
            email: '',
            password: '',
            password_valid: '',
            name_error: '',
            phone_hint: '',
            phone_error: '',
            server_error: '',
            loading: false,
            cryptographyFailure: false,
            showRules: false,
            showMobileRules: false,
            allBoxChecked: false
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.onCountryChange = this.onCountryChange.bind(this);
        this.onMobileChange = this.onMobileChange.bind(this);
        this.onEmailChange = this.onEmailChange.bind(this);
        this.onNameChange = this.onNameChange.bind(this);
        this.onPasswordChange = this.onPasswordChange.bind(this);
        this.onClickSendCode = this.onClickSendCode.bind(this);
        this.onClickSelectAnotherPhone = this.onClickSelectAnotherPhone.bind(this);
        this.onCheckCode = this.onCheckCode.bind(this);
    }

    timer() {
      const fetchCounter = this.state.fetchCounter + 1;
      if (fetchCounter < 429) { // 3 hours ~ 429 * (11 seconds + SQRT(fetch count))
          this.setState({ fetchCounter });
          this.timeoutId = setTimeout(this.onCheckCode.bind(this), 1000 * Math.ceil(11 + Math.sqrt(fetchCounter)))
      }
    }

    componentDidMount() {
        const cryptoTestResult = runTests();
        if (cryptoTestResult !== undefined) {
            console.error('CreateAccount - cryptoTestResult: ', cryptoTestResult);
            this.setState({cryptographyFailure: true}); // TODO: do not use setState in componentDidMount
        }
        this.onCheckCode();
    }

    componentWillUnmount() {
      clearTimeout(this.timeoutId);
      this.timeoutId = false;
    }

    onSubmit(e) {
        e.preventDefault();
        this.setState({server_error: '', loading: true});
        const {email, name, password, password_valid} = this.state;
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
                email,
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
                    // window.location = '/enter_email';
                }
                this.setState({server_error: res.error || tt('g.unknown'), loading: false});
            } else {
                successReg()
                window.location = `/login.html#account=${name}&msg=accountcreated`;
            }
        }).catch(error => {
            console.error('Caught CreateAccount server error', error);
            this.setState({server_error: (error.message ? error.message : error), loading: false});
        });
    }

    onPasswordChange(password, password_valid, allBoxChecked) {
        this.setState({password, password_valid, allBoxChecked});
    }

    onCountryChange(e) {
      const country = e.target.value.trim().toLowerCase();
      const phone_hint = this.state.phone.length ? tt('createaccount_jsx.will_be_send_to_phone_number') + country + this.state.phone : '';
      this.setState({country, phone_hint});
    }

    onMobileChange(e) {
        const phone = e.target.value.trim().toLowerCase();
        this.validateMobilePhone(phone);
        this.setState({phone});
    }

    validateMobilePhone(value) {
      let phone_error = '';
      let phone_hint = '';
      if (value == null || value.length === 0) {
        phone_error = tt('mobilevalidation_js.not_be_empty');
      }
      else if (!/^[0-9]{1,45}$/.test(value)) {
        phone_error = tt('mobilevalidation_js.have_only_digits');
      }
      else if (value.length < 7) {
        phone_error = tt('mobilevalidation_js.be_longer');
      }

      if (phone_error.length) {
        phone_error = tt('createaccount_jsx.phone_number') + " " + phone_error;
      }
      else {
        phone_hint = tt('createaccount_jsx.will_be_send_to_phone_number') + this.state.country + value;
      }
      this.setState({phone_error, phone_hint});
    }

    updateFetchingState(o) {
      let fetch_state = {
        checking : false,
        success: false,
        status: o.status,
        message: ''
      };
      switch (o.status) {
        case "select_country":
          fetch_state.message = "Please select a country code";
          break;

        case "provide_phone":
          fetch_state.message = "Please provide a phone number";
          break;

        case "already_used":
          fetch_state.message = tt('createaccount_jsx.this_phone_number_has_already_been_used');
          break;

        case "session":
          fetch_state.message = '';
          break;

        case "waiting":
          fetch_state.checking = true;
          fetch_state.message = tt('mobilevalidation_js.waiting_from_you', {code: o.code, phone: SMS_SERVICES[this.state.country] || SMS_SERVICES['default']});
          this.timer();
          break;

        case "done":
          fetch_state.checking = true;
          fetch_state.success = true;
          fetch_state.message = tt('createaccount_jsx.phone_number_has_been_verified');
          break;

        case "attempts_10":
          fetch_state.checking = true;
          fetch_state.message = 'Confirmation was attempted a moment ago. You can try again only in 10 seconds';
          break;

        case "attempts_300":
          fetch_state.checking = true;
          fetch_state.message = 'Confirmation was attempted a moment ago. You can try again only in 5 minutes';
          break;

        case "error":
          fetch_state.message = o.error;
          break;

        default:
          fetch_state.message = tt('g.unknown');
          break;
      }
      this.setState({ fetch_state });
    }

    onClickSelectAnotherPhone(e) {
      clearTimeout(this.timeoutId);
      this.timeoutId = false;
      this.setState({ fetch_state: {checking: false} });
    }

    onClickSendCode(e) {
        const {phone, country} = this.state;

        this.setState({
          fetchCounter: 0,
          fetch_state: {checking: true}
        });

        fetch('/api/v1/send_code', {
          method: 'post',
          mode: 'no-cors',
          credentials: 'same-origin',
          headers: {
              Accept: 'application/json',
              'Content-type': 'application/json'
          },
          body: JSON.stringify({
              csrf: $STM_csrf,
              phone,
              country
            })
        }).then(res => {
          if (res.status !== 200) {
            let suffix = '';
            switch (res.status) {
              case 429:
                suffix = '. Please wait a moment and try again.'
                break;

              default:
                break;
            }
            return {status: "error", error: res.status + " " + res.statusText + suffix}
          }
          return res.json();
        }).then(res => {
          this.updateFetchingState(res)
        }).catch(error => {
          console.error('Caught /send_code server error', error);
          this.updateFetchingState({status: "error", error: error.message ? error.message : error})
        });
    }

    onCheckCode(e) {
      // this.setState({ fetch_state: {checking: true} });

      fetch('/api/v1/check_code', {
        method: 'post',
        mode: 'no-cors',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'Content-type': 'application/json'
        },
        body: JSON.stringify({ csrf: $STM_csrf })
      }).then(res => {
        if (res.status !== 200) {
          return {status: "error", error: res.status + " " + res.statusText}
        }
        return res.json();
      }).then(res => {
        this.updateFetchingState(res)
      }).catch(error => {
        console.error('Caught /send_code server error', error);
        this.updateFetchingState({status: "error", error: error.message ? error.message : error})
      });
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

    onEmailChange(e) {
      const email = e.target.value.trim().toLowerCase();
      this.setState({email});
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
            fetch_state, phone, country, email, name, password_valid, showPasswordString,
            name_error, phone_hint, phone_error, server_error, loading, cryptographyFailure, showRules, showMobileRules, allBoxChecked
        } = this.state;

        const {loggedIn, logout, offchainUser, serverBusy, onClickSendCode} = this.props;
        const submit_btn_disabled =
              loading ||
            ! name ||
              name_error ||
            ! password_valid ||
            ! allBoxChecked ||
            ! password_valid ||
            ! (fetch_state.checking && fetch_state.success);
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
        // if (!offchainUser) {
        //     return <SignUp />;
        // }
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

        const existingUserAccount = offchainUser ? offchainUser.get('account') : null;
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

        let phone_step = null;
        let showMobileForm = fetch_state.status === "waiting" || fetch_state.status === "done" ? false : true;
        if (fetch_state.message) {
          let calloutClass = fetch_state.success ? " success" : " alert";
          if (fetch_state.status === "waiting") {
            calloutClass = '';
            phone_step = <div className={"callout" + calloutClass}>
              {fetch_state.message + " "}
              <p><small>{tt('mobilevalidation_js.you_can_change_your_number') + " "}<a onClick={this.onClickSelectAnotherPhone}>{tt('mobilevalidation_js.select_another_number')}</a>.</small></p>
            </div>;
          }
          else {
            phone_step = <div className={"callout" + calloutClass}>
              {fetch_state.message}
            </div>;
          }
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

        const mobileRules = showMobileRules ? <div className="CreateAccount__rules">
            <p>{tt('createaccount_jsx.mobile_description.one', {APP_NAME: "GOLOS.io"})}</p>
            <p>{tt('createaccount_jsx.mobile_description.second')}</p>
            <div className="text-left">
              <a className="CreateAccount__rules-button" href="#" onClick={() => this.setState({showMobileRules: false})}>
                {tt('g.close')}&nbsp;&uarr;
              </a>
            </div>
            <hr />
          </div> : <div className="text-left"><p>
              <a className="CreateAccount__rules-button" href="#" onClick={() => this.setState({showMobileRules: true})}>{tt('createaccount_jsx.why_send_sms')}&nbsp;&darr;</a>
          </p></div>
        ;

        const passwordRules = showRules ? <div className="CreateAccount__rules">
            <p>
              {tt('g.the_rules_of_APP_NAME.one', {APP_NAME})}<br/>
              {tt('g.the_rules_of_APP_NAME.second', {APP_NAME})}<br/>
              {tt('g.the_rules_of_APP_NAME.third', {APP_NAME})}<br/>
              {tt('g.the_rules_of_APP_NAME.fourth')}<br/>
              {tt('g.the_rules_of_APP_NAME.fifth')}<br/>
              {tt('g.the_rules_of_APP_NAME.sixth')}<br/>
              {tt('g.the_rules_of_APP_NAME.seventh')}
            </p>
            <div className="text-left">
              <a className="CreateAccount__rules-button" href="#" onClick={() => this.setState({showRules: false})}>
                  {tt('g.close')}&nbsp;&uarr;
              </a>
            </div>
            <hr />
          </div> : <div className="text-left"><p>
            <a className="CreateAccount__rules-button" href="#" onClick={() => this.setState({showRules: true})}>{tt('g.show_rules')}&nbsp;&darr;</a>
          </p></div>
        ;

        return (
            <div>
                <div className="CreateAccount row">
                    <div className="column" style={{maxWidth: '36rem', margin: '0 auto'}}>
                        <h2>{tt('g.sign_up')}</h2>
                        <hr />
                        <form onSubmit={this.onSubmit} autoComplete="off" noValidate method="post">
                            {mobileRules}
                            {showMobileForm && <div>
                              <div>
                                <label>
                                  <span style={{color: 'red'}}>*</span> {tt('createaccount_jsx.country_code')}
                                  <CountryCode onChange={this.onCountryChange} disabled={fetch_state.checking} name="country" value={country} />
                                </label><p></p>
                              </div>
                              <div className={(phone_error ? 'error' : '') + (phone_hint ? 'success' : '')}>
                                <label>
                                  <span style={{color: 'red'}}>*</span> {tt('createaccount_jsx.phone_number')} <span style={{color: 'red'}}>{tt('createaccount_jsx.without_country_code')}</span>
                                  <input type="text" name="phone" autoComplete="off" disabled={fetch_state.checking} onChange={this.onMobileChange} value={phone} />
                                </label>
                                <p>{phone_error || phone_hint}</p>
                              </div>
                            </div>}
                            {phone_step}
                            {showMobileForm &&
                              <p><a className={'button holow ' + ( (fetch_state.checking && fetch_state.success) || !phone_hint ? 'disabled' : '')} onClick={!(fetch_state.checking && fetch_state.success) && phone_hint && this.onClickSendCode}>{tt('createaccount_jsx.get_code')}</a></p>
                            }

                            {passwordRules}
                            <div className="success">
                                <label>Email <input type="email" name="email" autoComplete="off" disabled={! (fetch_state.checking && fetch_state.success)} onChange={this.onEmailChange} value={email} /></label>
                                <p></p>
                            </div>
                            <div className={name_error ? 'error' : ''}>
                                <label>{tt('g.username')}
                                    <input type="text" name="name" autoComplete="off" disabled={! (fetch_state.checking && fetch_state.success)} onChange={this.onNameChange} value={name} />
                                </label>
                                <p>{name_error}</p>
                            </div>
                            <GeneratedPasswordInput onChange={this.onPasswordChange} disabled={!(fetch_state.checking && fetch_state.success) || loading} showPasswordString={name.length > 0 && !name_error} />
                            <br />
                            {next_step}
                            <noscript>
                                <div className="callout alert">
                                    <p>{tt('createaccount_jsx.form_requires_javascript_to_be_enabled')}</p>
                                </div>
                            </noscript>
                            {loading && <LoadingIndicator type="circle" />}
                            <input disabled={submit_btn_disabled} type="submit" className={submit_btn_class + ' uppercase'} value={tt('g.sign_up')}/>
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
