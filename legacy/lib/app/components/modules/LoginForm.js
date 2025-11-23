'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _class, _temp; /* eslint-disable import/newline-after-import */
/* eslint-disable import/first */
/* eslint-disable no-useless-escape */
/* eslint-disable react/jsx-boolean-value */
/* eslint-disable class-methods-use-this */
/* eslint-disable react/no-string-refs */
/* eslint-disable arrow-parens */
/* eslint-disable no-undef */
/* eslint react/prop-types: 0 */


var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _immutable = require('immutable');

var _TransactionReducer = require('app/redux/TransactionReducer');

var transactionActions = _interopRequireWildcard(_TransactionReducer);

var _GlobalReducer = require('app/redux/GlobalReducer');

var globalActions = _interopRequireWildcard(_GlobalReducer);

var _UserReducer = require('app/redux/UserReducer');

var userActions = _interopRequireWildcard(_UserReducer);

var _ChainValidation = require('app/utils/ChainValidation');

var _SteemKeychain = require('app/utils/SteemKeychain');

var _BrowserTests = require('app/utils/BrowserTests');

var _BrowserTests2 = _interopRequireDefault(_BrowserTests);

var _shouldComponentUpdate = require('app/utils/shouldComponentUpdate');

var _shouldComponentUpdate2 = _interopRequireDefault(_shouldComponentUpdate);

var _ReactForm = require('app/utils/ReactForm');

var _ReactForm2 = _interopRequireDefault(_ReactForm);

var _ServerApiClient = require('app/utils/ServerApiClient');

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _client_config = require('app/client_config');

var _ecc = require('@steemit/steem-js/lib/auth/ecc');

var _constants = require('shared/constants');

var _PdfDownload = require('app/components/elements/PdfDownload');

var _PdfDownload2 = _interopRequireDefault(_PdfDownload);

