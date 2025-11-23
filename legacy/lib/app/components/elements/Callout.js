"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (_ref) {
    var title = _ref.title,
        children = _ref.children,
        type = _ref.type;

    return _react2.default.createElement(
        "div",
        { className: "row" },
        _react2.default.createElement(
            "div",
            { className: "column" },
            _react2.default.createElement(
                "div",
                { className: 'callout' + (type ? " " + type : '') },
                _react2.default.createElement(
                    "h4",
                    null,
                    title
                ),
                _react2.default.createElement(
                    "div",
                    null,
                    children
                )
            )
        )
    );
};