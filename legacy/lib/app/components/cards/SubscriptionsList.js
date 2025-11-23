'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

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

var _reactRouter = require('react-router');

var _TimeAgoWrapper = require('app/components/elements/TimeAgoWrapper');

var _TimeAgoWrapper2 = _interopRequireDefault(_TimeAgoWrapper);

var _LoadingIndicator = require('app/components/elements/LoadingIndicator');

var _LoadingIndicator2 = _interopRequireDefault(_LoadingIndicator);

var _FetchDataSaga = require('app/redux/FetchDataSaga');

var _GlobalReducer = require('app/redux/GlobalReducer');

var globalActions = _interopRequireWildcard(_GlobalReducer);

var _ClaimBox = require('app/components/elements/ClaimBox');

var _ClaimBox2 = _interopRequireDefault(_ClaimBox);

var _Callout = require('app/components/elements/Callout');

var _Callout2 = _interopRequireDefault(_Callout);

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SubscriptionsList = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(SubscriptionsList, _React$Component);

    function SubscriptionsList() {
        (0, _classCallCheck3.default)(this, SubscriptionsList);
        return (0, _possibleConstructorReturn3.default)(this, (SubscriptionsList.__proto__ || (0, _getPrototypeOf2.default)(SubscriptionsList)).call(this));
    }

    (0, _createClass3.default)(SubscriptionsList, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            var _props = this.props,
                username = _props.username,
                getAccountSubscriptions = _props.getAccountSubscriptions;

            if (username) {
                getAccountSubscriptions(username);
            }
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps) {
            var _props2 = this.props,
                username = _props2.username,
                getAccountSubscriptions = _props2.getAccountSubscriptions;

            if (prevProps.username !== username) {
                getAccountSubscriptions(username);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _props3 = this.props,
                subscriptions = _props3.subscriptions,
                loading = _props3.loading;


            var renderItem = function renderItem(tuple) {
                var _tuple = (0, _slicedToArray3.default)(tuple, 4),
                    hive = _tuple[0],
                    name = _tuple[1],
                    role = _tuple[2],
                    title = _tuple[3];

                return _react2.default.createElement(
                    'li',
                    { key: hive },
                    _react2.default.createElement(
                        _reactRouter.Link,
                        { to: '/trending/' + hive },
                        name || hive
                    ),
                    _react2.default.createElement(
                        'span',
                        { className: 'user_role' },
                        role
                    ),
                    title && _react2.default.createElement(
                        'span',
                        { className: 'affiliation' },
                        title
                    )
                );
            };

            return _react2.default.createElement(
                'div',
                { className: '' },
                _react2.default.createElement(
                    'h4',
                    null,
                    (0, _counterpart2.default)('g.subscriptions')
                ),
                subscriptions && subscriptions.length > 0 && _react2.default.createElement(
                    'ul',
                    null,
                    subscriptions.map(function (item) {
                        return renderItem(item);
                    })
                ),
                subscriptions.length === 0 && !loading && _react2.default.createElement(
                    _Callout2.default,
                    null,
                    'Welcome! You don\'t have any subscriptions yet.'
                ),
                loading && _react2.default.createElement(
                    'center',
                    null,
                    _react2.default.createElement(_LoadingIndicator2.default, {
                        style: { marginBottom: '2rem' },
                        type: 'circle'
                    })
                )
            );
        }
    }]);
    return SubscriptionsList;
}(_react2.default.Component), _class.propTypes = {
    username: _propTypes2.default.string.isRequired,
    subscriptions: _propTypes2.default.arrayOf(_propTypes2.default.arrayOf(_propTypes2.default.string)),
    loading: _propTypes2.default.bool
}, _class.defaultProps = {
    subscriptions: [],
    loading: true
}, _temp);
exports.default = (0, _reactRedux.connect)(function (state, props) {
    var isOwnAccount = state.user.getIn(['current', 'username'], '') === props.username;
    var loading = state.global.getIn(['subscriptions', 'loading']);
    var subscriptions = state.global.getIn(['subscriptions', props.username]);
    return (0, _extends3.default)({}, props, {
        subscriptions: subscriptions ? subscriptions.toJS() : [],
        isOwnAccount: isOwnAccount,
        loading: loading
    });
}, function (dispatch) {
    return {
        getAccountSubscriptions: function getAccountSubscriptions(username) {
            return dispatch(_FetchDataSaga.actions.getSubscriptions(username));
        }
    };
})(SubscriptionsList);