var _reactRedux = require('react-redux');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LoginForm = (_temp = _class = function (_Component) {
    (0, _inherits3.default)(LoginForm, _Component);

    function LoginForm(props) {
        (0, _classCallCheck3.default)(this, LoginForm);

        var _this = (0, _possibleConstructorReturn3.default)(this, (LoginForm.__proto__ || (0, _getPrototypeOf2.default)(LoginForm)).call(this));

        _this.shouldComponentUpdate = (0, _shouldComponentUpdate2.default)(_this, 'LoginForm');

        _this.useKeychainToggle = function () {
            var useKeychain = _this.state.useKeychain;

            useKeychain.props.onChange(!useKeychain.value);
        };

        _this.saveLoginToggle = function () {
            var saveLogin = _this.state.saveLogin;

            saveLoginDefault = !saveLoginDefault;
            localStorage.setItem('saveLogin', saveLoginDefault ? 'yes' : 'no');
            saveLogin.props.onChange(saveLoginDefault); // change UI
        };

        var cryptoTestResult = (0, _BrowserTests2.default)();
        var cryptographyFailure = false;
        _this.SignUp = _this.SignUp.bind(_this);
        if (cryptoTestResult !== undefined) {
            console.error('CreateAccount - cryptoTestResult: ', cryptoTestResult);
            cryptographyFailure = true;
        }
        _this.state = { cryptographyFailure: cryptographyFailure };
        _this.usernameOnChange = function (e) {
            var value = e.target.value.toLowerCase();
            _this.state.username.props.onChange(value);
        };
        _this.onCancel = function (e) {
            if (e.preventDefault) e.preventDefault();
            var _this$props = _this.props,
                onCancel = _this$props.onCancel,
                loginBroadcastOperation = _this$props.loginBroadcastOperation;

            var errorCallback = loginBroadcastOperation && loginBroadcastOperation.get('errorCallback');
            if (errorCallback) errorCallback('Canceled');
            if (onCancel) onCancel();
        };
        _this.qrReader = function () {
            var qrReader = props.qrReader;
            var password = _this.state.password;

            qrReader(function (data) {
                password.props.onChange(data);
            });
        };
        _this.initForm(props);
        return _this;
    }

    (0, _createClass3.default)(LoginForm, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            if (this.refs.username && !this.refs.username.value) this.refs.username.focus();
            if (this.refs.username && this.refs.username.value) this.refs.pw.focus();
        }
    }, {
        key: 'handleSignup',
        value: function handleSignup() {
            var routeTag = this.props.routeTag;

            if (!routeTag) return;
            var signupUrl = routeTag ? _constants.SIGNUP_URL + '/#source=condenser|' + routeTag.routeTag : _constants.SIGNUP_URL;
            var new_window = window.open();
            new_window.opener = null;
            new_window.location = signupUrl;
        }
    }, {
        key: 'initForm',
        value: function initForm(props) {
            (0, _ReactForm2.default)({
                name: 'login',
                instance: this,
                fields: ['username', 'password', 'saveLogin:checked', 'useKeychain:checked'],
                initialValues: props.initialValues,
                validation: function validation(values) {
                    return {
                        username: !values.username ? (0, _counterpart2.default)('g.required') : (0, _ChainValidation.validate_account_name)(values.username.split('/')[0]),
                        password: values.useKeychain ? null : !values.password ? (0, _counterpart2.default)('g.required') : _ecc.PublicKey.fromString(values.password) ? (0, _counterpart2.default)('loginform_jsx.you_need_a_private_password_or_key') : null
                    };
                }
            });
        }
    }, {
        key: 'SignUp',
        value: function SignUp() {
            var onType = document.getElementsByClassName('OpAction')[0].textContent;
            (0, _ServerApiClient.serverApiRecordEvent)('FreeMoneySignUp', onType);
            this.handleSignup();
            // window.location.href = SIGNUP_URL;
        }
    }, {
        key: 'render',
        value: function render() {
            if (!process.env.BROWSER) {
                return _react2.default.createElement(
                    'div',
                    { className: 'row' },
                    _react2.default.createElement(
                        'div',
                        { className: 'column' },
                        _react2.default.createElement(
                            'p',
                            null,
                            'loading',
                            '...'
                        )
                    )
                );
            }
            if (this.state.cryptographyFailure) {
                return _react2.default.createElement(
                    'div',
                    { className: 'row' },
                    _react2.default.createElement(
                        'div',
                        { className: 'column' },
                        _react2.default.createElement(
                            'div',
                            { className: 'callout alert' },
                            _react2.default.createElement(
                                'h4',
                                null,
                                (0, _counterpart2.default)('loginform_jsx.cryptography_test_failed')
                            ),
                            _react2.default.createElement(
                                'p',
                                null,
                                (0, _counterpart2.default)('loginform_jsx.unable_to_log_you_in')
                            ),
                            _react2.default.createElement(
                                'p',
                                null,
                                (0, _counterpart2.default)('loginform_jsx.the_latest_versions_of'),
                                ' ',
                                _react2.default.createElement(
                                    'a',
                                    { href: 'https://www.google.com/chrome/' },
                                    'Chrome'
                                ),
                                ' ',
                                (0, _counterpart2.default)('g.and'),
                                ' ',
                                _react2.default.createElement(
                                    'a',
                                    { href: 'https://www.mozilla.org/en-US/firefox/new/' },
                                    'Firefox'
                                ),
                                ' ',
                                (0, _counterpart2.default)('loginform_jsx.are_well_tested_and_known_to_work_with', { APP_URL: _client_config.APP_URL })
                            )
                        )
                    )
                );
            }

            if ($STM_Config.read_only_mode) {
                return _react2.default.createElement(
                    'div',
                    { className: 'row' },
                    _react2.default.createElement(
                        'div',
                        { className: 'column' },
                        _react2.default.createElement(
                            'div',
                            { className: 'callout alert' },
                            _react2.default.createElement(
                                'p',
                                null,
                                (0, _counterpart2.default)('loginform_jsx.due_to_server_maintenance')
                            )
                        )
                    )
                );
            }

            var _props = this.props,
                walletUrl = _props.walletUrl,
                showLoginWarning = _props.showLoginWarning,
                loginBroadcastOperation = _props.loginBroadcastOperation,
                dispatchSubmit = _props.dispatchSubmit,
                reallySubmit = _props.reallySubmit,
                hideWarning = _props.hideWarning,
                afterLoginRedirectToWelcome = _props.afterLoginRedirectToWelcome,
                msg = _props.msg;
            var _state = this.state,
                username = _state.username,
                password = _state.password,
                useKeychain = _state.useKeychain,
                saveLogin = _state.saveLogin;
            var _state$login = this.state.login,
                submitting = _state$login.submitting,
                valid = _state$login.valid,
                handleSubmit = _state$login.handleSubmit;
            var usernameOnChange = this.usernameOnChange,
                onCancel = this.onCancel;

            var disabled = submitting || !valid;
            var opType = loginBroadcastOperation ? loginBroadcastOperation.get('type') : null;
            var postType = '';
            if (opType === 'vote') {
                postType = (0, _counterpart2.default)('loginform_jsx.login_to_vote');
            } else if (opType === 'custom_json' && loginBroadcastOperation.getIn(['operation', 'id']) === 'follow') {
                postType = (0, _counterpart2.default)('loginform_jsx.login_to_reblog');
            } else if (loginBroadcastOperation) {
                // check for post or comment in operation
                postType = loginBroadcastOperation.getIn(['operation', 'title']) ? (0, _counterpart2.default)('loginform_jsx.login_to_post') : (0, _counterpart2.default)('g.confirm_password');
            }
            var title = postType ? postType : (0, _counterpart2.default)('g.login');
            var authType = /^vote|comment|custom_json/.test(opType) ? (0, _counterpart2.default)('loginform_jsx.posting') : (0, _counterpart2.default)('loginform_jsx.active_or_owner');
            var submitLabel = showLoginWarning ? (0, _counterpart2.default)('loginform_jsx.continue_anyway') : loginBroadcastOperation ? (0, _counterpart2.default)('g.sign_in') : (0, _counterpart2.default)('g.login');
            var error = password.touched && password.error ? password.error : this.props.loginError;
            if (error === 'owner_login_blocked') {
                error = _react2.default.createElement(
                    'span',
                    null,
                    (0, _counterpart2.default)('loginform_jsx.this_password_is_bound_to_your_account_owner_key'),
                    ' ',
                    (0, _counterpart2.default)('loginform_jsx.however_you_can_use_it_to'),
                    (0, _counterpart2.default)('loginform_jsx.update_your_password'),
                    ' ',
                    (0, _counterpart2.default)('loginform_jsx.to_obtain_a_more_secure_set_of_keys')
                );
            } else if (error === 'active_login_blocked') {
                error = _react2.default.createElement(
                    'span',
                    null,
                    (0, _counterpart2.default)('loginform_jsx.this_password_is_bound_to_your_account_active_key')
                );
            }
            var message = null;
            if (msg) {
                if (msg === 'accountcreated') {
                    message = _react2.default.createElement(
                        'div',
                        { className: 'callout primary' },
                        _react2.default.createElement(
                            'p',
                            null,
                            (0, _counterpart2.default)('loginform_jsx.you_account_has_been_successfully_created')
                        )
                    );
                } else if (msg === 'passwordupdated') {
                    message = _react2.default.createElement(
                        'div',
                        { className: 'callout primary' },
                        _react2.default.createElement(
                            'p',
                            null,
                            (0, _counterpart2.default)('loginform_jsx.password_update_succes', {
                                accountName: username.value
                            })
                        )
                    );
                }
            }
            var password_info = !useKeychain.value && checkPasswordChecksum(password.value) === false ? (0, _counterpart2.default)('loginform_jsx.password_info') : null;
            var titleText = _react2.default.createElement(
                'h3',
                null,
                _react2.default.createElement(
                    'span',
                    { className: 'OpAction' },
                    title
                )
            );

            var signupLink = _react2.default.createElement(
                'div',
                { className: 'sign-up' },
                _react2.default.createElement('hr', null),
                _react2.default.createElement(
                    'p',
                    null,
                    (0, _counterpart2.default)('loginform_jsx.join_our'),
                    ' ',
                    _react2.default.createElement(
                        'em',
                        null,
                        (0, _counterpart2.default)('loginform_jsx.amazing_community')
                    ),
                    (0, _counterpart2.default)('loginform_jsx.to_comment_and_reward_others')
                ),
                _react2.default.createElement(
                    'button',
                    {
                        type: 'button',
                        className: 'button hollow',
                        onClick: this.SignUp
                    },
                    (0, _counterpart2.default)('loginform_jsx.sign_up_get_steem')
                )
            );

            var form = _react2.default.createElement(
                'form',
                {
                    onSubmit: handleSubmit(function (_ref) {
                        var data = _ref.data;

                        // bind redux-form to react-redux
                        console.log('Login\tdispatchSubmit');
                        return dispatchSubmit(data, useKeychain.value, loginBroadcastOperation, afterLoginRedirectToWelcome);
                    }),
                    onChange: this.props.clearError,
                    method: 'post'
                },
                _react2.default.createElement(
                    'div',
                    { className: 'input-group' },
                    _react2.default.createElement(
                        'span',
                        { className: 'input-group-label' },
                        '@'
                    ),
                    _react2.default.createElement('input', (0, _extends3.default)({
                        className: 'input-group-field',
                        type: 'text',
                        required: true,
                        placeholder: (0, _counterpart2.default)('loginform_jsx.enter_your_username'),
                        ref: 'username'
                    }, username.props, {
                        onChange: usernameOnChange,
                        autoComplete: 'on',
                        disabled: submitting
                    }))
                ),
                username.touched && username.blur && username.error ? _react2.default.createElement(
                    'div',
                    { className: 'error' },
                    username.error,
                    '\xA0'
                ) : null,
                useKeychain.value ? _react2.default.createElement(
                    'div',
                    null,
                    error && _react2.default.createElement(
                        'div',
                        { className: 'error' },
                        error,
                        '\xA0'
                    )
                ) : _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement('input', (0, _extends3.default)({
                        type: 'password',
                        required: true,
                        ref: 'pw',
                        placeholder: (0, _counterpart2.default)('loginform_jsx.password_or_wif')
                    }, password.props, {
                        autoComplete: 'on',
                        disabled: submitting
                    })),
                    error && _react2.default.createElement(
                        'div',
                        { className: 'error' },
                        error,
                        '\xA0'
                    ),
                    error && password_info && _react2.default.createElement(
                        'div',
                        { className: 'warning' },
                        password_info,
                        '\xA0'
                    )
                ),
                loginBroadcastOperation && _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'div',
                        { className: 'info' },
                        (0, _counterpart2.default)('loginform_jsx.this_operation_requires_your_key_or_master_password', { authType: authType })
                    )
                ),
                (0, _SteemKeychain.hasCompatibleKeychain)() && _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'label',
                        {
                            className: 'LoginForm__save-login',
                            htmlFor: 'useKeychain'
                        },
                        _react2.default.createElement('input', (0, _extends3.default)({
                            id: 'useKeychain',
                            type: 'checkbox',
                            ref: 'pw'
                        }, useKeychain.props, {
                            onChange: this.useKeychainToggle,
                            disabled: submitting
                        })),
                        '\xA0',
                        (0, _counterpart2.default)('loginform_jsx.use_keychain')
                    )
                ),
                _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'label',
                        {
                            className: 'LoginForm__save-login',
                            htmlFor: 'saveLogin'
                        },
                        _react2.default.createElement('input', (0, _extends3.default)({
                            id: 'saveLogin',
                            type: 'checkbox',
                            ref: 'pw'
                        }, saveLogin.props, {
                            onChange: this.saveLoginToggle,
                            disabled: submitting
                        })),
                        '\xA0',
                        (0, _counterpart2.default)('loginform_jsx.keep_me_logged_in')
                    )
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'login-modal-buttons' },
                    _react2.default.createElement(
                        'button',
                        {
                            type: 'submit',
                            disabled: submitting || disabled,
                            className: 'button'
                        },
                        submitLabel
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'register' },
                        _react2.default.createElement(
                            'div',
                            { className: 'register-title' },
                            (0, _counterpart2.default)('loginform_jsx.not_a_steemit_user')
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'register-link' },
                            _react2.default.createElement(
                                'a',
                                { onClick: this.handleSignup },
                                (0, _counterpart2.default)('loginform_jsx.free_register')
                            )
                        )
                    )
                )
            );

            var loginWarningTitleText = _react2.default.createElement(
                'h3',
                null,
                (0, _counterpart2.default)('loginform_jsx.login_warning_title')
            );

            var loginWarningForm = _react2.default.createElement(
                'form',
                {
                    onSubmit: handleSubmit(function () {
                        console.log('Login\treallySubmit');
                        var data = {
                            username: username.value,
                            password: password.value,
                            saveLogin: saveLogin.value,
                            loginBroadcastOperation: loginBroadcastOperation
                        };
                        reallySubmit(data, afterLoginRedirectToWelcome);
                    }),
                    method: 'post'
                },
                _react2.default.createElement(
                    'p',
                    null,
                    (0, _counterpart2.default)('loginform_jsx.login_warning_body')
                ),
                _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(_PdfDownload2.default, {
                        filename: 'Steem keys for @' + username.value,
                        name: username.value,
                        password: password.value,
                        newUser: true,
                        widthInches: 8.5,
                        heightInches: 11.0,
                        label: 'Download a PDF with keys and instructions'
                    }),
                    _react2.default.createElement(
                        'a',
                        {
                            href: walletUrl + '/@' + username.value + '/permissions',
                            target: '_blank'
                        },
                        (0, _counterpart2.default)('loginform_jsx.login_warning_link_text')
                    )
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'login-modal-buttons' },
                    _react2.default.createElement(
                        'button',
                        {
                            type: 'submit',
                            disabled: submitting,
                            className: 'button',
                            onClick: function onClick(e) {
                                e.preventDefault();
                                console.log('Login\thideWarning');
                                hideWarning();
                            }
                        },
                        (0, _counterpart2.default)('g.try_again')
                    )
                )
            );

            return _react2.default.createElement(
                'div',
                { className: 'LoginForm row' },
                _react2.default.createElement(
                    'div',
                    { className: 'column' },
                    message,
                    showLoginWarning ? loginWarningTitleText : titleText,
                    showLoginWarning ? loginWarningForm : form
                )
            );
        }
    }]);
    return LoginForm;
}(_react.Component), _class.propTypes = {
    // Steemit.
    loginError: _propTypes2.default.string,
    onCancel: _propTypes2.default.func
}, _class.defaultProps = {
    afterLoginRedirectToWelcome: false
}, _temp);


