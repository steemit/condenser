'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (_ref) {
    var value = _ref.value;

    if (isNaN(value)) {
        console.log('Unexpected rep value:', value);
        return null;
    }
    return _react2.default.createElement(
        'span',
        { className: 'Reputation', title: (0, _counterpart2.default)('g.reputation') },
        '(',
        Math.floor(value),
        ')'
    );
};