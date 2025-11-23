'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _react3 = require('@storybook/react');

var _addonKnobs = require('@storybook/addon-knobs');

var _DropdownMenu = require('./DropdownMenu');

var _DropdownMenu2 = _interopRequireDefault(_DropdownMenu);

var _decorators = require('decorators');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var selectOptions = ['transfer', 'transfer to savings', 'power up'];

var mockMenu = [{
    value: 'transfer',
    link: '#',
    onClick: function onClick() {}
}, {
    value: 'transfer to savings',
    link: '#',
    onClick: function onClick() {}
}, {
    value: 'power up',
    link: '#',
    onClick: function onClick() {}
}];

(0, _react3.storiesOf)('Elements', module).addDecorator(_addonKnobs.withKnobs).addDecorator(_decorators.Center).add('DropdownMenu', function () {
    return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
            'h3',
            null,
            'Dropdown Menu'
        ),
        _react2.default.createElement(_DropdownMenu2.default, {
            title: 'Other actions',
            key: '_others',
            items: mockMenu,
            el: 'div',
            selected: (0, _addonKnobs.select)('Currently Selected', selectOptions, 'power up')
        })
    );
});