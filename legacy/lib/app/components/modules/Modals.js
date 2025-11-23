'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _class, _temp; /* eslint-disable react/style-prop-object */
/* eslint-disable arrow-parens */
/* eslint-disable no-undef */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable no-unused-vars */


var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _CloseButton = require('app/components/elements/CloseButton');

var _CloseButton2 = _interopRequireDefault(_CloseButton);

var _Reveal = require('app/components/elements/Reveal');

var _Reveal2 = _interopRequireDefault(_Reveal);

var _reactNotification = require('react-notification');

var _immutable = require('immutable');

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _UserReducer = require('app/redux/UserReducer');

var userActions = _interopRequireWildcard(_UserReducer);

var _AppReducer = require('app/redux/AppReducer');

var appActions = _interopRequireWildcard(_AppReducer);

var _TransactionReducer = require('app/redux/TransactionReducer');

var transactionActions = _interopRequireWildcard(_TransactionReducer);

var _LoginForm = require('app/components/modules/LoginForm');

var _LoginForm2 = _interopRequireDefault(_LoginForm);

var _ConfirmTransactionForm = require('app/components/modules/ConfirmTransactionForm');

var _ConfirmTransactionForm2 = _interopRequireDefault(_ConfirmTransactionForm);

var _shouldComponentUpdate = require('app/utils/shouldComponentUpdate');

var _shouldComponentUpdate2 = _interopRequireDefault(_shouldComponentUpdate);

var _TermsAgree = require('app/components/modules/TermsAgree');

var _TermsAgree2 = _interopRequireDefault(_TermsAgree);

var _PostAdvancedSettings = require('app/components/modules/PostAdvancedSettings');

var _PostAdvancedSettings2 = _interopRequireDefault(_PostAdvancedSettings);

var _TronCreateOne = require('app/components/modules/TronCreateOne');

var _TronCreateOne2 = _interopRequireDefault(_TronCreateOne);

var _TronCreateTwo = require('app/components/modules/TronCreateTwo');

var _TronCreateTwo2 = _interopRequireDefault(_TronCreateTwo);

var _PostDrafts = require('./PostDrafts');

var _PostDrafts2 = _interopRequireDefault(_PostDrafts);

var _PostTemplates = require('./PostTemplates');

