'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

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

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _LoadingIndicator = require('app/components/elements/LoadingIndicator');

var _LoadingIndicator2 = _interopRequireDefault(_LoadingIndicator);

var _shouldComponentUpdate = require('app/utils/shouldComponentUpdate');

var _shouldComponentUpdate2 = _interopRequireDefault(_shouldComponentUpdate);

var _TransactionReducer = require('app/redux/TransactionReducer');

var transactionActions = _interopRequireWildcard(_TransactionReducer);

var _UserReducer = require('app/redux/UserReducer');

var userActions = _interopRequireWildcard(_UserReducer);

var _FetchDataSaga = require('app/redux/FetchDataSaga');

var _immutable = require('immutable');

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var string = _propTypes2.default.string,
    bool = _propTypes2.default.bool,
    any = _propTypes2.default.any;
var Follow = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(Follow, _React$Component);

    function Follow(props) {
        (0, _classCallCheck3.default)(this, Follow);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Follow.__proto__ || (0, _getPrototypeOf2.default)(Follow)).call(this));

        _this.state = {};
        _this.initEvents(props);
        _this.followLoggedOut = _this.followLoggedOut.bind(_this);
        _this.shouldComponentUpdate = (0, _shouldComponentUpdate2.default)(_this, 'Follow');
        return _this;
    }

    (0, _createClass3.default)(Follow, [{
        key: 'componentWillUpdate',
        value: function componentWillUpdate(nextProps) {
            this.initEvents(nextProps);
        }
    }, {
        key: 'initEvents',
        value: function initEvents(props) {
            var _this2 = this;

            var updateFollow = props.updateFollow,
                follower = props.follower,
                following = props.following,
                followingWhat = props.followingWhat,
                ignoreWhat = props.ignoreWhat,
                updateFollowersList = props.updateFollowersList;

            var upd = function upd(action, index) {
                if (_this2.state.busy) return;
                _this2.setState({ busy: true });
                var done = function done() {
                    _this2.setState({ busy: false });
                    //updateFollowersList([{}])
                };
                var whatIf = [followingWhat, ignoreWhat];
                var what = [];
                what[index] = action;
                var otherIndex = Number(!index);
                if (whatIf && whatIf.length > 0) {
                    what[otherIndex] = whatIf[otherIndex];
                } else {
                    what[otherIndex] = '';
                }
                updateFollow(follower, following, what, done);
            };
            this.follow = function () {
                upd('blog', 0);
            };
            this.unfollow = function () {
                upd('', 0);
            };
            this.ignore = function () {
                upd('ignore', 1);
            };
            this.unignore = function () {
                upd('', 1);
            };
        }
    }, {
        key: 'followLoggedOut',
        value: function followLoggedOut(e) {
            // close author preview if present
            var author_preview = document.querySelector('.dropdown-pane.is-open');
            if (author_preview) author_preview.remove();
            // resume authenticate modal
            this.props.showLogin(e);
        }
    }, {
        key: 'render',
        value: function render() {
            var loading = this.props.loading;

            if (loading) return _react2.default.createElement(
                'span',
                null,
                _react2.default.createElement(_LoadingIndicator2.default, null),
                ' ',
                (0, _counterpart2.default)('g.loading'),
                '\u2026'
            );
            if (loading !== false) {
                // must know what the user is already following before any update can happen
                return _react2.default.createElement('span', null);
            }

            var _props = this.props,
                follower = _props.follower,
                following = _props.following; // html

            // Show follow preview for new users

            if (typeof window === 'undefined') {
                return null;
            }

            if (!follower || !following) return _react2.default.createElement(
                'span',
                null,
                _react2.default.createElement(
                    'label',
                    {
                        className: 'button slim hollow secondary',
                        onClick: this.followLoggedOut
                    },
                    (0, _counterpart2.default)('g.follow')
                )
            );
            // Can't follow or ignore self
            if (follower === following) return _react2.default.createElement('span', null);

            var _props2 = this.props,
                followingWhat = _props2.followingWhat,
                ignoreWhat = _props2.ignoreWhat,
                whatIf = _props2.whatIf; // redux

            var _props3 = this.props,
                showFollow = _props3.showFollow,
                showMute = _props3.showMute,
                fat = _props3.fat,
                children = _props3.children; // html

            var busy = this.state.busy;

            var cnBusy = busy ? 'disabled' : '';
            var cnActive = 'button' + (fat ? '' : ' slim');
            var cnInactive = cnActive + ' hollow secondary ' + cnBusy;
            return _react2.default.createElement(
                'span',
                null,
                showFollow && followingWhat !== 'blog' && _react2.default.createElement(
                    'label',
                    { className: cnInactive, onClick: this.follow },
                    (0, _counterpart2.default)('g.follow')
                ),
                showFollow && followingWhat === 'blog' && _react2.default.createElement(
                    'label',
                    { className: cnInactive, onClick: this.unfollow },
                    (0, _counterpart2.default)('g.unfollow')
                ),
                showMute && ignoreWhat !== 'ignore' && _react2.default.createElement(
                    'label',
                    { className: cnInactive, onClick: this.ignore },
                    (0, _counterpart2.default)('g.mute')
                ),
                showMute && ignoreWhat === 'ignore' && _react2.default.createElement(
                    'label',
                    { className: cnInactive, onClick: this.unignore },
                    (0, _counterpart2.default)('g.unmute')
                ),
                children && _react2.default.createElement(
                    'span',
                    null,
                    '\xA0\xA0',
                    children
                )
            );
        }
    }]);
    return Follow;
}(_react2.default.Component), _class.propTypes = {
    following: string,
    follower: string, // OPTIONAL default to current user
    showFollow: bool,
    showMute: bool,
    fat: bool,
    children: any,
    showLogin: _propTypes2.default.func.isRequired
}, _class.defaultProps = {
    showFollow: true,
    showMute: true,
    fat: false
}, _temp);
exports.default = Follow;


var emptyMap = (0, _immutable.Map)();
var emptySet = (0, _immutable.Set)();

module.exports = (0, _reactRedux.connect)(function (state, ownProps) {
    var follower = ownProps.follower;

    if (!follower) {
        var current_user = state.user.get('current');
        follower = current_user ? current_user.get('username') : null;
    }

    var following = ownProps.following;

    var f = state.global.getIn(['follow', 'getFollowingAsync', follower], emptyMap);

    // the line below was commented out by val - I think it's broken so sometimes the loading indicator is shown forever
    // const loading = f.get('blog_loading', false) || f.get('ignore_loading', false)
    var loading = false;
    var followingWhat = f.get('blog_result', emptySet).contains(following) ? 'blog' : '';
    var ignoreWhat = f.get('ignore_result', emptySet).contains(following) ? 'ignore' : '';
    return {
        follower: follower,
        following: following,
        followingWhat: followingWhat,
        ignoreWhat: ignoreWhat,
        loading: loading
    };
}, function (dispatch) {
    return {
        updateFollow: function updateFollow(follower, following, what, done) {
            var json = ['follow', { follower: follower, following: following, what: what }];
            console.log(json);
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
        },
        showLogin: function showLogin(e) {
            if (e) e.preventDefault();
            dispatch(userActions.showLogin());
        },
        updateFollowersList: function updateFollowersList(list) {
            return dispatch(_FetchDataSaga.actions.updateFollowersList(list));
        }
    };
})(Follow);