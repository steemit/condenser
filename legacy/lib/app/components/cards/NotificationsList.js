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

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _immutable = require('immutable');

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

var _Icon = require('app/components/elements/Icon');

var _Icon2 = _interopRequireDefault(_Icon);

var _Userpic = require('app/components/elements/Userpic');

var _Userpic2 = _interopRequireDefault(_Userpic);

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var notificationsIcon = function notificationsIcon(type) {
    var types = {
        reply: 'chatbox',
        reply_post: 'chatbox',
        reply_comment: 'chatbox',
        follow: 'voters',
        set_label: 'pencil2',
        set_role: 'pencil2',
        vote: 'chevron-up-circle',
        error: 'cog',
        reblog: 'reblog',
        mention: 'chatboxes'
    };

    var icon = 'chain';
    if (type in types) {
        icon = types[type];
    } else {
        console.error('no icon for type: ', type);
    }

    return _react2.default.createElement(_Icon2.default, { size: '0_8x', name: icon });
};

var highlightText = function highlightText(text, highlight) {
    if (!highlight) return text;
    var parts = text.split(new RegExp('(' + highlight + ')', 'gi'));
    return _react2.default.createElement(
        'span',
        null,
        ' ',
        parts.map(function (part, i) {
            return _react2.default.createElement(
                'span',
                {
                    key: i,
                    style: part.toLowerCase() === highlight.toLowerCase() ? { fontWeight: 'bold' } : {}
                },
                part
            );
        }),
        ' '
    );
};

var notificationFilter = 'all';

