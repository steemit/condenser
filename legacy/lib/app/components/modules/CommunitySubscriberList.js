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

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _immutable = require('immutable');

var _reactRedux = require('react-redux');

var _CommunityReducer = require('app/redux/CommunityReducer');

var communityActions = _interopRequireWildcard(_CommunityReducer);

var _TransactionReducer = require('app/redux/TransactionReducer');

var transactionActions = _interopRequireWildcard(_TransactionReducer);

var _Community = require('app/utils/Community');

var _UserTitle = require('app/components/elements/UserTitle');

var _UserTitle2 = _interopRequireDefault(_UserTitle);

var _LoadingIndicator = require('app/components/elements/LoadingIndicator');

var _LoadingIndicator2 = _interopRequireDefault(_LoadingIndicator);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CommunitySubscriberList = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(CommunitySubscriberList, _React$Component);

    function CommunitySubscriberList(props) {
        (0, _classCallCheck3.default)(this, CommunitySubscriberList);
        return (0, _possibleConstructorReturn3.default)(this, (CommunitySubscriberList.__proto__ || (0, _getPrototypeOf2.default)(CommunitySubscriberList)).call(this, props));
    }

    (0, _createClass3.default)(CommunitySubscriberList, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            if (this.props.subscribers.length === 0) {
                this.props.fetchSubscribers(this.props.community.name);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props,
                loading = _props.loading,
                subscribers = _props.subscribers,
                community = _props.community,
                viewerRole = _props.viewerRole,
                username = _props.username,
                fetchSubscribers = _props.fetchSubscribers;

            var isMod = _Community.Role.atLeast(viewerRole, 'mod');
            var subs = subscribers.map(function (s, idx) {
                return _react2.default.createElement(
                    'div',
                    { key: idx },
                    _react2.default.createElement(
                        'a',
                        { href: '/@' + s[0] },
                        '@',
                        s[0],
                        ' '
                    ),
                    _react2.default.createElement(_UserTitle2.default, {
                        username: username,
                        community: community.name,
                        author: s[0],
                        permlink: '/',
                        role: s[1],
                        title: s[2],
                        hideEdit: !isMod,
                        onEditSubmit: function onEditSubmit() {
                            return fetchSubscribers(community.name);
                        }
                    })
                );
            });
            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                    'strong',
                    null,
                    'Latest ',
                    community.title,
                    ' Subscribers'
                ),
                _react2.default.createElement('hr', null),
                loading && _react2.default.createElement(
                    'center',
                    null,
                    _react2.default.createElement(_LoadingIndicator2.default, { type: 'circle' })
                ),
                _react2.default.createElement(
                    'div',
                    null,
                    subs
                )
            );
        }
    }]);
    return CommunitySubscriberList;
}(_react2.default.Component), _class.propTypes = {
    community: _propTypes2.default.object.isRequired,
    username: _propTypes2.default.string,
    viewerRole: _propTypes2.default.string.isRequired,
    fetchSubscribers: _propTypes2.default.func.isRequired
}, _class.defaultProps = {
    username: undefined
}, _temp);


var ConnectedCommunitySubscriberList = (0, _reactRedux.connect)(
// mapStateToProps
function (state, ownProps) {
    var subscribers = [];
    var loading = true;
    var viewerRole = 'guest';
    // TODO: re-fetch community upon user loging - currently when a user logs in, at a community page, the context is not updated.
    // viewerRole = state.global.getIn(['community', ownProps.community.name, 'context', 'role'], 'guest');
    var username = state.user.getIn(['current', 'username'], null);
    var communityMember = state.global.getIn(['community', ownProps.community.name, 'team'], (0, _immutable.List)([])).toJS().filter(function (member) {
        return member[0] === username;
    });
    if (username && communityMember.length > 0) {
        viewerRole = communityMember[0][1];
    }
    if (state.community.getIn([ownProps.community.name]) && state.community.getIn([ownProps.community.name, 'subscribers']) && state.community.getIn([ownProps.community.name, 'subscribers']).length > 0) {
        subscribers = state.community.getIn([ownProps.community.name, 'subscribers']);
        loading = state.community.getIn([ownProps.community.name, 'listSubscribersPending']);
    }

    return {
        subscribers: subscribers,
        loading: loading,
        viewerRole: viewerRole,
        username: username
    };
},
// mapDispatchToProps
function (dispatch) {
    return {
        fetchSubscribers: function fetchSubscribers(communityName) {
            return dispatch(communityActions.getCommunitySubscribers(communityName));
        }
    };
})(CommunitySubscriberList);

exports.default = ConnectedCommunitySubscriberList;