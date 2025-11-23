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

var _class, _temp; /* eslint-disable no-undef */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable jsx-a11y/no-static-element-interactions */


var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouter = require('react-router');

var _reactRedux = require('react-redux');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _Community = require('app/utils/Community');

var _SettingsEditButton = require('app/components/elements/SettingsEditButton');

var _SettingsEditButton2 = _interopRequireDefault(_SettingsEditButton);

var _SubscribeButton = require('app/components/elements/SubscribeButton');

var _SubscribeButton2 = _interopRequireDefault(_SubscribeButton);

var _GlobalReducer = require('app/redux/GlobalReducer');

var globalActions = _interopRequireWildcard(_GlobalReducer);

var _UserReducer = require('app/redux/UserReducer');

var userActions = _interopRequireWildcard(_UserReducer);

var _StateFunctions = require('app/utils/StateFunctions');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CommunityPaneMobile = (_temp = _class = function (_Component) {
    (0, _inherits3.default)(CommunityPaneMobile, _Component);

    function CommunityPaneMobile() {
        (0, _classCallCheck3.default)(this, CommunityPaneMobile);
        return (0, _possibleConstructorReturn3.default)(this, (CommunityPaneMobile.__proto__ || (0, _getPrototypeOf2.default)(CommunityPaneMobile)).apply(this, arguments));
    }

    (0, _createClass3.default)(CommunityPaneMobile, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                community = _props.community,
                showRecentSubscribers = _props.showRecentSubscribers,
                showModerationLog = _props.showModerationLog,
                showLogin = _props.showLogin;

            var handleSubscriberClick = function handleSubscriberClick() {
                showRecentSubscribers(community);
            };
            var handleModerationLogCLick = function handleModerationLogCLick(e) {
                e.preventDefault();
                showModerationLog(community);
            };
            var category = community.get('name');
            var viewer_role = community.getIn(['context', 'role'], 'guest');
            var canPost = _Community.Role.canPost(category, viewer_role);

            var settings = _Community.Role.atLeast(viewer_role, 'admin') && _react2.default.createElement(
                _SettingsEditButton2.default,
                { community: community.get('name') },
                'Settings'
            );

            var roles = _Community.Role.atLeast(viewer_role, 'mod') && _react2.default.createElement(
                _reactRouter.Link,
                { to: '/roles/' + category },
                'Roles'
            );

            var subs = community.get('subscribers');

            var checkIfLogin = function checkIfLogin() {
                if (!_this2.props.loggedIn) {
                    return showLogin();
                }
                return _reactRouter.browserHistory.replace('/submit.html?category=' + category);
            };

            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                    'div',
                    { className: 'c-sidebar__module CommunityPaneMobile' },
                    _react2.default.createElement(
                        'div',
                        {
                            className: 'row',
                            style: { textAlign: 'center', lineHeight: '1em' }
                        },
                        _react2.default.createElement(
                            'div',
                            {
                                className: 'column large-10 medium-8 small-12',
                                style: { textAlign: 'left' }
                            },
                            roles && _react2.default.createElement(
                                'div',
                                { style: { float: 'right' } },
                                'Mod',
                                ': ',
                                roles,
                                settings && _react2.default.createElement(
                                    'span',
                                    null,
                                    ' / ',
                                    settings
                                )
                            ),
                            _react2.default.createElement(
                                'h3',
                                { className: 'c-sidebar__h3' },
                                community.get('title')
                            ),
                            _react2.default.createElement(
                                'div',
                                {
                                    style: {
                                        margin: '-14px 0 8px',
                                        opacity: '0.65'
                                    }
                                },
                                _react2.default.createElement(
                                    'span',
                                    {
                                        onClick: handleSubscriberClick,
                                        className: 'pointer'
                                    },
                                    (0, _StateFunctions.numberWithCommas)(subs),
                                    subs == 1 ? ' subscriber' : ' subscribers'
                                ),
                                _react2.default.createElement(
                                    'div',
                                    {
                                        style: {
                                            float: 'right',
                                            fontSize: '0.8em'
                                        }
                                    },
                                    _react2.default.createElement(
                                        'a',
                                        { onClick: handleModerationLogCLick },
                                        'Activity Log'
                                    )
                                ),
                                '\xA0\xA0\u2022\xA0\xA0',
                                (0, _StateFunctions.numberWithCommas)(community.get('num_authors')),
                                ' ',
                                'active'
                            ),
                            community.get('is_nsfw') && _react2.default.createElement(
                                'span',
                                { className: 'affiliation' },
                                'nsfw'
                            ),
                            _react2.default.createElement(
                                'div',
                                { style: { margin: '0 0 12px' } },
                                community.get('about')
                            )
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'column large-2 medium-4 small-12' },
                            _react2.default.createElement(
                                'span',
                                {
                                    style: {
                                        display: 'inline-block',
                                        margin: '0 4px'
                                    }
                                },
                                _react2.default.createElement(_SubscribeButton2.default, {
                                    community: community.get('name')
                                })
                            ),
                            canPost && _react2.default.createElement(
                                'span',
                                {
                                    style: {
                                        display: 'inline-block',
                                        margin: '0 4px'
                                    }
                                },
                                _react2.default.createElement(
                                    _reactRouter.Link,
                                    {
                                        className: 'button primary',
                                        style: { minWidth: '7em' },
                                        onClick: checkIfLogin
                                    },
                                    'Post'
                                )
                            )
                        )
                    )
                )
            );
        }
    }]);
    return CommunityPaneMobile;
}(_react.Component), _class.propTypes = {
    community: _propTypes2.default.object.isRequired,
    showRecentSubscribers: _propTypes2.default.func.isRequired,
    showModerationLog: _propTypes2.default.func.isRequired
}, _temp);
exports.default = (0, _reactRedux.connect)(
// mapStateToProps
function (state, ownProps) {
    return {
        community: ownProps.community,
        loggedIn: !!state.user.getIn(['current', 'username'])
    };
},
// mapDispatchToProps
function (dispatch) {
    return {
        showLogin: function showLogin(e) {
            if (e) e.preventDefault();
            dispatch(userActions.showLogin({ type: 'basic' }));
        },
        showRecentSubscribers: function showRecentSubscribers(community) {
            dispatch(globalActions.showDialog({
                name: 'communitySubscribers',
                params: { community: community }
            }));
        },
        showModerationLog: function showModerationLog(community) {
            dispatch(globalActions.showDialog({
                name: 'communityModerationLog',
                params: { community: community }
            }));
        }
    };
})(CommunityPaneMobile);