var NotificationsList = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(NotificationsList, _React$Component);

    function NotificationsList() {
        (0, _classCallCheck3.default)(this, NotificationsList);

        var _this = (0, _possibleConstructorReturn3.default)(this, (NotificationsList.__proto__ || (0, _getPrototypeOf2.default)(NotificationsList)).call(this));

        _this.notificationFilterToTypes = {
            replies: ['reply_comment', 'reply'],
            follows: ['follow'],
            upvotes: ['vote'],
            resteems: ['reblog'],
            mentions: ['mention']
        };

        _this.onClickLoadMore = function (e) {
            e.preventDefault();
            var _this$props = _this.props,
                username = _this$props.username,
                notifications = _this$props.notifications,
                getAccountNotifications = _this$props.getAccountNotifications;

            var lastId = notifications.slice(-1)[0].id;
            getAccountNotifications(username, lastId);
        };

        _this.onClickMarkAsRead = function (e) {
            e.preventDefault();
            var _this$props2 = _this.props,
                username = _this$props2.username,
                markAsRead = _this$props2.markAsRead;

            markAsRead(username, new Date().toISOString().slice(0, 19));
        };

        _this.applyFilter = function () {
            var notificationElements = document.getElementsByClassName('notification__item');

            for (var ni = 0; ni < notificationElements.length; ni += 1) {
                var notificationElement = notificationElements[ni];

                if (notificationFilter === 'all') {
                    notificationElement.classList.remove('hide');
                } else if (_this.notificationFilterToTypes.hasOwnProperty(notificationFilter)) {
                    var notificationTypes = _this.notificationFilterToTypes[notificationFilter];
                    var matchType = false;

                    for (var ti = 0; ti < notificationTypes.length; ti += 1) {
                        var notificationType = notificationTypes[ti];
                        if (notificationElement.classList.contains('notification__' + notificationType)) {
                            matchType = true;
                        }
                    }

                    if (matchType === false) {
                        notificationElement.classList.add('hide');
                    } else {
                        notificationElement.classList.remove('hide');
                    }
                }
            }
        };

        _this.onClickFilter = function (e) {
            e.preventDefault();
            var target = e.target;

            var filterElements = document.getElementsByClassName('notification__filter');

            // reset
            for (var fi = 0; fi < filterElements.length; fi += 1) {
                var filterElement = filterElements[fi];
                filterElement.classList.remove('selected');
            }

            target.classList.add('selected');
            notificationFilter = target.dataset.type;
            _this.applyFilter();

            target.blur();
        };

        return _this;
    }

    (0, _createClass3.default)(NotificationsList, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            var _props = this.props,
                username = _props.username,
                getAccountNotifications = _props.getAccountNotifications;

            if (username) {
                getAccountNotifications(username);
            }
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps) {
            var _props2 = this.props,
                username = _props2.username,
                getAccountNotifications = _props2.getAccountNotifications;

            if (prevProps.username !== username) {
                getAccountNotifications(username);
            }
            this.applyFilter();
        }
    }, {
        key: 'render',
        value: function render() {
            var _props3 = this.props,
                notifications = _props3.notifications,
                unreadNotifications = _props3.unreadNotifications,
                isOwnAccount = _props3.isOwnAccount,
                accountName = _props3.accountName,
                isLastPage = _props3.isLastPage,
                notificationActionPending = _props3.notificationActionPending,
                lastRead = _props3.lastRead;


            var renderItem = function renderItem(item) {
                var unRead = Date.parse(lastRead + 'Z') <= Date.parse(item.date + 'Z');
                var usernamePattern = /\B@[a-z0-9\.-]+/gi;
                var mentions = item.msg.match(usernamePattern);
                var participants = mentions ? mentions.map(function (m) {
                    return _react2.default.createElement(
                        'a',
                        { href: '/' + m },
                        _react2.default.createElement(_Userpic2.default, { account: m.substring(1) })
                    );
                }) : null;
                return _react2.default.createElement(
                    'div',
                    {
                        key: item.id,
                        className: 'notification__item flex-body notification__' + item.type,
                        style: {
                            background: 'rgba(225,255,225,' + item.score + '%)'
                        }
                    },
                    _react2.default.createElement(
                        'div',
                        { className: 'flex-row' },
                        mentions && participants && participants[0]
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'flex-column' },
                        _react2.default.createElement(
                            'div',
                            { className: 'notification__message' },
                            _react2.default.createElement(
                                'a',
                                { href: '/' + item.url },
                                highlightText(item.msg, mentions ? mentions[0] : null)
                            )
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'flex-row' },
                            _react2.default.createElement(
                                'div',
                                { className: 'notification__icon' },
                                notificationsIcon(item.type)
                            ),
                            _react2.default.createElement(
                                'div',
                                { className: 'notification__date' },
                                _react2.default.createElement(_TimeAgoWrapper2.default, { date: item.date + 'Z' })
                            )
                        )
                    ),
                    unRead && _react2.default.createElement(
                        'span',
                        { className: 'notification__unread' },
                        '\u2022'
                    )
                );
            };

            return _react2.default.createElement(
                'div',
                { className: '' },
                isOwnAccount && _react2.default.createElement(_ClaimBox2.default, { accountName: accountName }),
                notifications && notifications.length > 0 && !notificationActionPending && _react2.default.createElement(
                    'center',
                    null,
                    _react2.default.createElement('br', null),
                    _react2.default.createElement(
                        'div',
                        { className: 'notification__filter_select' },
                        _react2.default.createElement(
                            'a',
                            {
                                className: (0, _classnames2.default)('notification__filter', {
                                    selected: notificationFilter === 'all'
                                }),
                                role: 'link',
                                'data-type': 'all',
                                tabIndex: 0,
                                onClick: this.onClickFilter
                            },
                            (0, _counterpart2.default)('notificationslist_jsx.all')
                        ),
                        _react2.default.createElement(
                            'a',
                            {
                                className: (0, _classnames2.default)('notification__filter', {
                                    selected: notificationFilter === 'replies'
                                }),
                                role: 'link',
                                'data-type': 'replies',
                                tabIndex: 0,
                                onClick: this.onClickFilter
                            },
                            (0, _counterpart2.default)('notificationslist_jsx.replies')
                        ),
                        _react2.default.createElement(
                            'a',
                            {
                                className: (0, _classnames2.default)('notification__filter', {
                                    selected: notificationFilter === 'mentions'
                                }),
                                role: 'link',
                                'data-type': 'mentions',
                                tabIndex: 0,
                                onClick: this.onClickFilter
                            },
                            (0, _counterpart2.default)('notificationslist_jsx.mentions')
                        ),
                        _react2.default.createElement(
                            'a',
                            {
                                className: (0, _classnames2.default)('notification__filter', {
                                    selected: notificationFilter === 'follows'
                                }),
                                role: 'link',
                                'data-type': 'follows',
                                tabIndex: 0,
                                onClick: this.onClickFilter
                            },
                            (0, _counterpart2.default)('notificationslist_jsx.follows')
                        ),
                        _react2.default.createElement(
                            'a',
                            {
                                className: (0, _classnames2.default)('notification__filter', {
                                    selected: notificationFilter === 'upvotes'
                                }),
                                role: 'link',
                                'data-type': 'upvotes',
                                tabIndex: 0,
                                onClick: this.onClickFilter
                            },
                            (0, _counterpart2.default)('notificationslist_jsx.upvotes')
                        ),
                        _react2.default.createElement(
                            'a',
                            {
                                className: (0, _classnames2.default)('notification__filter', {
                                    selected: notificationFilter === 'resteems'
                                }),
                                role: 'link',
                                'data-type': 'resteems',
                                tabIndex: 0,
                                onClick: this.onClickFilter
                            },
                            (0, _counterpart2.default)('notificationslist_jsx.resteems')
                        )
                    )
                ),
                notifications && notifications.length > 0 && unreadNotifications !== 0 && !notificationActionPending && _react2.default.createElement(
                    'center',
                    null,
                    _react2.default.createElement('br', null),
                    _react2.default.createElement(
                        'a',
                        { href: '#', onClick: this.onClickMarkAsRead },
                        _react2.default.createElement(
                            'strong',
                            null,
                            (0, _counterpart2.default)('notificationslist_jsx.mark_all_as_read')
                        )
                    ),
                    _react2.default.createElement('br', null)
                ),
                (notificationActionPending || !process.env.BROWSER) && _react2.default.createElement(
                    'center',
                    null,
                    _react2.default.createElement(_LoadingIndicator2.default, { type: 'circle' })
                ),
                notifications && notifications.length > 0 && _react2.default.createElement(
                    'div',
                    { style: { lineHeight: '1rem' } },
                    notifications.map(function (item) {
                        return renderItem(item);
                    })
                ),
                !notifications && !notificationActionPending && process.env.BROWSER && _react2.default.createElement(
                    _Callout2.default,
                    null,
                    'Welcome! You don\'t have any notifications yet.'
                ),
                !notificationActionPending && notifications && !isLastPage && _react2.default.createElement(
                    'center',
                    null,
                    _react2.default.createElement('br', null),
                    _react2.default.createElement(
                        'a',
                        { href: '#', onClick: this.onClickLoadMore },
                        _react2.default.createElement(
                            'strong',
                            null,
                            (0, _counterpart2.default)('notificationslist_jsx.load_more')
                        )
                    )
                )
            );
        }
    }]);
    return NotificationsList;
}(_react2.default.Component), _class.propTypes = {
    notifications: _propTypes2.default.arrayOf(_propTypes2.default.shape({
        id: _propTypes2.default.number,
        type: _propTypes2.default.string,
        score: _propTypes2.default.number,
        date: _propTypes2.default.date,
        msg: _propTypes2.default.string,
        url: _propTypes2.default.url
    })),
    isLastPage: _propTypes2.default.bool,
    username: _propTypes2.default.string.isRequired,
    markAsRead: _propTypes2.default.func.isRequired,
    unreadNotifications: _propTypes2.default.number,
    notificationActionPending: _propTypes2.default.bool,
    lastRead: _propTypes2.default.string.isRequired
}, _class.defaultProps = {
    notifications: [],
    unreadNotifications: 0,
    notificationActionPending: false,
    isLastPage: false
}, _temp);
exports.default = (0, _reactRedux.connect)(function (state, props) {
    var accountName = props.username;
    var isOwnAccount = state.user.getIn(['current', 'username'], '') == accountName;
    var notifications = state.global.getIn(['notifications', accountName, 'notifications'], (0, _immutable.List)()).toJS();
    var unreadNotifications = state.global.getIn(['notifications', accountName, 'unreadNotifications', 'unread'], 0);
    var lastRead = state.global.getIn(['notifications', accountName, 'unreadNotifications', 'lastread'], '');
    var isNotificationsLastPage = state.global.getIn(['notifications', accountName, 'isLastPage'], null);
    return (0, _extends3.default)({}, props, {
        isOwnAccount: isOwnAccount,
        accountName: accountName,
        unreadNotifications: unreadNotifications,
        notificationActionPending: state.global.getIn(['notifications', 'loading']),
        lastRead: lastRead,
        notifications: notifications,
        isLastPage: isNotificationsLastPage
    });
}, function (dispatch) {
    return {
        getAccountNotifications: function getAccountNotifications(username, last_id) {
            var query = {
                account: username,
                limit: 50
            };
            if (last_id) {
                query.last_id = last_id;
            }
            return dispatch(_FetchDataSaga.actions.getAccountNotifications(query));
        },
        markAsRead: function markAsRead(username, timeNow) {
            var successCallback = function successCallback(user, time) {
                setTimeout(function () {
                    dispatch(globalActions.receiveUnreadNotifications({
                        name: user,
                        unreadNotifications: {
                            lastread: time,
                            unread: 0
                        }
                    }));
                    dispatch(globalActions.notificationsLoading(false));
                }, 6000);
            };

            return dispatch(_FetchDataSaga.actions.markNotificationsAsRead({
                username: username,
                timeNow: timeNow,
                successCallback: successCallback
            }));
        }
    };
})(NotificationsList);