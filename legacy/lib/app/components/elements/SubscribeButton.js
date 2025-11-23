'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _LoadingIndicator = require('app/components/elements/LoadingIndicator');

var _LoadingIndicator2 = _interopRequireDefault(_LoadingIndicator);

var _TransactionReducer = require('app/redux/TransactionReducer');

var transactionActions = _interopRequireWildcard(_TransactionReducer);

var _GlobalReducer = require('app/redux/GlobalReducer');

var globalActions = _interopRequireWildcard(_GlobalReducer);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SubscribeButton = function (_React$Component) {
    (0, _inherits3.default)(SubscribeButton, _React$Component);

    function SubscribeButton(props) {
        (0, _classCallCheck3.default)(this, SubscribeButton);

        var _this = (0, _possibleConstructorReturn3.default)(this, (SubscribeButton.__proto__ || (0, _getPrototypeOf2.default)(SubscribeButton)).call(this, props));

        _this.onClick = function (e) {
            e.preventDefault();
            var _this$props = _this.props,
                subscribed = _this$props.subscribed,
                username = _this$props.username;

            var community = _this.props.community.get('name');
            if (username) {
                _this.setState({ loading: true });
            }
            _this.props.toggleSubscribe(!subscribed, community, _this.props.username, function () {
                var key = ['community', community, 'context', 'subscribed'];
                _this.props.stateSet(key, !subscribed);
                _this.setState({ loading: false });
            }, function () {
                _this.setState({ loading: false });
            });
        };

        _this.state = { loading: false };
        return _this;
    }

    (0, _createClass3.default)(SubscribeButton, [{
        key: 'render',
        value: function render() {
            var subscribed = this.props.subscribed;
            var loading = this.state.loading;

            var loader = _react2.default.createElement(_LoadingIndicator2.default, { type: 'dots' });
            var hollowed = subscribed ? ' hollow' : '';
            return _react2.default.createElement(
                'a',
                {
                    href: '#',
                    onClick: this.onClick,
                    className: 'community--subscribe button primary' + hollowed,
                    style: {
                        minWidth: '7em',
                        display: this.props.display || 'inline-block'
                    }
                },
                _react2.default.createElement(
                    'span',
                    null,
                    loading ? loader : subscribed ? 'Joined' : 'Subscribe'
                )
            );
        }
    }]);
    return SubscribeButton;
}(_react2.default.Component);

SubscribeButton.propTypes = {
    username: _propTypes2.default.string,
    subscribed: _propTypes2.default.bool.isRequired,
    community: _propTypes2.default.object.isRequired //TODO: Define this shape
};

exports.default = (0, _reactRedux.connect)(function (state, ownProps) {
    return (0, _extends3.default)({}, ownProps, {
        username: state.user.getIn(['current', 'username']),
        subscribed: state.global.getIn(['community', ownProps.community, 'context', 'subscribed'], false),
        community: state.global.getIn(['community', ownProps.community], {})
    });
}, function (dispatch) {
    return {
        stateSet: function stateSet(key, value) {
            dispatch(globalActions.set({ key: key, value: value }));
        },
        toggleSubscribe: function toggleSubscribe(subscribeToCommunity, community, account, successCallback, errorCallback) {
            var action = 'unsubscribe';
            if (subscribeToCommunity) action = 'subscribe';
            var payload = [action, {
                community: community
            }];
            return dispatch(transactionActions.broadcastOperation({
                type: 'custom_json',
                operation: {
                    id: 'community',
                    required_posting_auths: [account],
                    json: (0, _stringify2.default)(payload)
                },
                successCallback: successCallback,
                errorCallback: errorCallback
            }));
        }
    };
})(SubscribeButton);