var hasError = void 0;
var saveLoginDefault = true;
if (process.env.BROWSER) {
    var s = localStorage.getItem('saveLogin');
    if (s === 'no') saveLoginDefault = false;
}

function urlAccountName() {
    var suggestedAccountName = '';
    var account_match = window.location.hash.match(/account\=([\w\d\-\.]+)/);
    if (account_match && account_match.length > 1) suggestedAccountName = account_match[1];
    return suggestedAccountName;
}

function checkPasswordChecksum(password) {
    // A Steemit generated password is a WIF prefixed with a P ..
    // It is possible to login directly with a WIF
    var wif = /^P/.test(password) ? password.substring(1) : password;

    if (!/^5[HJK].{45,}/i.test(wif)) {
        // 51 is the wif length
        // not even close
        return undefined;
    }

    return _ecc.PrivateKey.isWif(wif);
}

exports.default = (0, _reactRedux.connect)(
// mapStateToProps
function (state) {
    var walletUrl = state.app.get('walletUrl');
    var showLoginWarning = state.user.get('show_login_warning');
    var loginError = state.user.get('login_error');
    var currentUser = state.user.get('current');
    var loginBroadcastOperation = state.user.get('loginBroadcastOperation');
    var initialValues = {
        useKeychain: !!(0, _SteemKeychain.hasCompatibleKeychain)(),
        saveLogin: saveLoginDefault
    };

    // The username input has a value prop, so it should not use initialValues
    var initialUsername = currentUser && currentUser.has('username') ? currentUser.get('username') : urlAccountName();
    var loginDefault = state.user.get('loginDefault');
    if (loginDefault) {
        var _loginDefault$toJS = loginDefault.toJS(),
            username = _loginDefault$toJS.username,
            authType = _loginDefault$toJS.authType;

        if (username && authType) initialValues.username = username + '/' + authType;
    } else if (initialUsername) {
        initialValues.username = initialUsername;
    }
    var offchainUser = state.offchain.get('user');
    if (!initialUsername && offchainUser && offchainUser.get('account')) {
        initialValues.username = offchainUser.get('account');
    }
    var msg = '';
    var msg_match = window.location.hash.match(/msg\=([\w]+)/);
    if (msg_match && msg_match.length > 1) msg = msg_match[1];
    hasError = !!loginError;
    return {
        walletUrl: walletUrl,
        showLoginWarning: showLoginWarning,
        loginError: loginError,
        loginBroadcastOperation: loginBroadcastOperation,
        initialValues: initialValues,
        initialUsername: initialUsername,
        msg: msg,
        offchain_user: state.offchain.get('user'),
        routeTag: state.app.has('routeTag') ? state.app.get('routeTag') : null
    };
},

// mapDispatchToProps
function (dispatch) {
    return {
        dispatchSubmit: function dispatchSubmit(data, useKeychain, loginBroadcastOperation, afterLoginRedirectToWelcome) {
            var password = data.password,
                saveLogin = data.saveLogin;

            var username = data.username.trim().toLowerCase();
            if (loginBroadcastOperation) {
                var _loginBroadcastOperat = loginBroadcastOperation.toJS(),
                    type = _loginBroadcastOperat.type,
                    operation = _loginBroadcastOperat.operation,
                    successCallback = _loginBroadcastOperat.successCallback,
                    errorCallback = _loginBroadcastOperat.errorCallback;

                dispatch(transactionActions.broadcastOperation({
                    type: type,
                    operation: operation,
                    username: username,
                    password: password,
                    useKeychain: useKeychain,
                    successCallback: successCallback,
                    errorCallback: errorCallback
                }));
                dispatch(userActions.usernamePasswordLogin({
                    username: username,
                    password: password,
                    useKeychain: useKeychain,
                    saveLogin: saveLogin,
                    afterLoginRedirectToWelcome: afterLoginRedirectToWelcome,
                    operationType: type
                }));

                (0, _ServerApiClient.serverApiRecordEvent)('SignIn', type);

                dispatch(userActions.closeLogin());
            } else {
                dispatch(userActions.checkKeyType({
                    username: username,
                    password: password,
                    useKeychain: useKeychain,
                    saveLogin: saveLogin,
                    afterLoginRedirectToWelcome: afterLoginRedirectToWelcome
                }));
            }
        },
        reallySubmit: function reallySubmit(_ref2, afterLoginRedirectToWelcome) {
            var username = _ref2.username,
                password = _ref2.password,
                saveLogin = _ref2.saveLogin,
                loginBroadcastOperation = _ref2.loginBroadcastOperation;

            var _ref3 = loginBroadcastOperation ? loginBroadcastOperation.toJS() : {},
                type = _ref3.type;

            (0, _ServerApiClient.serverApiRecordEvent)('SignIn', type);

            dispatch(userActions.usernamePasswordLogin({
                username: username,
                password: password,
                saveLogin: saveLogin,
                afterLoginRedirectToWelcome: afterLoginRedirectToWelcome
            }));
        },
        hideWarning: function hideWarning() {
            dispatch(userActions.hideLoginWarning());
        },
        clearError: function clearError() {
            if (hasError) dispatch(userActions.loginError({ error: null }));
        },
        qrReader: function qrReader(dataCallback) {
            dispatch(globalActions.showDialog({
                name: 'qr_reader',
                params: { handleScan: dataCallback }
            }));
        }
    };
})(LoginForm);