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

var _class, _temp; /* eslint-disable react/forbid-prop-types */
/* eslint-disable no-undef */
/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/no-static-element-interactions */


var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouter = require('react-router');

var _reactRedux = require('react-redux');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _immutable = require('immutable');

var _Community = require('app/utils/Community');

var _SettingsEditButton = require('app/components/elements/SettingsEditButton');

var _SettingsEditButton2 = _interopRequireDefault(_SettingsEditButton);

var _SubscribeButton = require('app/components/elements/SubscribeButton');

var _SubscribeButton2 = _interopRequireDefault(_SubscribeButton);

var _Icon = require('app/components/elements/Icon');

var _Icon2 = _interopRequireDefault(_Icon);

var _GlobalReducer = require('app/redux/GlobalReducer');

var globalActions = _interopRequireWildcard(_GlobalReducer);

var _UserReducer = require('app/redux/UserReducer');

var userActions = _interopRequireWildcard(_UserReducer);

var _StateFunctions = require('app/utils/StateFunctions');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var nl2br = function nl2br(text) {
    return text.split('\n').map(function (item, key) {
        return _react2.default.createElement(
            'span',
            { key: key },
            item,
            _react2.default.createElement('br', null)
        );
    });
};
var nl2li = function nl2li(text) {
    return text.split('\n').map(function (item, key) {
        return _react2.default.createElement(
            'li',
            { key: key },
            item
        );
    });
};

