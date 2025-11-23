'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _react3 = require('@storybook/react');

var _Reputation = require('./Reputation');

var _Reputation2 = _interopRequireDefault(_Reputation);

var _decorators = require('decorators');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _react3.storiesOf)('Elements', module).addDecorator(_decorators.Center).add('Reputation', function () {
    return _react2.default.createElement(_Reputation2.default, { value: 1200 });
});