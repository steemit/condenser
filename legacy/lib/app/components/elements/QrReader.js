'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Qr = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(Qr, _React$Component);

    function Qr(props) {
        (0, _classCallCheck3.default)(this, Qr);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Qr.__proto__ || (0, _getPrototypeOf2.default)(Qr)).call(this));

        _this.handleError = function (error) {
            console.error(error);
        };
        var onClose = props.onClose,
            handleScan = props.handleScan;

        _this.handleScan = function (data) {
            handleScan(data);
            if (onClose) onClose();
        };
        return _this;
    }

    (0, _createClass3.default)(Qr, [{
        key: 'render',
        value: function render() {
            var handleError = this.handleError,
                handleScan = this.handleScan;
            // Watch out, QrReader can mess up the nodejs server, tries to ref `navigator`
            // The server does not need a QrReader anyways

            if (!process.env.BROWSER) return _react2.default.createElement('span', null);
            return _react2.default.createElement('span', null);
            // a) Leaves the camera on when closing dialog - react-qr-reader v0.2.4
            // b) Only saw this work in Chrome - 0.2.4
            // try {
            //     const QrReader = require("react-qr-reader").default
            //     return <QrReader width={320} height={240} handleError={handleError}
            //         {...this.props} handleScan={handleScan} />
            // } catch(error) {
            //     console.log(error)
            //     return <span></span>
            // }
        }
    }]);
    return Qr;
}(_react2.default.Component), _class.propTypes = {
    handleScan: _propTypes2.default.func.isRequired,
    onClose: _propTypes2.default.func
}, _temp);
exports.default = Qr;