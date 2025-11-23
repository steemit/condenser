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

var _reactRouter = require('react-router');

var _Userpic = require('app/components/elements/Userpic');

var _Userpic2 = _interopRequireDefault(_Userpic);

var _Follow = require('app/components/elements/Follow');

var _Follow2 = _interopRequireDefault(_Follow);

var _Reputation = require('app/components/elements/Reputation');

var _Reputation2 = _interopRequireDefault(_Reputation);

var _UserProfilesSaga = require('app/redux/UserProfilesSaga');

var _reactRedux = require('react-redux');

var _StateFunctions = require('app/utils/StateFunctions');

var _TimeAgoWrapper = require('app/components/elements/TimeAgoWrapper');

var _TimeAgoWrapper2 = _interopRequireDefault(_TimeAgoWrapper);

var _DateJoinWrapper = require('app/components/elements/DateJoinWrapper');

var _DateJoinWrapper2 = _interopRequireDefault(_DateJoinWrapper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AuthorDropdown = (_temp = _class = function (_Component) {
    (0, _inherits3.default)(AuthorDropdown, _Component);

    function AuthorDropdown() {
        (0, _classCallCheck3.default)(this, AuthorDropdown);
        return (0, _possibleConstructorReturn3.default)(this, (AuthorDropdown.__proto__ || (0, _getPrototypeOf2.default)(AuthorDropdown)).apply(this, arguments));
    }

    (0, _createClass3.default)(AuthorDropdown, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            var _props = this.props,
                profile = _props.profile,
                fetchProfile = _props.fetchProfile,
                author = _props.author,
                username = _props.username;

            if (!profile) fetchProfile(author, username);
        }
    }, {
        key: 'render',
        value: function render() {
            var _props2 = this.props,
                author = _props2.author,
                simple = _props2.simple,
                profile = _props2.profile,
                blacklists = _props2.blacklists;


            if (simple) {
                return _react2.default.createElement(
                    'span',
                    {
                        className: 'author',
                        itemProp: 'author',
                        itemScope: true,
                        itemType: 'http://schema.org/Person'
                    },
                    _react2.default.createElement(
                        _reactRouter.Link,
                        { to: '/@' + author },
                        _react2.default.createElement(
                            'strong',
                            null,
                            author
                        )
                    ),
                    ' ',
                    _react2.default.createElement(_Reputation2.default, { value: this.props.authorRep })
                );
            }

            var _ref = profile ? profile.getIn(['metadata', 'profile']).toJS() : {},
                name = _ref.name,
                about = _ref.about;

            var _ref2 = profile ? profile.getIn(['stats']).toJS() : {},
                following = _ref2.following,
                followers = _ref2.followers,
                sp = _ref2.sp,
                rank = _ref2.rank;

            var _ref3 = profile ? profile.toJS() : {},
                created = _ref3.created,
                active = _ref3.active;

            var spv = void 0;
            var unit = void 0;
            if (sp > 10000) {
                spv = (0, _StateFunctions.numberWithCommas)((sp / 1000.0).toFixed(0));
                unit = _react2.default.createElement(
                    'small',
                    { style: { fontWeight: 'bold', color: '#444' } },
                    'K'
                );
            } else {
                spv = (0, _StateFunctions.numberWithCommas)(sp);
            }

            return _react2.default.createElement(
                'div',
                { className: 'Author__container' },
                _react2.default.createElement(
                    'div',
                    { className: 'Author__dropdown' },
                    _react2.default.createElement(
                        _reactRouter.Link,
                        { to: '/@' + author },
                        _react2.default.createElement(_Userpic2.default, { account: author })
                    ),
                    name && _react2.default.createElement(
                        _reactRouter.Link,
                        { to: '/@' + author, className: 'Author__name' },
                        name
                    ),
                    _react2.default.createElement(
                        _reactRouter.Link,
                        { to: '/@' + author, className: 'Author__username' },
                        '@',
                        author
                    ),
                    _react2.default.createElement(
                        'div',
                        null,
                        _react2.default.createElement(_Follow2.default
                        //className="float-right"
                        , { follower: this.props.username,
                            following: author,
                            what: 'blog',
                            showFollow: this.props.follow,
                            showMute: this.props.mute
                        })
                    ),
                    _react2.default.createElement('div', { className: 'clearfix' }),
                    profile && _react2.default.createElement(
                        'div',
                        {
                            className: 'row',
                            style: {
                                textAlign: 'center',
                                lineHeight: '1em',
                                clear: 'both',
                                marginTop: '12px'
                            }
                        },
                        _react2.default.createElement(
                            'div',
                            { className: 'columns small-4' },
                            (0, _StateFunctions.numberWithCommas)(followers),
                            _react2.default.createElement('br', null),
                            _react2.default.createElement(
                                'small',
                                null,
                                'Followers'
                            )
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'columns small-4' },
                            (0, _StateFunctions.numberWithCommas)(following),
                            _react2.default.createElement('br', null),
                            _react2.default.createElement(
                                'small',
                                null,
                                'Following'
                            )
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'columns small-4' },
                            spv,
                            unit,
                            ' SP',
                            _react2.default.createElement('br', null),
                            _react2.default.createElement(
                                'small',
                                null,
                                rank > 0 ? '#' + (0, _StateFunctions.numberWithCommas)(rank) : ''
                            )
                        )
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'Author__bio' },
                        about
                    ),
                    profile && _react2.default.createElement(
                        'div',
                        { style: { fontSize: '0.8em', textAlign: 'center' } },
                        _react2.default.createElement(_DateJoinWrapper2.default, { date: created }),
                        ' \u2022 last seen',
                        ' ',
                        _react2.default.createElement(_TimeAgoWrapper2.default, { date: active })
                    ),
                    blacklists && _react2.default.createElement(
                        'div',
                        null,
                        _react2.default.createElement('br', null),
                        _react2.default.createElement(
                            'strong',
                            null,
                            'Blacklists'
                        ),
                        blacklists.map(function (item) {
                            return _react2.default.createElement(
                                'div',
                                { key: item },
                                '\u2757\uFE0F ',
                                item
                            );
                        })
                    )
                )
            );
        }
    }]);
    return AuthorDropdown;
}(_react.Component), _class.propTypes = {}, _class.defaultProps = {}, _temp);
exports.default = (0, _reactRedux.connect)(function (state, props) {
    var author = props.author,
        authorRep = props.authorRep,
        username = props.username,
        follow = props.follow,
        mute = props.mute;

    var simple = !(follow || mute);

    return {
        author: author,
        authorRep: authorRep,
        username: username,
        follow: follow,
        mute: mute,
        simple: simple,
        profile: state.userProfiles.getIn(['profiles', author])
    };
}, function (dispatch) {
    return {
        fetchProfile: function fetchProfile(account) {
            var observer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            dispatch(_UserProfilesSaga.actions.fetchProfile({ account: account, observer: observer }));
        }
    };
})(AuthorDropdown);