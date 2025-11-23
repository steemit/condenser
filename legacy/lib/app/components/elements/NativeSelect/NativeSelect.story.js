'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _react3 = require('@storybook/react');

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _decorators = require('decorators');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var opts = function opts(topic) {
    return [{
        value: 'trending',
        label: 'TRENDY',
        link: '/trending/' + topic
    }, {
        value: 'created',
        label: 'FRESH',
        link: '/created/' + topic
    }, {
        value: 'hot',
        label: 'HOTTT!!!',
        link: '/hot/' + topic
    }, {
        value: 'promoted',
        label: '$$$ SOLD OUT $$$',
        link: '/promoted/' + topic
    }];
};

(0, _react3.storiesOf)('Elements', module).addDecorator(_decorators.Center).add('NativeSelect', function () {
    return _react2.default.createElement(_index2.default, {
        className: 'Rat',
        onChange: function onChange(e) {
            console.log('arg:', e.value);
        },
        options: opts('cool')
    });
});