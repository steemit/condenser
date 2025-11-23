'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CloseButton = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CloseButton = function CloseButton(_ref) {
    var className = _ref.className,
        restProps = (0, _objectWithoutProperties3.default)(_ref, ['className']);

    return _react2.default.createElement(
        'button',
        (0, _extends3.default)({}, restProps, { className: 'close-button', type: 'button' }),
        '\xD7'
    );
};

exports.CloseButton = CloseButton;
CloseButton.propTypes = {
    className: _propTypes2.default.string
};

exports.default = CloseButton;