var CommunityPane = (_temp = _class = function (_Component) {
    (0, _inherits3.default)(CommunityPane, _Component);

    function CommunityPane() {
        (0, _classCallCheck3.default)(this, CommunityPane);
        return (0, _possibleConstructorReturn3.default)(this, (CommunityPane.__proto__ || (0, _getPrototypeOf2.default)(CommunityPane)).apply(this, arguments));
    }

    (0, _createClass3.default)(CommunityPane, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                community = _props.community,
                showRecentSubscribers = _props.showRecentSubscribers,
                showModerationLog = _props.showModerationLog,
                loggedIn = _props.loggedIn,
                showLogin = _props.showLogin;

            var handleSubscriberClick = function handleSubscriberClick() {
                showRecentSubscribers(community);
            };

            var handleModerationLogCLick = function handleModerationLogCLick(e) {
                e.preventDefault();
                showModerationLog(community);
            };

            function teamMembers(members) {
                return members.map(function (row, idx) {
                    var account = '@' + row.get(0);
                    var title = row.get(2);
                    var role = row.get(1);
                    if (role === 'owner') {
                        return null;
                    }
                    return _react2.default.createElement(
                        'div',
                        {
                            key: account + '__' + role,
                            style: { fontSize: '80%' }
                        },
                        _react2.default.createElement(
                            _reactRouter.Link,
                            { to: '/' + account },
                            account
                        ),
                        role && _react2.default.createElement(
                            'span',
                            { className: 'user_role' },
                            ' ',
                            role,
                            ' '
                        ),
                        title && _react2.default.createElement(
                            'span',
                            { className: 'affiliation' },
                            title
                        )
                    );
                });
            }

            var category = community.get('name');
            var viewer_role = community.getIn(['context', 'role'], 'guest');
            var canPost = _Community.Role.canPost(category, viewer_role);

            var checkIfLogin = function checkIfLogin() {
                if (!loggedIn) {
                    return showLogin();
                }
                return _reactRouter.browserHistory.replace('/submit.html?category=' + category);
            };

            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                    'div',
                    { className: 'c-sidebar__module' },
                    _Community.Role.atLeast(viewer_role, 'admin') && _react2.default.createElement(
                        'div',
                        { style: { float: 'right', fontSize: '0.8em' } },
                        _react2.default.createElement(
                            _SettingsEditButton2.default,
                            {
                                community: community.get('name')
                            },
                            'Edit'
                        )
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'c-sidebar__header' },
                        _react2.default.createElement(
                            'h3',
                            { className: 'c-sidebar__h3' },
                            community.get('title')
                        ),
                        community.get('is_nsfw') && _react2.default.createElement(
                            'span',
                            { className: 'affiliation' },
                            'nsfw'
                        )
                    ),
                    _react2.default.createElement(
                        'div',
                        { style: { margin: '-6px 0 12px' } },
                        community.get('about')
                    ),
                    _react2.default.createElement(
                        'div',
                        {
                            className: 'row',
                            style: { textAlign: 'center', lineHeight: '1em' }
                        },
                        _react2.default.createElement(
                            'div',
                            {
                                onClick: handleSubscriberClick,
                                className: 'column small-4 pointer'
                            },
                            (0, _StateFunctions.numberWithCommas)(community.get('subscribers')),
                            _react2.default.createElement('br', null),
                            _react2.default.createElement(
                                'small',
                                null,
                                community.get('subscribers') == 1 ? 'subscriber' : 'subscribers'
                            )
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'column small-4' },
                            '$',
                            (0, _StateFunctions.numberWithCommas)(community.get('sum_pending')),
                            _react2.default.createElement('br', null),
                            _react2.default.createElement(
                                'small',
                                null,
                                'pending',
                                _react2.default.createElement('br', null),
                                'rewards'
                            )
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'column small-4' },
                            (0, _StateFunctions.numberWithCommas)(community.get('num_authors')),
                            _react2.default.createElement('br', null),
                            _react2.default.createElement(
                                'small',
                                null,
                                'active',
                                _react2.default.createElement('br', null),
                                'posters'
                            )
                        )
                    ),
                    _react2.default.createElement(
                        'div',
                        { style: { margin: '12px 0 0' } },
                        community && _react2.default.createElement(_SubscribeButton2.default, {
                            community: community.get('name'),
                            display: 'block'
                        }),
                        canPost && _react2.default.createElement(
                            _reactRouter.Link,
                            {
                                className: 'button primary',
                                style: {
                                    minWidth: '6em',
                                    display: 'block',
                                    margin: '-6px 0 8px'
                                },
                                onClick: checkIfLogin
                            },
                            'New Post'
                        ),
                        !canPost && _react2.default.createElement(
                            'div',
                            {
                                className: 'text-center',
                                style: { marginBottom: '8px' }
                            },
                            _react2.default.createElement(
                                'small',
                                { className: 'text-muted' },
                                _react2.default.createElement(_Icon2.default, { name: 'eye' }),
                                '\xA0 Only approved members can post'
                            )
                        )
                    ),
                    _react2.default.createElement(
                        'div',
                        null,
                        _Community.Role.atLeast(viewer_role, 'mod') && _react2.default.createElement(
                            'div',
                            { style: { float: 'right', fontSize: '0.8em' } },
                            _react2.default.createElement(
                                _reactRouter.Link,
                                { to: '/roles/' + category },
                                'Edit Roles'
                            )
                        ),
                        _react2.default.createElement(
                            'strong',
                            null,
                            'Leadership'
                        ),
                        teamMembers(community.get('team', (0, _immutable.List)())),
                        _react2.default.createElement(
                            'div',
                            { style: { float: 'right', fontSize: '0.8em' } },
                            _react2.default.createElement(
                                'a',
                                { onClick: handleModerationLogCLick },
                                'Activity Log'
                            )
                        )
                    )
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'c-sidebar__module' },
                    community.get('description') && _react2.default.createElement(
                        'div',
                        null,
                        _react2.default.createElement(
                            'strong',
                            null,
                            'Description'
                        ),
                        _react2.default.createElement('br', null),
                        nl2br(community.get('description', 'empty')),
                        _react2.default.createElement('br', null)
                    ),
                    community.get('flag_text') && _react2.default.createElement(
                        'div',
                        null,
                        _react2.default.createElement(
                            'strong',
                            null,
                            'Rules'
                        ),
                        _react2.default.createElement('br', null),
                        _react2.default.createElement(
                            'ol',
                            null,
                            nl2li(community.get('flag_text'))
                        ),
                        _react2.default.createElement('br', null)
                    ),
                    _react2.default.createElement(
                        'div',
                        null,
                        _react2.default.createElement(
                            'strong',
                            null,
                            'Language'
                        ),
                        _react2.default.createElement('br', null),
                        community.get('lang')
                    )
                )
            );
        }
    }]);
    return CommunityPane;
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
})(CommunityPane);