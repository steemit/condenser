'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

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

var _reactRouter = require('react-router');

var _Follow = require('app/components/elements/Follow');

var _Follow2 = _interopRequireDefault(_Follow);

var _reactRedux = require('react-redux');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var UserListRow = function (_React$Component) {
    (0, _inherits3.default)(UserListRow, _React$Component);

    function UserListRow() {
        (0, _classCallCheck3.default)(this, UserListRow);
        return (0, _possibleConstructorReturn3.default)(this, (UserListRow.__proto__ || (0, _getPrototypeOf2.default)(UserListRow)).apply(this, arguments));
    }

    (0, _createClass3.default)(UserListRow, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                user = _props.user,
                loggedIn = _props.loggedIn,
                title = _props.title;

            var username = title === 'Followers' ? user.follower : user.following;
            return _react2.default.createElement(
                'tr',
                null,
                _react2.default.createElement(
                    'td',
                    null,
                    _react2.default.createElement(
                        _reactRouter.Link,
                        { to: '/@' + username },
                        _react2.default.createElement(
                            'strong',
                            null,
                            username
                        ),
                        user.reputation && '(' + Math.floor(user.reputation) + ')'
                    )
                ),
                loggedIn && _react2.default.createElement(
                    'td',
                    { width: '250' },
                    _react2.default.createElement(_Follow2.default, { following: username, whatIf: user.what })
                )
            );
        }
    }]);
    return UserListRow;
}(_react2.default.Component);

exports.default = (0, _reactRedux.connect)(function (state, ownProps) {
    var loggedIn = state.user.hasIn(['current', 'username']);
    return (0, _extends3.default)({}, ownProps, {
        loggedIn: loggedIn
    });
})(UserListRow);