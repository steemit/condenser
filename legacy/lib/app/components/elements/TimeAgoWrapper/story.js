'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _react3 = require('@storybook/react');

var _addonKnobs = require('@storybook/addon-knobs');

var _decorators = require('decorators');

var _reactIntl = require('react-intl');

var _ = require('./');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _react3.storiesOf)('Elements', module).addDecorator(_addonKnobs.withKnobs).addDecorator(_decorators.Center).add('TimeAgoWrapper', function () {
    return _react2.default.createElement(
        _reactIntl.IntlProvider,
        { locale: 'en' },
        _react2.default.createElement(_2.default, { date: (0, _addonKnobs.date)('date', new Date('1 Jul 2016')) })
    );
});