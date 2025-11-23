'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

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

var _reactRedux = require('react-redux');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouter = require('react-router');

var _TransactionReducer = require('app/redux/TransactionReducer');

var transactionActions = _interopRequireWildcard(_TransactionReducer);

var _immutable = require('immutable');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MuteList = function (_React$Component) {
    (0, _inherits3.default)(MuteList, _React$Component);

    function MuteList(props) {
        (0, _classCallCheck3.default)(this, MuteList);

        var _this = (0, _possibleConstructorReturn3.default)(this, (MuteList.__proto__ || (0, _getPrototypeOf2.default)(MuteList)).call(this));

        _this.state = {};
        _this.unmute = _this.unmute.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(MuteList, [{
        key: 'unmute',
        value: function unmute(e, target) {
            var _this2 = this;

            e.preventDefault();

            if (this.state.busy) return;
            this.setState({ busy: target });
            var done = function done() {
                _this2.setState({ busy: null });
            };

            var account = this.props.account;

            this.props.updateFollow(account, target, '', this.props.blogList, done);
        }
    }, {
        key: 'render',
        value: function render() {
            var users = this.props.users;
            var busy = this.state.busy;
            var unmute = this.unmute;


            var items = users.map(function (user) {
                return _react2.default.createElement(
                    'li',
                    { key: user },
                    _react2.default.createElement(
                        _reactRouter.Link,
                        { to: '/@' + user },
                        _react2.default.createElement(
                            'strong',
                            null,
                            '@',
                            user
                        )
                    ),
                    '\xA0\xA0\xA0\xA0',
                    busy == user ? _react2.default.createElement(
                        'span',
                        null,
                        'saving....'
                    ) : _react2.default.createElement(
                        'a',
                        { href: '#', onClick: function onClick(e) {
                                return unmute(e, user);
                            } },
                        '[unmute]'
                    )
                );
            });

            return _react2.default.createElement(
                'ol',
                null,
                items
            );
        }
    }]);
    return MuteList;
}(_react2.default.Component);

var emptyMap = (0, _immutable.Map)();
var emptySet = (0, _immutable.Set)();

module.exports = (0, _reactRedux.connect)(function (state, props) {
    var username = state.user.getIn(['current', 'username']);
    var f = state.global.getIn(['follow', 'getFollowingAsync', username], emptyMap);
    var blogList = f.get('blog_result', emptySet);
    return {
        blogList: blogList
    };
}, function (dispatch) {
    return {
        updateFollow: function updateFollow(follower, following, type, blogList, done) {
            var what = [blogList.contains(following) ? 'blog' : '', type];
            var json = ['follow', { follower: follower, following: following, what: what }];
            dispatch(transactionActions.broadcastOperation({
                type: 'custom_json',
                operation: {
                    id: 'follow',
                    required_posting_auths: [follower],
                    json: (0, _stringify2.default)(json)
                },
                successCallback: done,
                errorCallback: done
            }));
        }
    };
})(MuteList);