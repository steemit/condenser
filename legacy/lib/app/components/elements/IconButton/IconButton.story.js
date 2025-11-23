'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _react3 = require('@storybook/react');

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _decorators = require('decorators');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _react3.storiesOf)('Elements', module).addDecorator(_decorators.Center).add('IconButton', function () {
    return _react2.default.createElement(
        'span',
        null,
        _react2.default.createElement(_index2.default, { icon: 'pencil' }),
        _react2.default.createElement(_index2.default, { icon: 'magnifyingGlass' }),
        _react2.default.createElement(_index2.default, { icon: 'questionMark' })
    );
});