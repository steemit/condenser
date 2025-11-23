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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouter = require('react-router');

var _reactRedux = require('react-redux');

var _Icon = require('app/components/elements/Icon');

var _Icon2 = _interopRequireDefault(_Icon);

var _Follow = require('app/components/elements/Follow');

var _Follow2 = _interopRequireDefault(_Follow);

var _Tooltip = require('app/components/elements/Tooltip');

var _Tooltip2 = _interopRequireDefault(_Tooltip);

var _DateJoinWrapper = require('app/components/elements/DateJoinWrapper');

var _DateJoinWrapper2 = _interopRequireDefault(_DateJoinWrapper);

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _Userpic = require('app/components/elements/Userpic');

var _Userpic2 = _interopRequireDefault(_Userpic);

var _AffiliationMap = require('app/utils/AffiliationMap');

var _AffiliationMap2 = _interopRequireDefault(_AffiliationMap);

var _ProxifyUrl = require('app/utils/ProxifyUrl');

var _SanitizedLink = require('app/components/elements/SanitizedLink');

var _SanitizedLink2 = _interopRequireDefault(_SanitizedLink);

var _StateFunctions = require('app/utils/StateFunctions');

var _TimeAgoWrapper = require('app/components/elements/TimeAgoWrapper');

var _TimeAgoWrapper2 = _interopRequireDefault(_TimeAgoWrapper);

var _DropdownMenu = require('app/components/elements/DropdownMenu');

