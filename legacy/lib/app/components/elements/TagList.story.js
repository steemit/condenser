'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _react3 = require('@storybook/react');

var _TagList = require('./TagList');

var _TagList2 = _interopRequireDefault(_TagList);

var _decorators = require('decorators');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mockPost = {
    json_metadata: {
        tags: ['water', 'snow', 'ice', 'steam']
    }
};

(0, _react3.storiesOf)('Elements', module).addDecorator(_decorators.Center).add('TagList', function () {
    return _react2.default.createElement(_TagList2.default, { post: mockPost });
});