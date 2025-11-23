'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ParsersAndFormatters = require('app/utils/ParsersAndFormatters');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FormattedAsset = function FormattedAsset(_ref) {
    var amount = _ref.amount,
        asset = _ref.asset,
        classname = _ref.classname;

    if (amount && typeof amount === 'string') {
        amount = (0, _ParsersAndFormatters.parsePayoutAmount)(amount);
    }

    var amnt = (0, _ParsersAndFormatters.formatDecimal)(amount);
    return asset === '$' ? _react2.default.createElement(
        'span',
        { className: 'FormattedAsset ' + classname },
        _react2.default.createElement(
            'span',
            { className: 'prefix' },
            '$'
        ),
        _react2.default.createElement(
            'span',
            { className: 'integer' },
            amnt[0]
        ),
        _react2.default.createElement(
            'span',
            { className: 'decimal' },
            amnt[1]
        )
    ) : _react2.default.createElement(
        'span',
        { className: 'FormattedAsset' },
        _react2.default.createElement(
            'span',
            { className: 'integer' },
            amnt[0]
        ),
        _react2.default.createElement(
            'span',
            { className: 'decimal' },
            amnt[1]
        ),
        ' ',
        _react2.default.createElement(
            'span',
            { className: 'asset' },
            asset
        )
    );
};

exports.default = FormattedAsset;