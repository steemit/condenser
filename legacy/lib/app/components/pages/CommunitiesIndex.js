'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

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

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _immutable = require('immutable');

var _FetchDataSaga = require('app/redux/FetchDataSaga');

var _SubscribeButton = require('app/components/elements/SubscribeButton');

var _SubscribeButton2 = _interopRequireDefault(_SubscribeButton);

var _reactRouter = require('react-router');

var _PostsIndexLayout = require('app/components/pages/PostsIndexLayout');

var _PostsIndexLayout2 = _interopRequireDefault(_PostsIndexLayout);

var _LoadingIndicator = require('app/components/elements/LoadingIndicator');

var _LoadingIndicator2 = _interopRequireDefault(_LoadingIndicator);

var _UserNames = require('app/components/elements/UserNames');

var _UserNames2 = _interopRequireDefault(_UserNames);

var _ElasticSearchInput = require('app/components/elements/ElasticSearchInput');

var _ElasticSearchInput2 = _interopRequireDefault(_ElasticSearchInput);

var _NativeSelect = require('app/components/elements/NativeSelect');

var _NativeSelect2 = _interopRequireDefault(_NativeSelect);

var _Callout = require('app/components/elements/Callout');

var _Callout2 = _interopRequireDefault(_Callout);

var _AppReducer = require('app/redux/AppReducer');

var appActions = _interopRequireWildcard(_AppReducer);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CommunitiesIndex = function (_React$Component) {
    (0, _inherits3.default)(CommunitiesIndex, _React$Component);

    function CommunitiesIndex(props) {
        (0, _classCallCheck3.default)(this, CommunitiesIndex);

        var _this = (0, _possibleConstructorReturn3.default)(this, (CommunitiesIndex.__proto__ || (0, _getPrototypeOf2.default)(CommunitiesIndex)).call(this, props));

        _this.componentWillMount = function () {
            _this.props.setRouteTag();
            _this.props.performSearch(_this.props.username, _this.state.searchQuery, _this.state.searchOrder);
        };

        _this.componentDidUpdate = function (prevProps, prevState) {
            if (prevProps.username !== _this.props.username) {
                _this.props.performSearch(_this.props.username, _this.state.searchQuery, _this.state.searchOrder);
            }
        };

        _this.state = {
            searchQuery: undefined,
            searchOrder: 'rank'
        };
        return _this;
    }

    (0, _createClass3.default)(CommunitiesIndex, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                communities = _props.communities,
                communities_idx = _props.communities_idx,
                username = _props.username,
                walletUrl = _props.walletUrl,
                performSearch = _props.performSearch;

            var ordered = communities_idx.map(function (name) {
                return communities.get(name);
            });

            var sortOptions = [{
                value: 'rank',
                label: 'Rank'
            }, {
                value: 'subs',
                label: 'Subscribers'
            }, {
                value: 'new',
                label: 'New'
            }];

            // if (communities_idx.size === 0) {
            //     return (
            //         <center>
            //             <LoadingIndicator
            //                 style={{ marginBottom: '2rem' }}
            //                 type="circle"
            //             />
            //         </center>
            //     );
            // }

            var role = function role(comm) {
                return comm.context && comm.context.role !== 'guest' && _react2.default.createElement(
                    'span',
                    { className: 'user_role' },
                    comm.context.role
                );
            };

            var communityAdmins = function communityAdmins(admins) {
                if (!admins || admins.length === 0) return;

                return _react2.default.createElement(
                    'div',
                    null,
                    admins.length === 1 ? (0, _counterpart2.default)('g.administrator') + ': ' : (0, _counterpart2.default)('g.administrators') + ': ',
                    _react2.default.createElement(_UserNames2.default, { names: admins })
                );
            };

            var row = function row(comm) {
                var admins = communityAdmins(comm.admins);
                return _react2.default.createElement(
                    'tr',
                    { key: comm.name },
                    _react2.default.createElement(
                        'th',
                        null,
                        _react2.default.createElement(
                            _reactRouter.Link,
                            { className: 'title', to: '/trending/' + comm.name },
                            comm.title
                        ),
                        role(comm),
                        _react2.default.createElement('br', null),
                        comm.about,
                        _react2.default.createElement(
                            'small',
                            null,
                            comm.subscribers,
                            ' subscribers \u2022',
                            ' ',
                            comm.num_authors,
                            ' posters \u2022 ',
                            comm.num_pending,
                            ' ',
                            'posts',
                            admins
                        )
                    ),
                    _react2.default.createElement(
                        'td',
                        null,
                        _react2.default.createElement(_SubscribeButton2.default, { community: comm.name })
                    )
                );
            };

            return _react2.default.createElement(
                _PostsIndexLayout2.default,
                {
                    category: null,
                    enableAds: false,
                    blogmode: false
                },
                _react2.default.createElement(
                    'div',
                    { className: 'CommunitiesIndex c-sidebar__module' },
                    username && _react2.default.createElement(
                        'div',
                        { style: { float: 'right' } },
                        _react2.default.createElement(
                            'a',
                            { href: walletUrl + '/@' + username + '/communities' },
                            'Create a Community'
                        )
                    ),
                    _react2.default.createElement(
                        'h4',
                        null,
                        (0, _counterpart2.default)('g.community_list_header')
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'articles__header row' },
                        _react2.default.createElement(
                            'div',
                            { className: 'small-8 medium-7 large-8 column' },
                            _react2.default.createElement(_ElasticSearchInput2.default, {
                                expanded: true,
                                handleSubmit: function handleSubmit(q) {
                                    _this2.setState({
                                        searchQuery: q
                                    });
                                    performSearch(username, q, _this2.state.searchOrder);
                                },
                                redirect: false
                            })
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'small-4 medium-3 large-4 column' },
                            _react2.default.createElement(_NativeSelect2.default, {
                                options: sortOptions,
                                currentlySelected: this.state.searchOrder,
                                onChange: function onChange(opt) {
                                    _this2.setState({
                                        searchOrder: opt.value
                                    });
                                    performSearch(username, _this2.state.searchQuery, opt.value);
                                }
                            })
                        )
                    ),
                    _react2.default.createElement('hr', null),
                    ordered.size > 0 ? _react2.default.createElement(
                        'table',
                        null,
                        _react2.default.createElement(
                            'tbody',
                            null,
                            ordered.map(function (comm) {
                                return row(comm.toJS());
                            })
                        )
                    ) : _react2.default.createElement(
                        _Callout2.default,
                        null,
                        'Nothing was found.'
                    )
                )
            );
        }
    }]);
    return CommunitiesIndex;
}(_react2.default.Component);

exports.default = CommunitiesIndex;


module.exports = {
    path: 'communities(/:username)',
    component: (0, _reactRedux.connect)(function (state) {
        // Get current sort and query from the url.
        return {
            walletUrl: state.app.get('walletUrl'),
            username: state.user.getIn(['current', 'username']),
            communities: state.global.get('community', (0, _immutable.Map)()),
            communities_idx: state.global.get('community_idx', (0, _immutable.List)())
        };
    }, function (dispatch) {
        return {
            performSearch: function performSearch(observer, query) {
                var sort = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'rank';

                dispatch(_FetchDataSaga.actions.listCommunities({
                    observer: observer,
                    query: query,
                    sort: sort
                }));
            },
            setRouteTag: function setRouteTag() {
                return dispatch(appActions.setRouteTag({ routeTag: 'more_communities' }));
            }
        };
    })(CommunitiesIndex)
};