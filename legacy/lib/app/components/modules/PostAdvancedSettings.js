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

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _ReactForm = require('app/utils/ReactForm');

var _ReactForm2 = _interopRequireDefault(_ReactForm);

var _constants = require('shared/constants');

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _immutable = require('immutable');

var _BeneficiarySelector = require('app/components/cards/BeneficiarySelector');

var _BeneficiarySelector2 = _interopRequireDefault(_BeneficiarySelector);

var _UserReducer = require('app/redux/UserReducer');

var userActions = _interopRequireWildcard(_UserReducer);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PostAdvancedSettings = (_temp = _class = function (_Component) {
    (0, _inherits3.default)(PostAdvancedSettings, _Component);

    function PostAdvancedSettings(props) {
        (0, _classCallCheck3.default)(this, PostAdvancedSettings);

        var _this = (0, _possibleConstructorReturn3.default)(this, (PostAdvancedSettings.__proto__ || (0, _getPrototypeOf2.default)(PostAdvancedSettings)).call(this));

        _this.handlePayoutChange = function (event) {
            _this.setState({ payoutType: event.target.value });
        };

        _this.state = { payoutType: props.initialPayoutType };
        _this.initForm(props);
        return _this;
    }

    (0, _createClass3.default)(PostAdvancedSettings, [{
        key: 'initForm',
        value: function initForm(props) {
            var fields = props.fields;

            (0, _ReactForm2.default)({
                fields: fields,
                instance: this,
                name: 'advancedSettings',
                initialValues: props.initialValues,
                validation: function validation(values) {
                    return {
                        beneficiaries: (0, _BeneficiarySelector.validateBeneficiaries)(props.username, values.beneficiaries, false)
                    };
                }
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                formId = _props.formId,
                username = _props.username,
                defaultPayoutType = _props.defaultPayoutType,
                initialPayoutType = _props.initialPayoutType;
            var _state = this.state,
                beneficiaries = _state.beneficiaries,
                payoutType = _state.payoutType;
            var _state$advancedSettin = this.state.advancedSettings,
                submitting = _state$advancedSettin.submitting,
                valid = _state$advancedSettin.valid,
                handleSubmit = _state$advancedSettin.handleSubmit;

            var disabled = submitting || !(valid || payoutType !== initialPayoutType);

            var form = _react2.default.createElement(
                'form',
                {
                    onSubmit: handleSubmit(function (_ref) {
                        var data = _ref.data;

                        var err = (0, _BeneficiarySelector.validateBeneficiaries)(_this2.props.username, data.beneficiaries, true);
                        if (!err) {
                            _this2.props.setPayoutType(formId, payoutType);
                            _this2.props.setBeneficiaries(formId, data.beneficiaries);
                            _this2.props.hideAdvancedSettings();
                        }
                    })
                },
                _react2.default.createElement(
                    'div',
                    { className: 'row' },
                    _react2.default.createElement(
                        'div',
                        { className: 'column' },
                        _react2.default.createElement(
                            'h4',
                            null,
                            (0, _counterpart2.default)('post_advanced_settings_jsx.payout_option_header')
                        ),
                        _react2.default.createElement(
                            'p',
                            null,
                            (0, _counterpart2.default)('post_advanced_settings_jsx.payout_option_description')
                        )
                    )
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'row' },
                    _react2.default.createElement(
                        'div',
                        { className: 'small-12 medium-6 large-12 columns' },
                        _react2.default.createElement(
                            'select',
                            {
                                defaultValue: payoutType,
                                onChange: this.handlePayoutChange
                            },
                            _react2.default.createElement(
                                'option',
                                { value: '0%' },
                                (0, _counterpart2.default)('reply_editor.decline_payout')
                            ),
                            _react2.default.createElement(
                                'option',
                                { value: '50%' },
                                (0, _counterpart2.default)('reply_editor.default_50_50')
                            ),
                            _react2.default.createElement(
                                'option',
                                { value: '100%' },
                                (0, _counterpart2.default)('reply_editor.power_up_100')
                            )
                        )
                    )
                ),
                _react2.default.createElement('br', null),
                _react2.default.createElement(
                    'div',
                    { className: 'row' },
                    _react2.default.createElement(
                        'div',
                        { className: 'column' },
                        (0, _counterpart2.default)('post_advanced_settings_jsx.current_default'),
                        ':',
                        ' ',
                        defaultPayoutType === '0%' ? (0, _counterpart2.default)('reply_editor.decline_payout') : defaultPayoutType === '50%' ? (0, _counterpart2.default)('reply_editor.default_50_50') : (0, _counterpart2.default)('reply_editor.power_up_100')
                    )
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'row' },
                    _react2.default.createElement(
                        'div',
                        { className: 'column' },
                        _react2.default.createElement(
                            'a',
                            { href: '/@' + username + '/settings' },
                            (0, _counterpart2.default)('post_advanced_settings_jsx.update_default_in_settings')
                        )
                    )
                ),
                _react2.default.createElement('br', null),
                _react2.default.createElement(
                    'div',
                    { className: 'row' },
                    _react2.default.createElement(
                        'h4',
                        { className: 'column' },
                        (0, _counterpart2.default)('beneficiary_selector_jsx.header')
                    )
                ),
                _react2.default.createElement(_BeneficiarySelector2.default, (0, _extends3.default)({}, beneficiaries.props, { tabIndex: 1 })),
                _react2.default.createElement(
                    'div',
                    { className: 'error' },
                    (beneficiaries.touched || beneficiaries.value) && beneficiaries.error,
                    '\xA0'
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'row' },
                    _react2.default.createElement(
                        'div',
                        { className: 'column' },
                        _react2.default.createElement(
                            'span',
                            null,
                            _react2.default.createElement(
                                'button',
                                {
                                    type: 'submit',
                                    className: 'button',
                                    disabled: disabled,
                                    tabIndex: 2
                                },
                                (0, _counterpart2.default)('g.save')
                            )
                        )
                    )
                )
            );
            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                    'div',
                    { className: 'row' },
                    _react2.default.createElement(
                        'h3',
                        { className: 'column' },
                        (0, _counterpart2.default)('reply_editor.advanced_settings')
                    )
                ),
                _react2.default.createElement('hr', null),
                form
            );
        }
    }]);
    return PostAdvancedSettings;
}(_react.Component), _class.propTypes = {
    formId: _react2.default.PropTypes.string.isRequired
}, _temp);
exports.default = (0, _reactRedux.connect)(
// mapStateToProps
function (state, ownProps) {
    var formId = ownProps.formId;
    var username = state.user.getIn(['current', 'username']);
    var isStory = formId === _constants.SUBMIT_FORM_ID;
    var defaultPayoutType = state.app.getIn(['user_preferences', isStory ? 'defaultBlogPayout' : 'defaultCommentPayout'], '50%');
    var initialPayoutType = state.user.getIn(['current', 'post', formId, 'payoutType']);
    var beneficiaries = state.user.getIn(['current', 'post', formId, 'beneficiaries']);
    beneficiaries = beneficiaries ? beneficiaries.toJS() : [];
    return (0, _extends3.default)({}, ownProps, {
        fields: ['beneficiaries'],
        defaultPayoutType: defaultPayoutType,
        initialPayoutType: initialPayoutType,
        username: username,
        initialValues: { beneficiaries: beneficiaries }
    });
},

// mapDispatchToProps
function (dispatch) {
    return {
        hideAdvancedSettings: function hideAdvancedSettings() {
            return dispatch(userActions.hidePostAdvancedSettings());
        },
        setPayoutType: function setPayoutType(formId, payoutType) {
            return dispatch(userActions.set({
                key: ['current', 'post', formId, 'payoutType'],
                value: payoutType
            }));
        },
        setBeneficiaries: function setBeneficiaries(formId, beneficiaries) {
            return dispatch(userActions.set({
                key: ['current', 'post', formId, 'beneficiaries'],
                value: (0, _immutable.fromJS)(beneficiaries)
            }));
        }
    };
})(PostAdvancedSettings);