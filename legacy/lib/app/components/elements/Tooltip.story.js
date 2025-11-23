'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _react3 = require('@storybook/react');

var _addonKnobs = require('@storybook/addon-knobs');

var _decorators = require('decorators');

var _Tooltip = require('./Tooltip');

var _Tooltip2 = _interopRequireDefault(_Tooltip);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var widthOptions = {
    range: true,
    min: 300,
    max: 1200,
    step: 1
};

(0, _react3.storiesOf)('Elements', module).addDecorator(_addonKnobs.withKnobs).addDecorator(_decorators.Center).add('Tooltip', function () {
    return _react2.default.createElement(
        _Tooltip2.default,
        { t: (0, _addonKnobs.text)('tooltip text', 'a helpful lil tip') },
        _react2.default.createElement(
            'span',
            null,
            'Hover Over Me To See The Tooltip.'
        )
    );
});