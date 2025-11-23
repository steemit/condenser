'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var IconButton = function IconButton(_ref) {
    var icon = _ref.icon,
        size = _ref.size,
        fill = _ref.fill;

    var icons = {
        pencil: _react2.default.createElement('path', {
            className: 'icon-button icon-button__pencil icon-button--' + fill,
            d: 'M19.5555556,10.7003165 L21.9259259,13.0706869 L22.6627455,12.3338673 C22.910371,12.0862418 22.910371,11.6847616 22.6627455,11.4371361 L21.1891063,9.96349689 C20.9414809,9.71587141 20.5400006,9.71587141 20.2923752,9.96349689 L19.5555556,10.7003165 Z M18.8571429,11.2929091 L11.015873,19.1341789 L9.77777778,22.8484646 L13.0793651,22.0230678 L21.3333333,13.7690995 L20.5079365,12.9437027 L12.6666667,20.7849726 L11.4285714,21.197671 L11.8412698,19.9595757 L19.6825397,12.1183059 L18.8571429,11.2929091 Z',
            id: 'icon-svg'
        }),
        magnifyingGlass: _react2.default.createElement('path', {
            className: 'icon-button icon-button__magnifyingGlass icon-button--' + fill,
            d: 'M14.3681591,18.5706017 L11.3928571,21.6 L14.3681591,18.5706017 C13.273867,17.6916019 12.5714286,16.3293241 12.5714286,14.8 C12.5714286,12.1490332 14.6820862,10 17.2857143,10 C19.8893424,10 22,12.1490332 22,14.8 C22,17.4509668 19.8893424,19.6 17.2857143,19.6 C16.1841009,19.6 15.1707389,19.215281 14.3681591,18.5706017 Z',
            id: 'icon-svg'
        }),
        question: _react2.default.createElement('path', {
            className: 'icon-button icon-button__magnifyingGlass icon-button--' + fill,
            d: 'M20.27,14.93c-1.46,1.23-2.67,1.82-2.67,3.93v1.78H14.12a27.22,27.22,0,0,1,.14-3.72c.53-2.47,2.16-3.2,3.48-4.41a2.77,2.77,0,0,0,1.1-2,2.45,2.45,0,0,0-2.73-2.36,2.67,2.67,0,0,0-3,2.81H9.51c0-3.94,3-6,6.74-6s6.24,2.42,6.24,5.51A5.67,5.67,0,0,1,20.27,14.93ZM13.89,27.05V23.11H17.8v3.94Z'
        })
    };

    var viewBox = void 0;
    switch (size) {
        case 'small':
            viewBox = '0 0 44 44';
            break;
        case 'medium':
            viewBox = '0 0 32 32';
            break;
        case 'large':
            viewBox = '0 0 16 16';
            break;
        default:
            viewBox = '0 0 32 32';
    }

    var fillColor = 'icon-button__svg--' + fill;

    return _react2.default.createElement(
        'svg',
        {
            className: 'icon-button__svg icon-button__svg--' + fill + ' icon-button__svg--' + size,
            viewBox: viewBox,
            version: '1.1',
            xmlns: 'http://www.w3.org/2000/svg'
        },
        _react2.default.createElement(
            'g',
            null,
            _react2.default.createElement('circle', {
                className: 'icon-button icon-button__border icon-button__border--' + fill,
                cx: '16',
                cy: '16',
                r: '15'
            }),
            icons[icon]
        )
    );
};

IconButton.propTypes = {
    icon: _propTypes2.default.oneOf(['pencil', 'magnifyingGlass', 'question']),
    size: _propTypes2.default.oneOf(['small', 'medium', 'large']),
    fill: _propTypes2.default.oneOf(['transparent', 'green'])
};
IconButton.defaultProps = {
    icon: 'pencil',
    size: 'medium',
    fill: 'transparent'
};

exports.default = IconButton;