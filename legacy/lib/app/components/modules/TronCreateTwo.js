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

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _reactRedux = require('react-redux');

var _UserReducer = require('app/redux/UserReducer');

var userActions = _interopRequireWildcard(_UserReducer);

var _PdfDownload = require('app/components/elements/PdfDownload');

var _PdfDownload2 = _interopRequireDefault(_PdfDownload);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        marginTop: '40px',
        width: '100%'
    },
    flowBelow: {
        marginTop: '40px'
    }
};

var TronCreateTwo = function (_Component) {
    (0, _inherits3.default)(TronCreateTwo, _Component);

    function TronCreateTwo() {
        (0, _classCallCheck3.default)(this, TronCreateTwo);

        var _this = (0, _possibleConstructorReturn3.default)(this, (TronCreateTwo.__proto__ || (0, _getPrototypeOf2.default)(TronCreateTwo)).call(this));

        _this.state = {};
        _this.handleSubmit = function (e) {
            e.preventDefault();
            _this.props.hideTronCreateSuccess();
        };
        return _this;
    }

    (0, _createClass3.default)(TronCreateTwo, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                username = _props.username,
                tronAddr = _props.tronAddr,
                tronPrivateKey = _props.tronPrivateKey;

            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'h3',
                        null,
                        (0, _counterpart2.default)('tron_jsx.create_tron_success')
                    )
                ),
                _react2.default.createElement(
                    'div',
                    { style: styles.container },
                    _react2.default.createElement(
                        'div',
                        null,
                        (0, _counterpart2.default)('tron_jsx.create_tron_success_content')
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'tron-account-dl' },
                        _react2.default.createElement(
                            'span',
                            null,
                            (0, _counterpart2.default)('tron_jsx.create_tron_success_content2')
                        ),
                        _react2.default.createElement(_PdfDownload2.default, {
                            filename: 'TRON account for @' + username,
                            name: username,
                            tron_public_key: tronAddr,
                            tron_private_key: tronPrivateKey,
                            newUser: false,
                            widthInches: 8.5,
                            heightInches: 11.0,
                            label: (0, _counterpart2.default)('tron_jsx.update_success_click'),
                            link: true,
                            download: !!tronPrivateKey,
                            style: {
                                marginTop: 0,
                                marginBottom: 0
                            }
                        }),
                        _react2.default.createElement(
                            'span',
                            null,
                            (0, _counterpart2.default)('tron_jsx.create_tron_success_content3')
                        )
                    ),
                    _react2.default.createElement(
                        'div',
                        null,
                        (0, _counterpart2.default)('tron_jsx.update_success_content2')
                    )
                ),
                _react2.default.createElement(
                    'div',
                    { style: styles.flowBelow },
                    _react2.default.createElement(
                        'button',
                        {
                            type: 'submit',
                            className: 'button',
                            onClick: this.handleSubmit
                        },
                        (0, _counterpart2.default)('tron_jsx.safe_save_button')
                    )
                )
            );
        }
    }]);
    return TronCreateTwo;
}(_react.Component);

exports.default = (0, _reactRedux.connect)(
// mapStateToProps
function (state, ownProps) {
    var currentUser = state.user.get('current');
    var tronAddr = currentUser && currentUser.has('tron_addr') ? currentUser.get('tron_addr') : '';
    var username = currentUser && currentUser.has('username') ? currentUser.get('username') : '';
    var tronPrivateKey = currentUser && currentUser.has('tron_private_key') ? currentUser.get('tron_private_key') : '';
    return (0, _extends3.default)({}, ownProps, {
        tronAddr: tronAddr,
        username: username,
        tronPrivateKey: tronPrivateKey
    });
}, function (dispatch) {
    return {
        hideTronCreateSuccess: function hideTronCreateSuccess() {
            dispatch(userActions.hideTronCreateSuccess());
        }
    };
})(TronCreateTwo);