var _PostTemplates2 = _interopRequireDefault(_PostTemplates);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Modals = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(Modals, _React$Component);

    function Modals() {
        (0, _classCallCheck3.default)(this, Modals);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Modals.__proto__ || (0, _getPrototypeOf2.default)(Modals)).call(this));

        _this.shouldComponentUpdate = (0, _shouldComponentUpdate2.default)(_this, 'Modals');
        return _this;
    }

    (0, _createClass3.default)(Modals, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                show_tron_create_modal = _props.show_tron_create_modal,
                show_tron_create_success_modal = _props.show_tron_create_success_modal,
                show_login_modal = _props.show_login_modal,
                show_confirm_modal = _props.show_confirm_modal,
                show_bandwidth_error_modal = _props.show_bandwidth_error_modal,
                show_post_advanced_settings_modal = _props.show_post_advanced_settings_modal,
                show_post_drafts_modal = _props.show_post_drafts_modal,
                on_post_drafts_close_modal = _props.on_post_drafts_close_modal,
                clear_draft_modal = _props.clear_draft_modal,
                show_post_templates_modal = _props.show_post_templates_modal,
                on_post_templates_close_modal = _props.on_post_templates_close_modal,
                hideLogin = _props.hideLogin,
                hideConfirm = _props.hideConfirm,
                show_terms_modal = _props.show_terms_modal,
                notifications = _props.notifications,
                removeNotification = _props.removeNotification,
                hidePromotePost = _props.hidePromotePost,
                show_promote_post_modal = _props.show_promote_post_modal,
                hideBandwidthError = _props.hideBandwidthError,
                hidePostAdvancedSettings = _props.hidePostAdvancedSettings,
                hidePostDrafts = _props.hidePostDrafts,
                hidePostTemplates = _props.hidePostTemplates,
                username = _props.username,
                loginBroadcastOperation = _props.loginBroadcastOperation,
                hideTronCreate = _props.hideTronCreate,
                hideTronCreateSuccess = _props.hideTronCreateSuccess;


            var notifications_array = notifications ? notifications.toArray().map(function (n) {
                n.onClick = function () {
                    return removeNotification(n.key);
                };
                return n;
            }) : [];

            var buySteemPower = function buySteemPower(e) {
                if (e && e.preventDefault) e.preventDefault();
                var new_window = window.open();
                new_window.opener = null;
                new_window.location = 'https://poloniex.com/exchange#trx_steem';
            };
            return _react2.default.createElement(
                'div',
                null,
                show_tron_create_modal && _react2.default.createElement(
                    _Reveal2.default,
                    {
                        onHide: function onHide() {
                            if (_this2.props.loading === false) hideTronCreate();
                        },
                        show: show_tron_create_modal
                    },
                    _react2.default.createElement(_CloseButton2.default, { onClick: hideTronCreate }),
                    _react2.default.createElement(_TronCreateOne2.default, null)
                ),
                show_tron_create_success_modal && _react2.default.createElement(
                    _Reveal2.default,
                    {
                        onHide: function onHide() {
                            if (_this2.props.loading === false) hideTronCreateSuccess();
                        },
                        show: show_tron_create_success_modal
                    },
                    _react2.default.createElement(_CloseButton2.default, { onClick: hideTronCreateSuccess }),
                    _react2.default.createElement(_TronCreateTwo2.default, null)
                ),
                show_login_modal && _react2.default.createElement(
                    _Reveal2.default,
                    {
                        onHide: function onHide() {
                            hideLogin();
                        },
                        show: show_login_modal
                    },
                    _react2.default.createElement(_CloseButton2.default, { onClick: function onClick() {
                            return hideLogin();
                        } }),
                    _react2.default.createElement(_LoginForm2.default, { onCancel: hideLogin })
                ),
                show_confirm_modal && _react2.default.createElement(
                    _Reveal2.default,
                    { onHide: hideConfirm, show: show_confirm_modal },
                    _react2.default.createElement(_CloseButton2.default, { onClick: hideConfirm }),
                    _react2.default.createElement(_ConfirmTransactionForm2.default, { onCancel: hideConfirm })
                ),
                show_terms_modal && _react2.default.createElement(
                    _Reveal2.default,
                    { show: show_terms_modal },
                    _react2.default.createElement(_TermsAgree2.default, { onCancel: hideLogin })
                ),
                show_bandwidth_error_modal && _react2.default.createElement(
                    _Reveal2.default,
                    {
                        onHide: hideBandwidthError,
                        show: show_bandwidth_error_modal
                    },
                    _react2.default.createElement(
                        'div',
                        null,
                        _react2.default.createElement(_CloseButton2.default, { onClick: hideBandwidthError }),
                        _react2.default.createElement(
                            'h4',
                            null,
                            (0, _counterpart2.default)('modals_jsx.your_transaction_failed')
                        ),
                        _react2.default.createElement('hr', null),
                        _react2.default.createElement(
                            'h5',
                            null,
                            (0, _counterpart2.default)('modals_jsx.out_of_bandwidth_title')
                        ),
                        _react2.default.createElement(
                            'p',
                            null,
                            (0, _counterpart2.default)('modals_jsx.out_of_bandwidth_reason')
                        ),
                        _react2.default.createElement(
                            'p',
                            null,
                            (0, _counterpart2.default)('modals_jsx.out_of_bandwidth_reason_2')
                        ),
                        _react2.default.createElement(
                            'p',
                            null,
                            (0, _counterpart2.default)('modals_jsx.out_of_bandwidth_option_title')
                        ),
                        _react2.default.createElement(
                            'ol',
                            null,
                            _react2.default.createElement(
                                'li',
                                null,
                                (0, _counterpart2.default)('modals_jsx.out_of_bandwidth_option_4')
                            ),
                            _react2.default.createElement(
                                'li',
                                null,
                                (0, _counterpart2.default)('modals_jsx.out_of_bandwidth_option_1')
                            ),
                            _react2.default.createElement(
                                'li',
                                null,
                                (0, _counterpart2.default)('modals_jsx.out_of_bandwidth_option_2')
                            ),
                            _react2.default.createElement(
                                'li',
                                null,
                                (0, _counterpart2.default)('modals_jsx.out_of_bandwidth_option_3')
                            )
                        ),
                        _react2.default.createElement(
                            'button',
                            { className: 'button', onClick: buySteemPower },
                            (0, _counterpart2.default)('g.buy_steem_power')
                        )
                    )
                ),
                show_post_advanced_settings_modal && _react2.default.createElement(
                    _Reveal2.default,
                    {
                        onHide: hidePostAdvancedSettings,
                        show: show_post_advanced_settings_modal ? true : false
                    },
                    _react2.default.createElement(_CloseButton2.default, { onClick: hidePostAdvancedSettings }),
                    _react2.default.createElement(_PostAdvancedSettings2.default, {
                        formId: show_post_advanced_settings_modal
                    })
                ),
                show_post_drafts_modal && _react2.default.createElement(
                    _Reveal2.default,
                    {
                        onHide: hidePostDrafts,
                        show: show_post_drafts_modal ? true : false
                    },
                    _react2.default.createElement(_CloseButton2.default, { onClick: hidePostDrafts }),
                    _react2.default.createElement(_PostDrafts2.default, {
                        formId: show_post_drafts_modal,
                        onDraftsClose: on_post_drafts_close_modal,
                        clearDraft: clear_draft_modal
                    })
                ),
                show_post_templates_modal && _react2.default.createElement(
                    _Reveal2.default,
                    {
                        onHide: hidePostTemplates,
                        show: show_post_templates_modal ? true : false
                    },
                    _react2.default.createElement(_CloseButton2.default, { onClick: hidePostTemplates }),
                    _react2.default.createElement(_PostTemplates2.default, {
                        formId: show_post_templates_modal,
                        onTemplatesClose: on_post_templates_close_modal
                    })
                ),
                _react2.default.createElement(_reactNotification.NotificationStack, {
                    style: false,
                    notifications: notifications_array,
                    onDismiss: function onDismiss(n) {
                        return removeNotification(n.key);
                    }
                })
            );
        }
    }]);
    return Modals;
}(_react2.default.Component), _class.propTypes = {
    show_tron_create_modal: _propTypes2.default.bool,
    show_tron_create_success_modal: _propTypes2.default.bool,
    show_login_modal: _propTypes2.default.bool,
    show_confirm_modal: _propTypes2.default.bool,
    show_bandwidth_error_modal: _propTypes2.default.bool,
    show_promote_post_modal: _propTypes2.default.bool,
    show_post_advanced_settings_modal: _propTypes2.default.string,
    show_post_drafts_modal: _propTypes2.default.string,
    on_post_drafts_close_modal: _propTypes2.default.func,
    clear_draft_modal: _propTypes2.default.func,
    show_post_templates_modal: _propTypes2.default.string,
    on_post_templates_close_modal: _propTypes2.default.func,
    hideLogin: _propTypes2.default.func.isRequired,
    username: _propTypes2.default.string,
    hideConfirm: _propTypes2.default.func.isRequired,
    hidePromotePost: _propTypes2.default.func.isRequired,
    hideBandwidthError: _propTypes2.default.func.isRequired,
    hidePostAdvancedSettings: _propTypes2.default.func.isRequired,
    hidePostDrafts: _propTypes2.default.func.isRequired,
    hidePostTemplates: _propTypes2.default.func.isRequired,
    notifications: _propTypes2.default.object,
    show_terms_modal: _propTypes2.default.bool,
    removeNotification: _propTypes2.default.func,
    loginBroadcastOperation: _propTypes2.default.shape({
        type: _propTypes2.default.string,
        username: _propTypes2.default.string,
        successCallback: _propTypes2.default.func,
        errorCallback: _propTypes2.default.func
    }),
    loading: _propTypes2.default.bool
}, _class.defaultProps = {
    username: '',
    notifications: undefined,
    removeNotification: function removeNotification() {},
    show_terms_modal: false,
    show_promote_post_modal: false,
    show_bandwidth_error_modal: false,
    show_confirm_modal: false,
    show_login_modal: false,
    show_post_advanced_settings_modal: '',
    show_post_drafts_modal: '',
    on_post_drafts_close_modal: function on_post_drafts_close_modal() {},
    clear_draft_modal: function clear_draft_modal() {},
    show_post_templates_modal: '',
    on_post_templates_close_modal: function on_post_templates_close_modal() {},
    loginBroadcastOperation: undefined,
    show_tron_create_modal: false,
    show_tron_create_success_modal: false,
    loading: false
}, _temp);
exports.default = (0, _reactRedux.connect)(function (state) {
    var rcErr = state.transaction.getIn(['errors', 'bandwidthError']);
    // get the onErrorCB and call it on cancel
    var show_login_modal = state.user.get('show_login_modal');
    var loginBroadcastOperation = {};
    if (show_login_modal && state.user && state.user.getIn(['loginBroadcastOperation'])) {
        loginBroadcastOperation = state.user.getIn(['loginBroadcastOperation']).toJS();
    }

    return {
        username: state.user.getIn(['current', 'username']),
        show_login_modal: show_login_modal,
        show_confirm_modal: state.transaction.get('show_confirm_modal'),
        show_promote_post_modal: state.user.get('show_promote_post_modal'),
        notifications: state.app.get('notifications'),
        show_terms_modal: state.user.get('show_terms_modal') && state.routing.locationBeforeTransitions.pathname !== '/tos.html' && state.routing.locationBeforeTransitions.pathname !== '/privacy.html',
        show_bandwidth_error_modal: rcErr,
        show_post_advanced_settings_modal: state.user.get('show_post_advanced_settings_modal'),
        show_post_drafts_modal: state.user.get('show_post_drafts_modal'),
        on_post_drafts_close_modal: state.user.get('on_post_drafts_close_modal'),
        clear_draft_modal: state.user.get('clear_draft_modal'),
        show_post_templates_modal: state.user.get('show_post_templates_modal'),
        on_post_templates_close_modal: state.user.get('on_post_templates_close_modal'),
        loginBroadcastOperation: loginBroadcastOperation,
        show_tron_create_modal: state.user.get('show_tron_create_modal'),
        show_tron_create_success_modal: state.user.get('show_tron_create_success_modal'),
        loading: state.app.get('modalLoading')
    };
}, function (dispatch) {
    return {
        hideTronCreate: function hideTronCreate(e) {
            if (e) e.preventDefault();
            dispatch(userActions.hideTronCreate());
        },
        hideTronCreateSuccess: function hideTronCreateSuccess(e) {
            if (e) e.preventDefault();
            dispatch(userActions.hideTronCreateSuccess());
        },
        hideLogin: function hideLogin(e) {
            if (e) e.preventDefault();
            dispatch(userActions.hideLogin());
        },
        hideConfirm: function hideConfirm(e) {
            if (e) e.preventDefault();
            dispatch(transactionActions.hideConfirm());
        },
        hidePromotePost: function hidePromotePost(e) {
            if (e) e.preventDefault();
            dispatch(userActions.hidePromotePost());
        },
        hideBandwidthError: function hideBandwidthError(e) {
            if (e) e.preventDefault();
            dispatch(transactionActions.dismissError({ key: 'bandwidthError' }));
        },
        hidePostAdvancedSettings: function hidePostAdvancedSettings(e) {
            if (e) e.preventDefault();
            dispatch(userActions.hidePostAdvancedSettings());
        },
        hidePostDrafts: function hidePostDrafts(e) {
            if (e) e.preventDefault();
            dispatch(userActions.hidePostDrafts());
        },
        hidePostTemplates: function hidePostTemplates(e) {
            if (e) e.preventDefault();
            dispatch(userActions.hidePostTemplates());
        },
        // example: addNotification: ({key, message}) => dispatch({type: 'ADD_NOTIFICATION', payload: {key, message}}),
        removeNotification: function removeNotification(key) {
            return dispatch(appActions.removeNotification({ key: key }));
        }
    };
})(Modals);