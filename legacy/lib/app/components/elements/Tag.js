'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouter = require('react-router');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Tag = function Tag(_ref) {
    var post = _ref.post;

    var tag = post.get('category');
    var name = post.get('community_title', '#' + tag);
    return _react2.default.createElement(
        _reactRouter.Link,
        { to: '/trending/' + tag, key: tag },
        name
    );
};

exports.default = Tag;