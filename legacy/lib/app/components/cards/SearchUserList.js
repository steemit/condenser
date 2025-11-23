'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SIZE_LARGE = exports.SIZE_MED = exports.SIZE_SMALL = undefined;

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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _reactRouter = require('react-router');

var _ProxifyUrl = require('app/utils/ProxifyUrl');

var _ExtractContent = require('app/utils/ExtractContent');

var _UserReducer = require('app/redux/UserReducer');

var userActions = _interopRequireWildcard(_UserReducer);

var _TransactionReducer = require('app/redux/TransactionReducer');

var transactionActions = _interopRequireWildcard(_TransactionReducer);

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _userStatic = require('app/assets/images/user-static.png');

var _userStatic2 = _interopRequireDefault(_userStatic);

var _immutable = require('immutable');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SIZE_SMALL = exports.SIZE_SMALL = 'small';
var SIZE_MED = exports.SIZE_MED = 'medium';
var SIZE_LARGE = exports.SIZE_LARGE = 'large';

var SearchUserList = function (_Component) {
    (0, _inherits3.default)(SearchUserList, _Component);

    function SearchUserList() {
        var _ref;

        var _temp, _this, _ret;

        (0, _classCallCheck3.default)(this, SearchUserList);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = SearchUserList.__proto__ || (0, _getPrototypeOf2.default)(SearchUserList)).call.apply(_ref, [this].concat(args))), _this), _this.checkIfLogin = function (isFollow) {
            var _this$props = _this.props,
                loggedIn = _this$props.loggedIn,
                allFollowing = _this$props.allFollowing,
                username = _this$props.username,
                name = _this$props.name,
                showLogin = _this$props.showLogin,
                updateFollow = _this$props.updateFollow,
                ignoreList = _this$props.ignoreList;

            if (!loggedIn) {
                return showLogin();
            } else {
                if (isFollow) {
                    updateFollow(username, name, '', ignoreList, function () {
                        //console.log('取消关注');
                    });
                } else {
                    updateFollow(username, name, 'blog', ignoreList, function () {
                        //console.log('关注');
                    });
                }
            }
            return true;
        }, _this.renderFollow = function () {
            var _this$props2 = _this.props,
                loggedIn = _this$props2.loggedIn,
                allFollowing = _this$props2.allFollowing,
                name = _this$props2.name;

            var isFollow = false;
            if (!loggedIn) {
                isFollow = false;
            } else {
                allFollowing && allFollowing.map(function (item, i) {
                    if (item === name) {
                        isFollow = true;
                    }
                });
            }
            return _react2.default.createElement(
                'a',
                {
                    className: 'follow-btn',
                    onClick: function onClick() {
                        return _this.checkIfLogin(isFollow);
                    }
                },
                isFollow ? (0, _counterpart2.default)('g.unfollow') : (0, _counterpart2.default)('g.follow')
            );
        }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
    }

    (0, _createClass3.default)(SearchUserList, [{
        key: 'imgErrorFun',
        value: function imgErrorFun(event) {
            event.target.src = _userStatic2.default;
            event.target.οnerrοr = null; //控制图片显示区域不要一直跳动
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                profile_image = _props.profile_image,
                name = _props.name,
                reputation = _props.reputation,
                followers = _props.followers,
                post_count = _props.post_count,
                loggedIn = _props.loggedIn,
                allFollowing = _props.allFollowing,
                search_type = _props.search_type;

            var url = (0, _ProxifyUrl.imageProxy)() + ('u/' + name + '/avatar/' + SIZE_MED);
            var keyWord = process.env.BROWSER ? decodeURI(window.location.search).split('=')[1] : null;
            var highlightColor = '#00FFC8';
            return _react2.default.createElement(
                'div',
                { className: 'search-userlist' },
                _react2.default.createElement(
                    'div',
                    { className: 'search-userlist-left' },
                    _react2.default.createElement(
                        'div',
                        { className: 'search-userlist-left-top' },
                        _react2.default.createElement(
                            'a',
                            { href: '/@' + name, target: '_blank' },
                            _react2.default.createElement('img', {
                                className: 'user-logo',
                                src: url,
                                onError: function onError(event) {
                                    return _this2.imgErrorFun(event);
                                }
                            })
                        ),
                        _react2.default.createElement('span', {
                            className: 'user-name',
                            dangerouslySetInnerHTML: {
                                __html: (0, _ExtractContent.highlightKeyword)(name, keyWord, highlightColor)
                            }
                        }),
                        _react2.default.createElement(
                            'span',
                            { className: 'user-repution' },
                            '(' + Math.floor(reputation) + ')'
                        )
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'search-userlist-left-bottom' },
                        _react2.default.createElement(
                            'span',
                            { className: 'user-follower' },
                            followers > 1 ? (0, _counterpart2.default)('g.many_followers', { count: followers }) : (0, _counterpart2.default)('g.one_follower', { count: followers })
                        ),
                        _react2.default.createElement(
                            'span',
                            null,
                            post_count > 1 ? (0, _counterpart2.default)('g.many_posts', { count: post_count }) : (0, _counterpart2.default)('g.one_post', { count: post_count })
                        )
                    )
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'search-userlist-right' },
                    this.renderFollow()
                )
            );
        }
    }]);
    return SearchUserList;
}(_react.Component);

var emptyMap = (0, _immutable.Map)();
var emptySet = (0, _immutable.Set)();

exports.default = (0, _reactRedux.connect)(function (state, props) {
    var post = props.post;

    var username = state.user.getIn(['current', 'username']);
    var loggedIn = !!username;
    var f = state.global.getIn(['follow', 'getFollowingAsync', username], emptyMap);

    // the line below was commented out by val - I think it's broken so sometimes the loading indicator is shown forever
    // const loading = f.get('blog_loading', false) || f.get('ignore_loading', false)
    var ignoreList = f.get('ignore_result', emptySet);

    return {
        follow: typeof props.follow === 'undefined' ? true : props.follow,
        name: post.get('name'),
        reputation: post.get('reputation'),
        followers: post.get('followers'),
        following: post.get('following'),
        post_count: post.get('post_count'),
        profile_image: post.get('profile_image'),
        search_type: post.get('_index'),
        allFollowing: state.global.getIn(['follow', 'getFollowingAsync', username, 'blog_result']),
        username: username,
        loggedIn: loggedIn,
        ignoreList: ignoreList
    };
}, function (dispatch) {
    return {
        showLogin: function showLogin(e) {
            if (e) e.preventDefault();
            dispatch(userActions.showLogin({ type: 'basic' }));
        },
        logout: function logout(e) {
            if (e) e.preventDefault();
            dispatch(userActions.logout({ type: 'default' }));
        },
        updateFollow: function updateFollow(follower, following, action, ignoreList, done) {
            var what = [action, ignoreList.contains(following) ? 'ignore' : ''];
            var json = ['follow', { follower: follower, following: following, what: what }];
            dispatch(transactionActions.broadcastOperation({
                type: 'custom_json',
                operation: {
                    id: 'follow',
                    required_posting_auths: [follower],
                    json: (0, _stringify2.default)(json)
                },
                successCallback: done,
                // TODO: Why?
                errorCallback: done
            }));
        }
    };
})(SearchUserList);