'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

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
// import LoadingIndicator from 'app/components/elements/LoadingIndicator';


var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _shouldComponentUpdate = require('app/utils/shouldComponentUpdate');

var _shouldComponentUpdate2 = _interopRequireDefault(_shouldComponentUpdate);

var _TransactionReducer = require('app/redux/TransactionReducer');

var transactionActions = _interopRequireWildcard(_TransactionReducer);

var _Icon = require('app/components/elements/Icon');

var _Icon2 = _interopRequireDefault(_Icon);

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _ServerApiClient = require('app/utils/ServerApiClient');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var string = _propTypes2.default.string,
    func = _propTypes2.default.func;
var Reblog = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(Reblog, _React$Component);

    function Reblog(props) {
        (0, _classCallCheck3.default)(this, Reblog);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Reblog.__proto__ || (0, _getPrototypeOf2.default)(Reblog)).call(this, props));

        _this.reblog = function (e) {
            e.preventDefault();
            if (_this.state.active) return;
            _this.setState({ loading: true });
            var _this$props = _this.props,
                reblog = _this$props.reblog,
                account = _this$props.account,
                author = _this$props.author,
                permlink = _this$props.permlink;

            reblog(account, author, permlink, function () {
                (0, _ServerApiClient.userActionRecord)('reblog', {
                    username: account,
                    author: author,
                    permlink: permlink
                });
                _this.setState({ active: true, loading: false });
                _this.setReblogged(account);
            }, function () {
                _this.setState({ active: false, loading: false });
            });
        };

        _this.shouldComponentUpdate = (0, _shouldComponentUpdate2.default)(_this, 'Reblog');
        _this.state = { active: false, loading: false };
        return _this;
    }

    (0, _createClass3.default)(Reblog, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            var account = this.props.account;

            if (account) {
                this.setState({ active: this.isReblogged(account) });
            }
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (nextProps.account) {
                this.setState({ active: this.isReblogged(nextProps.account) });
            }
        }
    }, {
        key: 'isReblogged',
        value: function isReblogged(account) {
            var _props = this.props,
                author = _props.author,
                permlink = _props.permlink;

            return getRebloggedList(account).includes(author + '/' + permlink);
        }
    }, {
        key: 'setReblogged',
        value: function setReblogged(account) {
            var _props2 = this.props,
                author = _props2.author,
                permlink = _props2.permlink;

            clearRebloggedCache();
            var posts = getRebloggedList(account);
            posts.push(author + '/' + permlink);
            if (posts.length > 200) posts.shift(1);

            localStorage.setItem('reblogged_' + account, (0, _stringify2.default)(posts));
        }
    }, {
        key: 'render',
        value: function render() {
            var state = this.state.active ? 'active' : 'inactive';
            var loading = this.state.loading ? ' loading' : '';
            return _react2.default.createElement(
                'span',
                {
                    className: 'Reblog__button Reblog__button-' + state + loading
                },
                _react2.default.createElement(
                    'a',
                    { href: '#', onClick: this.reblog, title: (0, _counterpart2.default)('g.reblog') },
                    _react2.default.createElement(_Icon2.default, { name: 'reblog' })
                )
            );
        }
    }]);
    return Reblog;
}(_react2.default.Component), _class.propTypes = {
    account: string,
    author: string,
    permlink: string,
    reblog: func
}, _temp);
exports.default = Reblog;

module.exports = (0, _reactRedux.connect)(function (state, ownProps) {
    var account = state.user.getIn(['current', 'username']) || state.offchain.get('account');
    return (0, _extends3.default)({}, ownProps, { account: account });
}, function (dispatch) {
    return {
        reblog: function reblog(account, author, permlink, successCallback, errorCallback) {
            var json = ['reblog', { account: account, author: author, permlink: permlink }];
            dispatch(transactionActions.broadcastOperation({
                type: 'custom_json',
                confirm: 'This post will be added to your blog and shared with your followers.',
                operation: {
                    id: 'follow',
                    required_posting_auths: [account],
                    json: (0, _stringify2.default)(json),
                    __config: { title: (0, _counterpart2.default)('g.resteem_this_post') }
                },
                successCallback: successCallback,
                errorCallback: errorCallback
            }));
        }
    };
})(Reblog);

var lastAccount = void 0;
var cachedPosts = void 0;

function getRebloggedList(account) {
    if (!process.env.BROWSER) return [];

    if (lastAccount === account) return cachedPosts;

    lastAccount = account;
    var posts = localStorage.getItem('reblogged_' + account);
    try {
        cachedPosts = JSON.parse(posts) || [];
    } catch (e) {
        cachedPosts = [];
    }
    return cachedPosts;
}

function clearRebloggedCache() {
    lastAccount = null;
}