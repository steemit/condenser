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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _TransactionReducer = require('app/redux/TransactionReducer');

var transactionActions = _interopRequireWildcard(_TransactionReducer);

var _DomUtils = require('app/utils/DomUtils');

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ConfirmTransactionForm = (_temp = _class = function (_Component) {
    (0, _inherits3.default)(ConfirmTransactionForm, _Component);

    function ConfirmTransactionForm() {
        (0, _classCallCheck3.default)(this, ConfirmTransactionForm);

        var _this = (0, _possibleConstructorReturn3.default)(this, (ConfirmTransactionForm.__proto__ || (0, _getPrototypeOf2.default)(ConfirmTransactionForm)).call(this));

        _this.closeOnOutsideClick = function (e) {
            var inside_dialog = (0, _DomUtils.findParent)(e.target, 'ConfirmTransactionForm');
            if (!inside_dialog) _this.onCancel();
        };

        _this.onCancel = function () {
            var _this$props = _this.props,
                confirmErrorCallback = _this$props.confirmErrorCallback,
                onCancel = _this$props.onCancel;

            if (confirmErrorCallback) confirmErrorCallback();
            if (onCancel) onCancel();
        };

        _this.okClick = function () {
            var _this$props2 = _this.props,
                okClick = _this$props2.okClick,
                confirmBroadcastOperation = _this$props2.confirmBroadcastOperation;

            okClick(confirmBroadcastOperation);
        };

        _this.onCheckbox = function (e) {
            var checkboxChecked = e.target.checked;
            _this.setState({ checkboxChecked: checkboxChecked });
        };

        _this.state = { checkboxChecked: false };
        return _this;
    }

    (0, _createClass3.default)(ConfirmTransactionForm, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            document.body.addEventListener('click', this.closeOnOutsideClick);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            document.body.removeEventListener('click', this.closeOnOutsideClick);
        }
    }, {
        key: 'render',
        value: function render() {
            var onCancel = this.onCancel,
                okClick = this.okClick,
                onCheckbox = this.onCheckbox;
            var _props = this.props,
                confirm = _props.confirm,
                confirmBroadcastOperation = _props.confirmBroadcastOperation,
                warning = _props.warning,
                checkbox = _props.checkbox;
            var checkboxChecked = this.state.checkboxChecked;

            var conf = typeof confirm === 'function' ? confirm() : confirm;
            return _react2.default.createElement(
                'div',
                { className: 'ConfirmTransactionForm' },
                _react2.default.createElement(
                    'h4',
                    null,
                    typeName(confirmBroadcastOperation)
                ),
                _react2.default.createElement('hr', null),
                _react2.default.createElement(
                    'div',
                    null,
                    conf
                ),
                warning ? _react2.default.createElement(
                    'div',
                    {
                        style: { paddingTop: 10, fontWeight: 'bold' },
                        className: 'error'
                    },
                    warning
                ) : null,
                checkbox ? _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'label',
                        { htmlFor: 'checkbox' },
                        _react2.default.createElement('input', {
                            id: 'checkbox',
                            type: 'checkbox',
                            checked: checkboxChecked,
                            onChange: this.onCheckbox
                        }),
                        checkbox
                    )
                ) : null,
                _react2.default.createElement('br', null),
                _react2.default.createElement(
                    'button',
                    {
                        className: 'button',
                        onClick: okClick,
                        disabled: !(checkbox === undefined || checkboxChecked)
                    },
                    (0, _counterpart2.default)('g.ok')
                ),
                _react2.default.createElement(
                    'button',
                    {
                        type: 'button hollow',
                        className: 'button hollow',
                        onClick: onCancel
                    },
                    (0, _counterpart2.default)('g.cancel')
                )
            );
        }
    }]);
    return ConfirmTransactionForm;
}(_react.Component), _class.propTypes = {
    //Steemit
    onCancel: _propTypes2.default.func,
    warning: _propTypes2.default.string,
    checkbox: _propTypes2.default.string,
    // redux-form
    confirm: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.func]),
    confirmBroadcastOperation: _propTypes2.default.object,
    confirmErrorCallback: _propTypes2.default.func,
    okClick: _propTypes2.default.func
}, _temp);

var typeName = function typeName(confirmBroadcastOperation) {
    var title = confirmBroadcastOperation.getIn(['operation', '__config', 'title']);
    if (title) return title;
    var type = confirmBroadcastOperation.get('type');
    return (0, _counterpart2.default)('confirmtransactionform_jsx.confirm', {
        transactionType: type.split('_').map(function (n) {
            return n.charAt(0).toUpperCase() + n.substring(1);
        }).join(' ') // @todo we should translate each potential transaction type!
    });
};

exports.default = (0, _reactRedux.connect)(
// mapStateToProps
function (state) {
    var confirmBroadcastOperation = state.transaction.get('confirmBroadcastOperation');
    var confirmErrorCallback = state.transaction.get('confirmErrorCallback');
    var confirm = state.transaction.get('confirm');
    var warning = state.transaction.get('warning');
    var checkbox = state.transaction.get('checkbox');
    return {
        confirmBroadcastOperation: confirmBroadcastOperation,
        confirmErrorCallback: confirmErrorCallback,
        confirm: confirm,
        warning: warning,
        checkbox: checkbox
    };
},
// mapDispatchToProps
function (dispatch) {
    return {
        okClick: function okClick(confirmBroadcastOperation) {
            dispatch(transactionActions.hideConfirm());
            dispatch(transactionActions.broadcastOperation((0, _extends3.default)({}, confirmBroadcastOperation.toJS())));
        }
    };
})(ConfirmTransactionForm);