'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _react3 = require('@storybook/react');

var _LoadingIndicator = require('./LoadingIndicator');

var _LoadingIndicator2 = _interopRequireDefault(_LoadingIndicator);

var _LoadingIndicator3 = require('./LoadingIndicator.scss');

var _LoadingIndicator4 = _interopRequireDefault(_LoadingIndicator3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _react3.storiesOf)('Elements', module).add('LoadingIndicator', function () {
    return _react2.default.createElement(_LoadingIndicator2.default, null);
});