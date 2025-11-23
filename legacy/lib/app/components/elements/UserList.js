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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _UserListRow = require('app/components/cards/UserListRow');

var _UserListRow2 = _interopRequireDefault(_UserListRow);

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _reactPaginate = require('react-paginate');

var _reactPaginate2 = _interopRequireDefault(_reactPaginate);

var _FetchDataSaga = require('app/redux/FetchDataSaga');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint react/prop-types: 0 */
var PER_PAGE = 20;
var TOTAL = 100;

var UserList = function (_React$Component) {
    (0, _inherits3.default)(UserList, _React$Component);

    function UserList() {
        (0, _classCallCheck3.default)(this, UserList);

        var _this = (0, _possibleConstructorReturn3.default)(this, (UserList.__proto__ || (0, _getPrototypeOf2.default)(UserList)).call(this));

        _this._setHistoryPagePrevious = function () {
            var newIndex = _this.state.historyIndex - PER_PAGE;
            _this.setState({ historyIndex: Math.max(0, newIndex) });
        };

        _this._setHistoryPageNext = function () {
            var newIndex = _this.state.historyIndex + PER_PAGE;
            _this.setState({ historyIndex: Math.max(0, newIndex) });
        };

        _this.state = {
            historyIndex: 0,
            currentPage: 0
        };
        return _this;
    }

    (0, _createClass3.default)(UserList, [{
        key: 'getList',
        value: function getList(currentPage) {
            var _props = this.props,
                getFollowers = _props.getFollowers,
                title = _props.title,
                accountname = _props.accountname;

            getFollowers({ title: title, accountname: accountname, currentPage: currentPage, per_page: PER_PAGE });
        }
    }, {
        key: 'onPageChange',
        value: function onPageChange(node) {
            var currentPage = node.selected;
            this.setState({
                currentPage: currentPage
            });
            this.getList(currentPage);
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps) {
            if (prevProps.title !== this.props.title) {
                this.props.updateFollowersList([]);
                this.getList(0);
                var parent = document.getElementsByClassName('pagination')[0];
                if (!parent) return;
                var lis = parent.getElementsByTagName('li');
                //lis[1].click();
                //lis[this.state.currentPage + 1].classList.remove("pag-active");
                //lis[this.state.currentPage + 1].getElementsByTagName('a')[0].removeAttribute('aria-current');
                //lis[1].classList.add("pag-active");
                //lis[1].getElementsByTagName('a')[0].setAttribute('aria-current','page');
                lis[1].getElementsByTagName('a')[0].click();
                this.setState({
                    currentPage: 0
                });
            }
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.getList(0);
        }
    }, {
        key: 'render',
        value: function render() {
            var historyIndex = this.state.historyIndex;

            var users = this.props.users;
            var title = this.props.title;
            var followersList = this.props.followersList;
            var total = Math.ceil(this.props.profile.getIn(['stats', title === 'Followers' ? 'followers' : 'following'], 0));
            if (!users) {
                return _react2.default.createElement(
                    'div',
                    { className: 'UserList' },
                    _react2.default.createElement(
                        'div',
                        { className: 'row' },
                        _react2.default.createElement(
                            'div',
                            { className: 'column small-12' },
                            _react2.default.createElement(
                                'h3',
                                null,
                                title
                            ),
                            'Loading...'
                        )
                    )
                );
            }

            var idx = 0;
            var user_list = users.map(function (user) {
                return _react2.default.createElement(_UserListRow2.default, { user: user, key: idx++ });
            });
            user_list = user_list.toArray();

            var currentIndex = -1;
            var usersLength = users.size;
            var limitedIndex = Math.min(historyIndex, usersLength - PER_PAGE);
            user_list = user_list.reverse().filter(function () {
                currentIndex++;
                return currentIndex >= limitedIndex && currentIndex < limitedIndex + PER_PAGE;
            });

            var navButtons = _react2.default.createElement(
                'nav',
                null,
                _react2.default.createElement(
                    'ul',
                    {
                        className: 'pager',
                        style: { display: 'flex', justifyContent: 'flex-end' }
                    },
                    _react2.default.createElement(
                        'li',
                        null,
                        _react2.default.createElement(
                            'div',
                            {
                                className: 'button tiny hollow ' + (historyIndex === 0 ? ' disabled' : ''),
                                onClick: this._setHistoryPagePrevious,
                                'aria-label': (0, _counterpart2.default)('g.previous'),
                                style: {
                                    marginRight: 20
                                }
                            },
                            _react2.default.createElement(
                                'span',
                                { 'aria-hidden': 'true' },
                                '\u2190 ',
                                (0, _counterpart2.default)('g.previous')
                            )
                        )
                    ),
                    _react2.default.createElement(
                        'li',
                        null,
                        _react2.default.createElement(
                            'div',
                            {
                                className: 'button tiny hollow ' + (historyIndex >= usersLength - PER_PAGE ? ' disabled' : ''),
                                onClick: historyIndex >= usersLength - PER_PAGE ? null : this._setHistoryPageNext,
                                'aria-label': (0, _counterpart2.default)('g.next')
                            },
                            _react2.default.createElement(
                                'span',
                                { 'aria-hidden': 'true' },
                                (0, _counterpart2.default)('g.next'),
                                ' \u2192'
                            )
                        )
                    )
                )
            );

            return _react2.default.createElement(
                'div',
                { className: 'UserList' },
                _react2.default.createElement(
                    'div',
                    { className: 'row' },
                    _react2.default.createElement(
                        'div',
                        { className: 'column small-12' },
                        _react2.default.createElement(
                            'h3',
                            null,
                            title
                        ),
                        _react2.default.createElement(
                            'table',
                            null,
                            _react2.default.createElement(
                                'tbody',
                                null,
                                followersList && followersList.map(function (item, index) {
                                    var user = item.toJS();
                                    return _react2.default.createElement(_UserListRow2.default, {
                                        user: user,
                                        key: index++,
                                        title: title
                                    });
                                })
                            )
                        ),
                        total > 0 && _react2.default.createElement(_reactPaginate2.default, {
                            previousLabel: (0, _counterpart2.default)('g.previous'),
                            nextLabel: (0, _counterpart2.default)('g.next'),
                            breakLabel: '...',
                            breakClassName: 'break-me',
                            pageCount: Math.ceil(total / PER_PAGE),
                            marginPagesDisplayed: 2,
                            pageRangeDisplayed: 5,
                            onPageChange: this.onPageChange.bind(this),
                            containerClassName: 'pagination',
                            subContainerClassName: 'pages pagination',
                            activeClassName: 'pag-active'
                        })
                    )
                )
            );
        }
    }]);
    return UserList;
}(_react2.default.Component);

exports.default = (0, _reactRedux.connect)(
// mapStateToProps
function (state, ownProps) {
    return (0, _extends3.default)({}, ownProps, {
        followersList: state.global.get('followersList')
        //user_preferences: state.app.get('user_preferences').toJS(),
    });
}, function (dispatch) {
    return {
        getFollowers: function getFollowers(payload) {
            return dispatch(_FetchDataSaga.actions.getFollowers(payload));
        },
        updateFollowersList: function updateFollowersList(list) {
            return dispatch(_FetchDataSaga.actions.updateFollowersList(list));
        }
    };
})(UserList);