var _DropdownMenu2 = _interopRequireDefault(_DropdownMenu);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var UserProfileHeader = function (_React$Component) {
    (0, _inherits3.default)(UserProfileHeader, _React$Component);

    function UserProfileHeader() {
        (0, _classCallCheck3.default)(this, UserProfileHeader);
        return (0, _possibleConstructorReturn3.default)(this, (UserProfileHeader.__proto__ || (0, _getPrototypeOf2.default)(UserProfileHeader)).apply(this, arguments));
    }

    (0, _createClass3.default)(UserProfileHeader, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                current_user = _props.current_user,
                accountname = _props.accountname,
                profile = _props.profile;

            var isMyAccount = current_user === accountname;

            var _ref = profile ? profile.getIn(['metadata', 'profile']).toJS() : {},
                name = _ref.name,
                location = _ref.location,
                about = _ref.about,
                website = _ref.website,
                cover_image = _ref.cover_image;

            var website_label = website ? website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') : null;

            var cover_image_style = {};
            if (cover_image) {
                cover_image_style = {
                    backgroundImage: 'url(' + (0, _ProxifyUrl.proxifyImageUrl)(cover_image, '2048x512') + ')'
                };
            }

            var _lists = profile.get('blacklists').toJS();
            var blacklists = _lists.length > 0 && _react2.default.createElement(
                _DropdownMenu2.default,
                {
                    title: 'Blacklisted on:',
                    className: 'UserProfile__blacklists',
                    items: _lists.map(function (list) {
                        return { value: list };
                    }),
                    el: 'div'
                },
                _react2.default.createElement(
                    'span',
                    { className: 'account_warn' },
                    '(',
                    _lists.length,
                    ')'
                )
            );

            return _react2.default.createElement(
                'div',
                { className: 'UserProfile__banner row expanded' },
                _react2.default.createElement(
                    'div',
                    { className: 'column', style: cover_image_style },
                    _react2.default.createElement(
                        'div',
                        { style: { position: 'relative' } },
                        _react2.default.createElement(
                            'div',
                            { className: 'UserProfile__buttons hide-for-small-only' },
                            _react2.default.createElement(_Follow2.default, {
                                follower: current_user,
                                following: accountname
                            })
                        )
                    ),
                    _react2.default.createElement(
                        'h1',
                        null,
                        _react2.default.createElement(_Userpic2.default, { account: accountname, hideIfDefault: true }),
                        name || accountname,
                        ' ',
                        _react2.default.createElement(
                            _Tooltip2.default,
                            {
                                t: (0, _counterpart2.default)('user_profile.this_is_users_reputations_score_it_is_based_on_history_of_votes', { name: accountname })
                            },
                            _react2.default.createElement(
                                'span',
                                { className: 'UserProfile__rep' },
                                '(',
                                Math.floor(profile.get('reputation')),
                                ')'
                            )
                        ),
                        blacklists,
                        _AffiliationMap2.default[accountname] ? _react2.default.createElement(
                            'span',
                            { className: 'affiliation' },
                            (0, _counterpart2.default)('g.affiliation_' + _AffiliationMap2.default[accountname])
                        ) : null
                    ),
                    _react2.default.createElement(
                        'div',
                        null,
                        about && _react2.default.createElement(
                            'p',
                            { className: 'UserProfile__bio' },
                            about
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'UserProfile__stats' },
                            _react2.default.createElement(
                                'span',
                                null,
                                _react2.default.createElement(
                                    _reactRouter.Link,
                                    { to: '/@' + accountname + '/followers' },
                                    (0, _counterpart2.default)('user_profile.follower_count', {
                                        count: profile.getIn(['stats', 'followers'], 0)
                                    })
                                )
                            ),
                            _react2.default.createElement(
                                'span',
                                null,
                                _react2.default.createElement(
                                    _reactRouter.Link,
                                    { to: '/@' + accountname },
                                    (0, _counterpart2.default)('user_profile.post_count', {
                                        count: profile.get('post_count', 0)
                                    })
                                )
                            ),
                            _react2.default.createElement(
                                'span',
                                null,
                                _react2.default.createElement(
                                    _reactRouter.Link,
                                    { to: '/@' + accountname + '/followed' },
                                    (0, _counterpart2.default)('user_profile.followed_count', {
                                        count: profile.getIn(['stats', 'following'], 0)
                                    })
                                )
                            ),
                            _react2.default.createElement(
                                'span',
                                null,
                                (0, _StateFunctions.numberWithCommas)(profile.getIn(['stats', 'sp'], 0)),
                                ' ',
                                'SP'
                            ),
                            profile.getIn(['stats', 'rank'], 0) > 0 && _react2.default.createElement(
                                'span',
                                null,
                                '#',
                                (0, _StateFunctions.numberWithCommas)(profile.getIn(['stats', 'rank']))
                            )
                        ),
                        _react2.default.createElement(
                            'p',
                            { className: 'UserProfile__info' },
                            location && _react2.default.createElement(
                                'span',
                                null,
                                _react2.default.createElement(_Icon2.default, { name: 'location' }),
                                ' ',
                                location
                            ),
                            website && _react2.default.createElement(
                                'span',
                                null,
                                _react2.default.createElement(_Icon2.default, { name: 'link' }),
                                ' ',
                                _react2.default.createElement(_SanitizedLink2.default, {
                                    url: website,
                                    text: website_label
                                })
                            ),
                            _react2.default.createElement(_Icon2.default, { name: 'calendar' }),
                            ' ',
                            _react2.default.createElement(_DateJoinWrapper2.default, { date: profile.get('created') }),
                            _react2.default.createElement(_Icon2.default, { name: 'calendar' }),
                            ' Active',
                            ' ',
                            _react2.default.createElement(_TimeAgoWrapper2.default, { date: profile.get('active') })
                        )
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'UserProfile__buttons_mobile show-for-small-only' },
                        _react2.default.createElement(_Follow2.default, {
                            follower: current_user,
                            following: accountname,
                            what: 'blog'
                        })
                    )
                )
            );
        }
    }]);
    return UserProfileHeader;
}(_react2.default.Component); /* eslint react/prop-types: 0 */


exports.default = (0, _reactRedux.connect)(function (state, props) {
    return {
        current_user: state.user.getIn(['current', 'username']),
        accountname: props.accountname,
        profile: props.profile
    };
})(UserProfileHeader);