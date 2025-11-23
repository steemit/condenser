'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _react3 = require('@storybook/react');

var _addonKnobs = require('@storybook/addon-knobs');

var _Callout = require('./Callout');

var _Callout2 = _interopRequireDefault(_Callout);

var _decorators = require('decorators');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var selectOptions = ['error', 'default'];

(0, _react3.storiesOf)('Elements', module).addDecorator(_addonKnobs.withKnobs).addDecorator(_decorators.Center).add('Callout', function () {
    return _react2.default.createElement(
        _Callout2.default,
        { type: (0, _addonKnobs.select)('Callout style', selectOptions, 'default') },
        _react2.default.createElement(
            'span',
            null,
            ' Callout, you can add an error style with the knob'
        )
    );
});