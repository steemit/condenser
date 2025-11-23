'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _reactRouter = require('react-router');

var _StateFunctions = require('app/utils/StateFunctions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TagList = function (_Component) {
    (0, _inherits3.default)(TagList, _Component);

    function TagList() {
        (0, _classCallCheck3.default)(this, TagList);
        return (0, _possibleConstructorReturn3.default)(this, (TagList.__proto__ || (0, _getPrototypeOf2.default)(TagList)).apply(this, arguments));
    }

    (0, _createClass3.default)(TagList, [{
        key: 'render',
        value: function render() {
            var post = this.props.post;

            var category = post.get('category');

            var link = function link(tag) {
                if (tag == category) return null;
                return _react2.default.createElement(
                    _reactRouter.Link,
                    { to: '/trending/' + tag, key: tag },
                    ' #' + tag + ' '
                );
            };

            return _react2.default.createElement(
                'div',
                { className: 'TagList__horizontal' },
                (0, _StateFunctions.normalizeTags)(post.get('json_metadata'), category).map(link)
            );
        }
    }]);
    return TagList;
}(_react.Component);

exports.default = (0, _reactRedux.connect)(
// mapStateToProps
function (state, ownProps) {
    return {
        post: ownProps.post
    };
})(TagList);