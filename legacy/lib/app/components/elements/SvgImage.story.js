'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _react3 = require('@storybook/react');

var _addonKnobs = require('@storybook/addon-knobs');

var _SvgImage = require('./SvgImage');

var _SvgImage2 = _interopRequireDefault(_SvgImage);

var _Icon = require('./Icon.story');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var svgs = ['404', 'facebook', 'reddit', 'steemit'];

var options = {
    range: true,
    min: 10,
    max: 200,
    step: 1
};

(0, _react3.storiesOf)('Elements', module).addDecorator(_addonKnobs.withKnobs).add('SvgImage', function () {
    return _react2.default.createElement(
        _Icon.Grid,
        null,
        svgs.map(function (svg) {
            return _react2.default.createElement(
                'div',
                { key: svg },
                _react2.default.createElement(_SvgImage2.default, {
                    name: svg,
                    width: String((0, _addonKnobs.number)('width', 100, options)) + 'px',
                    height: String((0, _addonKnobs.number)('height', 100, options)) + 'px'
                }),
                _react2.default.createElement(
                    'p',
                    null,
                    ' ',
                    svg,
                    ' '
                )
            );
        })
    );
});