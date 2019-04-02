/* eslint react/prop-types: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import * as transactionActions from 'app/redux/TransactionReducer';
import * as globalActions from 'app/redux/GlobalReducer';
import * as userActions from 'app/redux/UserReducer';
import { validate_account_name } from 'app/utils/ChainValidation';
import runTests from 'app/utils/BrowserTests';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import reactForm from 'app/utils/ReactForm';
import { serverApiRecordEvent } from 'app/utils/ServerApiClient';
import tt from 'counterpart';
import { APP_URL } from 'app/client_config';
import { PrivateKey, PublicKey } from '@steemit/steem-js/lib/auth/ecc';
import { SIGNUP_URL } from 'shared/constants';
import PdfDownload from 'app/components/elements/PdfDownload';

class LoginForm extends Component {
    static propTypes = {
        // Steemit.
        loginError: PropTypes.string,
        onCancel: PropTypes.func,
    };

    static defaultProps = {
        afterLoginRedirectToWelcome: false,
    };

    constructor(props) {
        super();
        const cryptoTestResult = runTests();
        let cryptographyFailure = false;
        this.SignUp = this.SignUp.bind(this);
        if (cryptoTestResult !== undefined) {
            console.error(
                'CreateAccount - cryptoTestResult: ',
                cryptoTestResult
            );
            cryptographyFailure = true;
        }
        this.state = { cryptographyFailure };
        this.usernameOnChange = e => {
            const value = e.target.value.toLowerCase();
            this.state.username.props.onChange(value);
        };
        this.onCancel = e => {
            if (e.preventDefault) e.preventDefault();
            const { onCancel, loginBroadcastOperation } = this.props;
            const errorCallback =
                loginBroadcastOperation &&
                loginBroadcastOperation.get('errorCallback');
            if (errorCallback) errorCallback('Canceled');
            if (onCancel) onCancel();
        };
        this.qrReader = () => {
            const { qrReader } = props;
            const { password } = this.state;
            qrReader(data => {
                password.props.onChange(data);
            });
        };
        this.initForm(props);
    }

    componentDidMount() {
        if (this.refs.username && !this.refs.username.value)
            this.refs.username.focus();
        if (this.refs.username && this.refs.username.value)
            this.refs.pw.focus();
    }

    shouldComponentUpdate = shouldComponentUpdate(this, 'LoginForm');

    initForm(props) {
        reactForm({
            name: 'login',
            instance: this,
            fields: ['username', 'password', 'saveLogin:checked'],
            initialValues: props.initialValues,
            validation: values => ({
                username: !values.username
                    ? tt('g.required')
                    : validate_account_name(values.username.split('/')[0]),
                password: !values.password
                    ? tt('g.required')
                    : PublicKey.fromString(values.password)
                      ? tt('loginform_jsx.you_need_a_private_password_or_key')
                      : null,
            }),
        });
    }

    SignUp() {
        const onType = document.getElementsByClassName('OpAction')[0]
            .textContent;
        serverApiRecordEvent('FreeMoneySignUp', onType);
        window.location.href = SIGNUP_URL;
    }

    saveLoginToggle = () => {
        const { saveLogin } = this.state;
        saveLoginDefault = !saveLoginDefault;
        localStorage.setItem('saveLogin', saveLoginDefault ? 'yes' : 'no');
        saveLogin.props.onChange(saveLoginDefault); // change UI
    };

    render() {
        if (!process.env.BROWSER) {
            return (
                <div className="row">
                    <div className="column">
                        <p>{'loading'}...</p>
                    </div>
                </div>
            );
        }
        if (this.state.cryptographyFailure) {
            return (
                <div className="row">
                    <div className="column">
                        <div className="callout alert">
                            <h4>
                                {tt('loginform_jsx.cryptography_test_failed')}
                            </h4>
                            <p>{tt('loginform_jsx.unable_to_log_you_in')}</p>
                            <p>
                                {tt('loginform_jsx.the_latest_versions_of')}{' '}
                                <a href="https://www.google.com/chrome/">
                                    Chrome
                                </a>{' '}
                                {tt('g.and')}{' '}
                                <a href="https://www.mozilla.org/en-US/firefox/new/">
                                    Firefox
                                </a>{' '}
                                {tt(
                                    'loginform_jsx.are_well_tested_and_known_to_work_with',
                                    { APP_URL }
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        if ($STM_Config.read_only_mode) {
            return (
                <div className="row">
                    <div className="column">
                        <div className="callout alert">
                            <p>
                                {tt('loginform_jsx.due_to_server_maintenance')}
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        const {
            walletUrl,
            showLoginWarning,
            loginBroadcastOperation,
            dispatchSubmit,
            reallySubmit,
            hideWarning,
            afterLoginRedirectToWelcome,
            msg,
        } = this.props;
        const { username, password, saveLogin } = this.state;
        const { submitting, valid, handleSubmit } = this.state.login;
        const { usernameOnChange, onCancel /*qrReader*/ } = this;
        const disabled = submitting || !valid;
        const opType = loginBroadcastOperation
            ? loginBroadcastOperation.get('type')
            : null;
        let postType = '';
        if (opType === 'vote') {
            postType = tt('loginform_jsx.login_to_vote');
        } else if (
            opType === 'custom_json' &&
            loginBroadcastOperation.getIn(['operation', 'id']) === 'follow'
        ) {
            postType = 'Login to Follow Users';
        } else if (loginBroadcastOperation) {
            // check for post or comment in operation
            postType = loginBroadcastOperation.getIn(['operation', 'title'])
                ? tt('loginform_jsx.login_to_post')
                : tt('g.confirm_password');
        }
        const title = postType ? postType : tt('g.login');
        const authType = /^vote|comment/.test(opType)
            ? tt('loginform_jsx.posting')
            : tt('loginform_jsx.active_or_owner');
        const submitLabel = showLoginWarning
            ? tt('loginform_jsx.continue_anyway')
            : loginBroadcastOperation ? tt('g.sign_in') : tt('g.login');
        let error =
            password.touched && password.error
                ? password.error
                : this.props.loginError;
        if (error === 'owner_login_blocked') {
            error = (
                <span>
                    {tt(
                        'loginform_jsx.this_password_is_bound_to_your_account_owner_key'
                    )}{' '}
                    {tt('loginform_jsx.however_you_can_use_it_to')}
                    {tt('loginform_jsx.update_your_password')}{' '}
                    {tt('loginform_jsx.to_obtain_a_more_secure_set_of_keys')}
                </span>
            );
        } else if (error === 'active_login_blocked') {
            error = (
                <span>
                    {tt(
                        'loginform_jsx.this_password_is_bound_to_your_account_active_key'
                    )}
                </span>
            );
        }
        let message = null;
        if (msg) {
            if (msg === 'accountcreated') {
                message = (
                    <div className="callout primary">
                        <p>
                            {tt(
                                'loginform_jsx.you_account_has_been_successfully_created'
                            )}
                        </p>
                    </div>
                );
            } else if (msg === 'passwordupdated') {
                message = (
                    <div className="callout primary">
                        <p>
                            {tt('loginform_jsx.password_update_succes', {
                                accountName: username.value,
                            })}
                        </p>
                    </div>
                );
            }
        }
        const password_info =
            checkPasswordChecksum(password.value) === false
                ? tt('loginform_jsx.password_info')
                : null;

        const titleText = (
            <h3>
                {tt('loginform_jsx.returning_users')}
                <span className="OpAction">{title}</span>
            </h3>
        );

        const signupLink = (
            <div className="sign-up">
                <hr />
                <p>
                    {tt('loginform_jsx.join_our')}{' '}
                    <em>{tt('loginform_jsx.amazing_community')}</em>
                    {tt('loginform_jsx.to_comment_and_reward_others')}
                </p>
                <button
                    type="button"
                    className="button hollow"
                    onClick={this.SignUp}
                >
                    {tt('loginform_jsx.sign_up_get_steem')}
                </button>
            </div>
        );

        const form = (
            <form
                onSubmit={handleSubmit(({ data }) => {
                    // bind redux-form to react-redux
                    console.log('Login\tdispatchSubmit');
                    return dispatchSubmit(
                        data,
                        loginBroadcastOperation,
                        afterLoginRedirectToWelcome
                    );
                })}
                onChange={this.props.clearError}
                method="post"
            >
                <div className="input-group">
                    <span className="input-group-label">@</span>
                    <input
                        className="input-group-field"
                        type="text"
                        required
                        placeholder={tt('loginform_jsx.enter_your_username')}
                        ref="username"
                        {...username.props}
                        onChange={usernameOnChange}
                        autoComplete="on"
                        disabled={submitting}
                    />
                </div>
                {username.touched && username.blur && username.error ? (
                    <div className="error">{username.error}&nbsp;</div>
                ) : null}

                <div>
                    <input
                        type="password"
                        required
                        ref="pw"
                        placeholder={tt('loginform_jsx.password_or_wif')}
                        {...password.props}
                        autoComplete="on"
                        disabled={submitting}
                    />
                    {error && <div className="error">{error}&nbsp;</div>}
                    {error &&
                        password_info && (
                            <div className="warning">{password_info}&nbsp;</div>
                        )}
                </div>
                {loginBroadcastOperation && (
                    <div>
                        <div className="info">
                            {tt(
                                'loginform_jsx.this_operation_requires_your_key_or_master_password',
                                { authType }
                            )}
                        </div>
                    </div>
                )}
                <div>
                    <label
                        className="LoginForm__save-login"
                        htmlFor="saveLogin"
                    >
                        <input
                            id="saveLogin"
                            type="checkbox"
                            ref="pw"
                            {...saveLogin.props}
                            onChange={this.saveLoginToggle}
                            disabled={submitting}
                        />&nbsp;{tt('loginform_jsx.keep_me_logged_in')}
                    </label>
                </div>
                <div className="login-modal-buttons">
                    <br />
                    <button
                        type="submit"
                        disabled={submitting || disabled}
                        className="button"
                    >
                        {submitLabel}
                    </button>
                    {this.props.onCancel && (
                        <button
                            type="button float-right"
                            disabled={submitting}
                            className="button hollow"
                            onClick={onCancel}
                        >
                            {tt('g.cancel')}
                        </button>
                    )}
                </div>
                {signupLink}
            </form>
        );

        const loginWarningTitleText = (
            <h3>{tt('loginform_jsx.login_warning_title')}</h3>
        );

        const loginWarningForm = (
            <form
                onSubmit={handleSubmit(() => {
                    console.log('Login\treallySubmit');
                    const data = {
                        username: username.value,
                        password: password.value,
                        saveLogin: saveLogin.value,
                        loginBroadcastOperation: loginBroadcastOperation,
                    };
                    reallySubmit(data, afterLoginRedirectToWelcome);
                })}
                method="post"
            >
                <p>{tt('loginform_jsx.login_warning_body')}</p>
                <div>
                    <a
                        href={`${walletUrl}/@${username.value}/permissions`}
                        target="_blank"
                    >
                        {tt('loginform_jsx.login_warning_link_text')}
                    </a>
                    <PdfDownload
                        name={username.value}
                        password={password.value}
                        widthInches={8.5}
                        heightInches={11.0}
                        label="Download a PDF with keys and instructions"
                    />
                </div>
                <div className="login-modal-buttons">
                    <br />
                    <button
                        type="submit"
                        disabled={submitting}
                        className="button"
                        onClick={e => {
                            e.preventDefault();
                            console.log('Login\thideWarning');
                            hideWarning();
                        }}
                    >
                        {tt('g.try_again')}
                    </button>
                </div>
            </form>
        );

        return (
            <div className="LoginForm row">
                <div className="column">
                    {message}
                    {showLoginWarning ? loginWarningTitleText : titleText}
                    {showLoginWarning ? loginWarningForm : form}
                </div>
            </div>
        );
    }
}

