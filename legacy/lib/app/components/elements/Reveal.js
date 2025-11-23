'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _Modal = require('react-overlays/lib/Modal');

var _Modal2 = _interopRequireDefault(_Modal);

var _Transition = require('react-overlays/lib/Transition');

var _Transition2 = _interopRequireDefault(_Transition);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Reveal = function Reveal(_ref) {
    var children = _ref.children,
        onHide = _ref.onHide,
        show = _ref.show;

    var modalStyle = {
        bottom: 0,
        left: 0,
        overflowY: 'scroll',
        position: 'fixed',
        right: 0,
        top: 0,
        display: 'block',
        zIndex: 105
    };

    return _react2.default.createElement(
        _Modal2.default,
        {
            backdrop: true,
            transition: _Transition2.default,
            onHide: onHide,
            show: show,
            backdropClassName: 'reveal-overlay',
            backdropStyle: { display: 'block' },
            style: modalStyle
        },
        _react2.default.createElement(
            'div',
            {
                className: 'reveal fade in',
                role: 'document',
                tabIndex: '-1',
                style: { display: 'block' }
            },
            children
        )
    );
};

Reveal.propTypes = {
    show: _propTypes2.default.bool.isRequired,
    onHide: _propTypes2.default.func.isRequired
};

exports.default = Reveal;