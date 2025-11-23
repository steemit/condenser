'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _reactRouter = require('react-router');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SidebarLinks = function SidebarLinks(_ref) {
    var username = _ref.username,
        topics = _ref.topics;
    return _react2.default.createElement(
        'div',
        { className: 'c-sidebar__module' },
        _react2.default.createElement(
            'div',
            { className: 'c-sidebar__content' },
            _react2.default.createElement(
                'ul',
                { className: 'c-sidebar__list' },
                topics && _react2.default.createElement(
                    'li',
                    { className: 'c-sidebar__list-item' },
                    _react2.default.createElement(
                        'div',
                        { style: { color: '#aaa', paddingTop: '0em' } },
                        'Trending Communities'
                    )
                ),
                topics && topics.toJS().map(function (item) {
                    return _react2.default.createElement(
                        'li',
                        { key: item[0], className: 'c-sidebar__list-item' },
                        _react2.default.createElement(
                            _reactRouter.Link,
                            {
                                className: 'c-sidebar__link',
                                to: '/trending/' + item[0]
                            },
                            item[1]
                        )
                    );
                })
            )
        )
    );
};

exports.default = SidebarLinks;