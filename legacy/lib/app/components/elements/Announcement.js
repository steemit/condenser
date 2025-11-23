'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Announcement = undefined;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Announcement = exports.Announcement = function Announcement(_ref) {
    var onClose = _ref.onClose;
    return _react2.default.createElement(
        'div',
        { className: 'annoucement-banner' },
        _react2.default.createElement(
            'p',
            { className: 'announcement-banner__text' },
            'Communities are live!',
            ' ',
            _react2.default.createElement(
                'a',
                {
                    className: 'announcement-banner__link',
                    href: 'https://steemit.com/steemit/@steemitblog/communities-have-arrived'
                },
                'Read more'
            ),
            '.'
        ),
        _react2.default.createElement(
            'button',
            { className: 'close-button', type: 'button', onClick: onClose },
            '\xD7'
        )
    );
};

Announcement.propTypes = {
    onClose: _propTypes2.default.func.isRequired
};

exports.default = Announcement;