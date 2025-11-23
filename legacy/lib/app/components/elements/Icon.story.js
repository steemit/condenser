'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Grid = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _react3 = require('@storybook/react');

var _addonKnobs = require('@storybook/addon-knobs');

var _Icon = require('./Icon');

var _Icon2 = _interopRequireDefault(_Icon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = {
    textAlign: 'center',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridAutoRows: 'minmax(80px, auto)'
};

var Grid = exports.Grid = function Grid(_ref) {
    var children = _ref.children;
    return _react2.default.createElement(
        'div',
        { style: styles },
        children
    );
};

var options = ['1x', '1_5x', '2x', '3x', '4x', '5x', '10x'];

(0, _react3.storiesOf)('Elements', module).addDecorator(_addonKnobs.withKnobs).add('Icon', function () {
    return _react2.default.createElement(
        Grid,
        null,
        _Icon.icons.map(function (icon) {
            return _react2.default.createElement(
                'div',
                { key: 'icon_' + icon },
                _react2.default.createElement(_Icon2.default, { name: icon, size: (0, _addonKnobs.select)('size', options, '2x') }),
                _react2.default.createElement(
                    'p',
                    null,
                    ' ',
                    icon,
                    ' '
                )
            );
        })
    );
});