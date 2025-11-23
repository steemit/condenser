"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SidebarNewUsers = function SidebarNewUsers() {
    return _react2.default.createElement(
        "div",
        { className: "c-sidebar__module" },
        _react2.default.createElement(
            "div",
            { className: "c-sidebar__header" },
            _react2.default.createElement(
                "h3",
                { className: "c-sidebar__h3" },
                "New to Steemit?"
            )
        ),
        _react2.default.createElement(
            "div",
            { className: "c-sidebar__content" },
            _react2.default.createElement(
                "ul",
                { className: "c-sidebar__list" },
                _react2.default.createElement(
                    "li",
                    { className: "c-sidebar__list-item" },
                    _react2.default.createElement(
                        "a",
                        {
                            className: "c-sidebar__link",
                            href: "/guide/@steemitblog/steemit-a-guide-for-newcomers"
                        },
                        "Welcome Guide"
                    )
                )
            )
        )
    );
};

exports.default = SidebarNewUsers;