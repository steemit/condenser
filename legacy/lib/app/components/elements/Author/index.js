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

var _class, _temp; /* eslint react/prop-types: 0 */


var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _shouldComponentUpdate = require('app/utils/shouldComponentUpdate');

var _shouldComponentUpdate2 = _interopRequireDefault(_shouldComponentUpdate);

var _Icon = require('app/components/elements/Icon');

var _Icon2 = _interopRequireDefault(_Icon);

var _reactRouter = require('react-router');

var _AuthorDropdown = require('../AuthorDropdown');

var _AuthorDropdown2 = _interopRequireDefault(_AuthorDropdown);

var _Reputation = require('app/components/elements/Reputation');

var _Reputation2 = _interopRequireDefault(_Reputation);

var _AffiliationMap = require('app/utils/AffiliationMap');

var _AffiliationMap2 = _interopRequireDefault(_AffiliationMap);

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _Overlay = require('react-overlays/lib/Overlay');

var _Overlay2 = _interopRequireDefault(_Overlay);

var _UserTitle = require('app/components/elements/UserTitle');

var _UserTitle2 = _interopRequireDefault(_UserTitle);

var _Community = require('app/utils/Community');

var _immutable = require('immutable');

var _reactRedux = require('react-redux');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var string = _propTypes2.default.string,
    bool = _propTypes2.default.bool,
    number = _propTypes2.default.number;


var closers = [];

var fnCloseAll = function fnCloseAll() {
    var close = void 0;
    while (close = closers.shift()) {
        close();
    }
};

var Author = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(Author, _React$Component);

    function Author() {
        var _ref;

        (0, _classCallCheck3.default)(this, Author);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        var _this = (0, _possibleConstructorReturn3.default)(this, (_ref = Author.__proto__ || (0, _getPrototypeOf2.default)(Author)).call.apply(_ref, [this].concat(args)));

        _this.toggle = function (e) {
            if (!(e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                e.stopPropagation();
                var show = !_this.state.show;
                fnCloseAll();
                if (show) {
                    _this.setState({ show: show });
                    closers.push(_this.close);
                }
            }
        };

        _this.close = function () {
            _this.setState({
                show: false
            });
        };

        _this.shouldComponentUpdate = (0, _shouldComponentUpdate2.default)(_this, 'Author');

        _this.state = { show: false };
        _this.toggle = _this.toggle.bind(_this);
        _this.close = _this.close.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(Author, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            if (!this.authorProfileLink) {
                return;
            }
            var node = _reactDom2.default.findDOMNode(this.authorProfileLink);
            if (node.addEventListener) {
                node.addEventListener('click', this.toggle, false);
            } else {
                node.attachEvent('click', this.toggle, false);
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            if (!this.authorProfileLink) {
                return;
            }
            var node = _reactDom2.default.findDOMNode(this.authorProfileLink);
            if (node.removeEventListener) {
                node.removeEventListener('click', this.toggle);
            } else {
                node.detachEvent('click', this.toggle);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                author = _props.author,
                authorRep = _props.authorRep,
                username = _props.username,
                follow = _props.follow,
                mute = _props.mute,
                showAffiliation = _props.showAffiliation,
                blacklists = _props.blacklists,
                community = _props.community,
                permlink = _props.permlink,
                role = _props.role,
                title = _props.title;


            var warn = blacklists && _react2.default.createElement(
                'span',
                { className: 'account_warn', title: blacklists.join(', ') },
                '(',
                blacklists.length,
                ')'
            );

            var userTitle = _react2.default.createElement(
                'span',
                null,
                community && _react2.default.createElement(_UserTitle2.default, {
                    username: username,
                    community: community,
                    author: author,
                    permlink: permlink,
                    role: role,
                    title: title,
                    hideEdit: this.props.hideEditor
                }),
                showAffiliation && _AffiliationMap2.default[author] ? _react2.default.createElement(
                    'span',
                    { className: 'affiliation' },
                    (0, _counterpart2.default)('g.affiliation_' + _AffiliationMap2.default[author])
                ) : null
            );

            if (!(follow || mute)) {
                return _react2.default.createElement(
                    'span',
                    {
                        className: 'author',
                        itemProp: 'author',
                        itemScope: true,
                        itemType: 'http://schema.org/Person'
                    },
                    _react2.default.createElement(
                        'strong',
                        null,
                        _react2.default.createElement(
                            _reactRouter.Link,
                            { to: '/@' + author },
                            author
                        )
                    ),
                    ' ',
                    _react2.default.createElement(_Reputation2.default, { value: authorRep }),
                    warn,
                    userTitle
                );
            }

            return _react2.default.createElement(
                'span',
                { className: 'Author' },
                _react2.default.createElement(
                    'span',
                    {
                        itemProp: 'author',
                        itemScope: true,
                        itemType: 'http://schema.org/Person'
                    },
                    _react2.default.createElement(
                        'strong',
                        null,
                        _react2.default.createElement(
                            _reactRouter.Link,
                            {
                                ref: function ref(link) {
                                    _this2.authorProfileLink = link;
                                },
                                to: '/@' + author
                            },
                            author,
                            ' ',
                            _react2.default.createElement(_Reputation2.default, { value: authorRep }),
                            _react2.default.createElement(_Icon2.default, { name: 'dropdown-arrow' })
                        )
                    ),
                    warn,
                    userTitle
                ),
                _react2.default.createElement(
                    _Overlay2.default,
                    {
                        show: this.state.show,
                        onHide: this.close,
                        placement: 'bottom',
                        container: this,
                        target: function target() {
                            return (0, _reactDom.findDOMNode)(_this2.target);
                        },
                        rootClose: true
                    },
                    _react2.default.createElement(_AuthorDropdown2.default, {
                        author: author,
                        follow: follow,
                        mute: mute,
                        authorRep: authorRep,
                        username: username,
                        blacklists: blacklists
                    })
                )
            );
        }
    }]);
    return Author;
}(_react2.default.Component), _class.propTypes = {
    author: string.isRequired,
    hideEditor: bool,
    follow: bool,
    mute: bool,
    authorRep: number,
    showAffiliation: bool,
    role: string,
    title: string,
    community: string
}, _class.defaultProps = {
    follow: true,
    mute: true,
    showAffiliation: false,
    role: '',
    title: '',
    community: ''
}, _temp);
exports.default = (0, _reactRedux.connect)(function (state, props) {
    var post = props.post;

    var blacklists = post.get('blacklists', (0, _immutable.List)()).toJS();
    return {
        follow: typeof props.follow === 'undefined' ? true : props.follow,
        mute: typeof props.mute === 'undefined' ? props.follow : props.mute,
        username: state.user.getIn(['current', 'username']),
        authorRep: post.get('author_reputation'),
        author: post.get('author'),
        community: post.get('community'), // UserTitle
        permlink: post.get('permlink'), // UserTitle
        role: post.get('author_role'), // UserTitle
        title: post.get('author_title'), // UserTitle
        blacklists: blacklists.length > 0 ? blacklists : null
    };
})(Author);