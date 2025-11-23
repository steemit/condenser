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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Reveal = require('app/components/elements/Reveal');

var _Reveal2 = _interopRequireDefault(_Reveal);

var _CloseButton = require('app/components/elements/CloseButton');

var _CloseButton2 = _interopRequireDefault(_CloseButton);

var _TimeAgoWrapper = require('app/components/elements/TimeAgoWrapper');

var _TimeAgoWrapper2 = _interopRequireDefault(_TimeAgoWrapper);

var _reactRouter = require('react-router');

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _reactIntl = require('react-intl');

var _reactRedux = require('react-redux');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CheckLoginOwner = function (_React$Component) {
    (0, _inherits3.default)(CheckLoginOwner, _React$Component);

    function CheckLoginOwner() {
        (0, _classCallCheck3.default)(this, CheckLoginOwner);

        var _this = (0, _possibleConstructorReturn3.default)(this, (CheckLoginOwner.__proto__ || (0, _getPrototypeOf2.default)(CheckLoginOwner)).call(this));

        _this.hide = function () {
            var understood = _this.state.understood;

            if (understood) {
                var last_valid_time = _this.state.last_valid_time;

                localStorage[_this.getKey()] = last_valid_time;
            }
            _this.setState({ last_valid_time: null, last_valid_date: null });
        };

        _this.getKey = function () {
            var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _this.props;
            var previous_owner_authority = props.previous_owner_authority;

            var username = previous_owner_authority.get('account');
            var key = username + '_previous_owner_authority_last_valid_time';
            return key;
        };

        _this.recover = function () {
            _this.hide();
            _reactRouter.browserHistory.push('/recover_account_step_1');
        };

        _this.onUnderstood = function (e) {
            var understood = e.target.checked;
            console.log('understood', understood);
            _this.setState({ understood: understood });
        };

        _this.state = {};
        return _this;
    }

    (0, _createClass3.default)(CheckLoginOwner, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var login_owner_pubkey = nextProps.login_owner_pubkey;

            if (login_owner_pubkey && this.props.login_owner_pubkey !== login_owner_pubkey) this.props.lookupPreviousOwnerAuthority();

            var previous_owner_authority = nextProps.previous_owner_authority;

            if (previous_owner_authority && this.props.previous_owner_authority !== previous_owner_authority) {
                var last_valid_time = previous_owner_authority.get('last_valid_time');
                // has this been shown already?
                if (localStorage[this.getKey(nextProps)] !== last_valid_time) {
                    var last_valid_date = void 0;
                    if (!/Z$/.test(last_valid_time)) last_valid_date = last_valid_time + 'Z';
                    last_valid_date = new Date(last_valid_date);

                    this.setState({ last_valid_time: last_valid_time, last_valid_date: last_valid_date });
                }
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _state = this.state,
                last_valid_time = _state.last_valid_time,
                last_valid_date = _state.last_valid_date;

            if (!last_valid_time) return _react2.default.createElement('span', null);
            var THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
            var deadline = last_valid_date.getTime() + THIRTY_DAYS;

            // https://steemit.com/steem/@originate/steem-s-new-alert-after-key-updates-is-excellent-but-here-s-a-quick-update-that-would-make-it-even-better
            // "If you recently reset your password at(timestamp in strftime, example:  Thu, 21 Jul 2016 02:39:19 PST) this alert was most likely prompted by this action, otherwise your immediate attention is needed"
            return _react2.default.createElement(
                'span',
                null,
                _react2.default.createElement(
                    _Reveal2.default,
                    { show: true },
                    _react2.default.createElement(_CloseButton2.default, { onClick: this.hide }),
                    _react2.default.createElement(
                        'h3',
                        null,
                        (0, _counterpart2.default)('g.account_updated')
                    ),
                    _react2.default.createElement(
                        'p',
                        null,
                        _react2.default.createElement(
                            'span',
                            { className: 'warning uppercase' },
                            (0, _counterpart2.default)('g.warning'),
                            ':'
                        ),
                        (0, _counterpart2.default)('checkloginowner_jsx.your_password_permissions_were_reduced'),
                        _react2.default.createElement(_TimeAgoWrapper2.default, { date: last_valid_time }),
                        '.',
                        ' ',
                        (0, _counterpart2.default)('checkloginowner_jsx.if_you_did_not_make_this_change') + ' ',
                        _react2.default.createElement(
                            'a',
                            { onClick: this.recover },
                            (0, _counterpart2.default)('g.recover_your_account')
                        ),
                        '.'
                    ),
                    _react2.default.createElement(
                        'p',
                        null,
                        (0, _counterpart2.default)('checkloginowner_jsx.ownership_changed_on'),
                        ' ',
                        _react2.default.createElement(_reactIntl.FormattedDate, { value: last_valid_date })
                    ),
                    _react2.default.createElement(
                        'p',
                        null,
                        (0, _counterpart2.default)('checkloginowner_jsx.deadline_for_recovery_is'),
                        ' ',
                        _react2.default.createElement(
                            'b',
                            null,
                            _react2.default.createElement(_TimeAgoWrapper2.default, { date: deadline })
                        ),
                        '.'
                    ),
                    _react2.default.createElement(
                        'p',
                        null,
                        _react2.default.createElement('input', { type: 'checkbox', onChange: this.onUnderstood }),
                        '\xA0\xA0',
                        (0, _counterpart2.default)('checkloginowner_jsx.i_understand_dont_show_again')
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'button', onClick: this.hide },
                        (0, _counterpart2.default)('g.ok')
                    )
                )
            );
        }
    }]);
    return CheckLoginOwner;
}(_react2.default.Component); /* eslint react/prop-types: 0 */


exports.default = (0, _reactRedux.connect)(
// mapStateToProps
function (state, ownProps) {
    var current = state.user.get('current');
    var login_owner_pubkey = current && current.get('login_owner_pubkey');
    var previous_owner_authority = current && current.get('previous_owner_authority');
    return (0, _extends3.default)({}, ownProps, {
        login_owner_pubkey: login_owner_pubkey,
        previous_owner_authority: previous_owner_authority
    });
},
// mapDispatchToProps
function (dispatch) {
    return {
        lookupPreviousOwnerAuthority: function lookupPreviousOwnerAuthority() {
            dispatch({
                type: 'user/lookupPreviousOwnerAuthority',
                payload: {}
            });
        }
    };
})(CheckLoginOwner);