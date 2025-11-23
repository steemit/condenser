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

var _AppReducer = require('app/redux/AppReducer');

var appActions = _interopRequireWildcard(_AppReducer);

var _LoadingIndicator = require('app/components/elements/LoadingIndicator');

var _LoadingIndicator2 = _interopRequireDefault(_LoadingIndicator);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = {
    container: {
        display: 'flex',
        flexDirection: 'row',
        flexFlow: 'row wrap',
        marginTop: '40px'
    },
    flowBelow: {
        marginTop: '40px'
    }
};

var TronCreateOne = function (_Component) {
    (0, _inherits3.default)(TronCreateOne, _Component);

    function TronCreateOne() {
        (0, _classCallCheck3.default)(this, TronCreateOne);

        var _this = (0, _possibleConstructorReturn3.default)(this, (TronCreateOne.__proto__ || (0, _getPrototypeOf2.default)(TronCreateOne)).call(this));

        _this.state = {
            error_msg: '',
            error: false
        };
        _this.handleSubmit = function (e) {
            e.preventDefault();
            _this.props.setTronErrMsg(null);
            _this.props.startLoading();
            _this.props.updateTronAddr();
        };
        return _this;
    }

    (0, _createClass3.default)(TronCreateOne, [{
        key: 'componentWillUpdate',
        value: function componentWillUpdate(nextProps) {
            var tronPrivateKey = nextProps.tronPrivateKey,
                showTronCreateSuccess = nextProps.showTronCreateSuccess,
                hideTronCreate = nextProps.hideTronCreate,
                tronErrMsg = nextProps.tronErrMsg;

            if (tronPrivateKey) {
                this.props.endLoading();
                showTronCreateSuccess();
                hideTronCreate();
            }
            if (tronErrMsg) {
                this.props.endLoading();
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.props.setTronErrMsg(null);
        }
    }, {
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'h3',
                        null,
                        (0, _counterpart2.default)('tron_jsx.create_tron_account')
                    )
                ),
                _react2.default.createElement(
                    'div',
                    { style: styles.container },
                    _react2.default.createElement(
                        'p',
                        null,
                        ' ',
                        (0, _counterpart2.default)('tron_jsx.create_tron_account_content'),
                        ' '
                    ),
                    _react2.default.createElement(
                        'p',
                        null,
                        ' ',
                        (0, _counterpart2.default)('tron_jsx.create_tron_account_content1'),
                        ' '
                    ),
                    _react2.default.createElement(
                        'p',
                        null,
                        ' ',
                        (0, _counterpart2.default)('tron_jsx.create_tron_account_content2'),
                        ' '
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
                            onClick: this.handleSubmit,
                            disabled: this.props.loading
                        },
                        (0, _counterpart2.default)('tron_jsx.create_tron_agree')
                    ),
                    this.props.loading && _react2.default.createElement(
                        'span',
                        null,
                        _react2.default.createElement(_LoadingIndicator2.default, { type: 'circle' })
                    ),
                    this.props.tronErrMsg && _react2.default.createElement(
                        'span',
                        {
                            style: {
                                display: 'block',
                                color: 'red'
                            }
                        },
                        this.props.tronErrMsg
                    )
                )
            );
        }
    }]);
    return TronCreateOne;
}(_react.Component);

exports.default = (0, _reactRedux.connect)(
// mapStateToProps
function (state, ownProps) {
    var currentUser = state.user.get('current');
    var tronPrivateKey = currentUser && currentUser.has('tron_private_key') ? currentUser.get('tron_private_key') : '';
    var tronErrMsg = state.app.has('tronErrMsg') ? state.app.get('tronErrMsg') : null;
    console.log('TEST has private_keys:', currentUser, currentUser && currentUser.has('private_keys'));
    return (0, _extends3.default)({}, ownProps, {
        loading: state.app.get('modalLoading'),
        tronPrivateKey: tronPrivateKey,
        tronErrMsg: tronErrMsg
    });
}, function (dispatch) {
    return {
        hideTronCreate: function hideTronCreate() {
            // if (e) e.preventDefault();
            dispatch(userActions.hideTronCreate());
        },
        showTronCreateSuccess: function showTronCreateSuccess() {
            dispatch(userActions.showTronCreateSuccess());
        },
        updateTronAddr: function updateTronAddr() {
            dispatch(userActions.updateTronAddr());
        },
        startLoading: function startLoading() {
            dispatch(appActions.modalLoadingBegin());
        },
        endLoading: function endLoading() {
            dispatch(appActions.modalLoadingEnd());
        },
        setTronErrMsg: function setTronErrMsg(msg) {
            dispatch(appActions.setTronErrMsg(msg));
        }
    };
})(TronCreateOne);