let hasError;
let saveLoginDefault = true;
if (process.env.BROWSER) {
    const s = localStorage.getItem('saveLogin');
    if (s === 'no') saveLoginDefault = false;
}

function urlAccountName() {
    let suggestedAccountName = '';
    const account_match = window.location.hash.match(/account\=([\w\d\-\.]+)/);
    if (account_match && account_match.length > 1)
        suggestedAccountName = account_match[1];
    return suggestedAccountName;
}

function checkPasswordChecksum(password) {
    // A Steemit generated password is a WIF prefixed with a P ..
    // It is possible to login directly with a WIF
    const wif = /^P/.test(password) ? password.substring(1) : password;

    if (!/^5[HJK].{45,}/i.test(wif)) {
        // 51 is the wif length
        // not even close
        return undefined;
    }

    return PrivateKey.isWif(wif);
}

import { connect } from 'react-redux';
export default connect(
    // mapStateToProps
    state => {
        const walletUrl = state.app.get('walletUrl');
        const showLoginWarning = state.user.get('show_login_warning');
        const loginError = state.user.get('login_error');
        const currentUser = state.user.get('current');
        const loginBroadcastOperation = state.user.get(
            'loginBroadcastOperation'
        );
        const initialValues = {
            saveLogin: saveLoginDefault,
        };

        // The username input has a value prop, so it should not use initialValues
        const initialUsername =
            currentUser && currentUser.has('username')
                ? currentUser.get('username')
                : urlAccountName();
        const loginDefault = state.user.get('loginDefault');
        if (loginDefault) {
            const { username, authType } = loginDefault.toJS();
            if (username && authType)
                initialValues.username = username + '/' + authType;
        } else if (initialUsername) {
            initialValues.username = initialUsername;
        }
        const offchainUser = state.offchain.get('user');
        if (!initialUsername && offchainUser && offchainUser.get('account')) {
            initialValues.username = offchainUser.get('account');
        }
        let msg = '';
        const msg_match = window.location.hash.match(/msg\=([\w]+)/);
        if (msg_match && msg_match.length > 1) msg = msg_match[1];
        hasError = !!loginError;
        return {
            walletUrl,
            showLoginWarning,
            loginError,
            loginBroadcastOperation,
            initialValues,
            initialUsername,
            msg,
            offchain_user: state.offchain.get('user'),
        };
    },

    // mapDispatchToProps
    dispatch => ({
        dispatchSubmit: (
            data,
            loginBroadcastOperation,
            afterLoginRedirectToWelcome
        ) => {
            const { password, saveLogin } = data;
            const username = data.username.trim().toLowerCase();
            if (loginBroadcastOperation) {
                const {
                    type,
                    operation,
                    successCallback,
                    errorCallback,
                } = loginBroadcastOperation.toJS();
                dispatch(
                    transactionActions.broadcastOperation({
                        type,
                        operation,
                        username,
                        password,
                        successCallback,
                        errorCallback,
                    })
                );
                dispatch(
                    userActions.usernamePasswordLogin({
                        username,
                        password,
                        saveLogin,
                        afterLoginRedirectToWelcome,
                        operationType: type,
                    })
                );

                serverApiRecordEvent('SignIn', type);

                dispatch(userActions.closeLogin());
            } else {
                dispatch(
                    userActions.checkKeyType({
                        username,
                        password,
                        saveLogin,
                        afterLoginRedirectToWelcome,
                    })
                );
            }
        },
        reallySubmit: (
            { username, password, saveLogin, loginBroadcastOperation },
            afterLoginRedirectToWelcome
        ) => {
            const { type } = loginBroadcastOperation
                ? loginBroadcastOperation.toJS()
                : {};

            serverApiRecordEvent('SignIn', type);

            dispatch(
                userActions.usernamePasswordLogin({
                    username,
                    password,
                    saveLogin,
                    afterLoginRedirectToWelcome,
                })
            );
        },
        hideWarning: () => {
            dispatch(userActions.hideLoginWarning());
        },
        clearError: () => {
            if (hasError) dispatch(userActions.loginError({ error: null }));
        },
        qrReader: dataCallback => {
            dispatch(
                globalActions.showDialog({
                    name: 'qr_reader',
                    params: { handleScan: dataCallback },
                })
            );
        },
    })
)(LoginForm);
