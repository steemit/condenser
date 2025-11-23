'use strict';

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

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

var _reactRedux = require('react-redux');

var _reactRouter = require('react-router');

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _immutable = require('immutable');

var _FetchDataSaga = require('app/redux/FetchDataSaga');

var _shouldComponentUpdate = require('app/utils/shouldComponentUpdate');

var _shouldComponentUpdate2 = _interopRequireDefault(_shouldComponentUpdate);

var _PostsList = require('app/components/cards/PostsList');

var _PostsList2 = _interopRequireDefault(_PostsList);

var _StateFunctions = require('app/utils/StateFunctions');

var _Callout = require('app/components/elements/Callout');

var _Callout2 = _interopRequireDefault(_Callout);

var _GptUtils = require('app/utils/GptUtils');

var _Topics = require('./Topics');

var _Topics2 = _interopRequireDefault(_Topics);

var _SortOrder = require('app/components/elements/SortOrder');

var _SortOrder2 = _interopRequireDefault(_SortOrder);

var _Community = require('app/utils/Community');

var _PostsIndexLayout = require('app/components/pages/PostsIndexLayout');

var _PostsIndexLayout2 = _interopRequireDefault(_PostsIndexLayout);

var _AppReducer = require('app/redux/AppReducer');

var appActions = _interopRequireWildcard(_AppReducer);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// posts_index.empty_feed_1 [-5]
var noFriendsText = _react2.default.createElement(
    'div',
    null,
    'You haven\'t followed anyone yet!',
    _react2.default.createElement('br', null),
    _react2.default.createElement('br', null),
    _react2.default.createElement(
        'span',
        { style: { fontSize: '1.1rem' } },
        _react2.default.createElement(
            _reactRouter.Link,
            { to: '/' },
            'Explore Trending'
        )
    ),
    _react2.default.createElement('br', null),
    _react2.default.createElement('br', null),
    _react2.default.createElement(
        _reactRouter.Link,
        { to: '/welcome' },
        'New users guide'
    )
);

var noCommunitiesText = _react2.default.createElement(
    'div',
    null,
    'You haven\'t joined any active communities yet!',
    _react2.default.createElement('br', null),
    _react2.default.createElement('br', null),
    _react2.default.createElement(
        'span',
        { style: { fontSize: '1.1rem' } },
        _react2.default.createElement(
            _reactRouter.Link,
            { to: '/communities' },
            'Explore Communities'
        )
    )
);

var PostsIndex = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(PostsIndex, _React$Component);

    function PostsIndex() {
        (0, _classCallCheck3.default)(this, PostsIndex);

        var _this = (0, _possibleConstructorReturn3.default)(this, (PostsIndex.__proto__ || (0, _getPrototypeOf2.default)(PostsIndex)).call(this));

        _this.state = {};
        _this.loadMore = _this.loadMore.bind(_this);
        _this.shouldComponentUpdate = (0, _shouldComponentUpdate2.default)(_this, 'PostsIndex');
        return _this;
    }

    (0, _createClass3.default)(PostsIndex, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            var _props = this.props,
                subscriptions = _props.subscriptions,
                getSubscriptions = _props.getSubscriptions,
                username = _props.username,
                category = _props.category,
                order = _props.order;

            this.props.setRouteTag((0, _Community.ifHive)(category), category, order);
            if (!subscriptions && username) getSubscriptions(username);
        }
    }, {
        key: 'componentWillUpdate',
        value: function componentWillUpdate(nextProps) {
            var category = nextProps.category,
                order = nextProps.order;

            if (category !== this.props.category || order !== this.props.order) {
                this.props.setRouteTag((0, _Community.ifHive)(category), category, order);
            }
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps) {
            if (window.innerHeight && window.innerHeight > 3000 && prevProps.posts !== this.props.posts) {
                this.refs.list.fetchIfNeeded();
            }
        }
    }, {
        key: 'loadMore',
        value: function loadMore() {
            var last_post = this.props.posts ? this.props.posts.last() : null;
            if (!last_post) return;
            if (last_post == this.props.pending) return; // if last post is 'pending', its an invalid start token
            var _props2 = this.props,
                username = _props2.username,
                status = _props2.status,
                order = _props2.order,
                category = _props2.category;


            if ((0, _StateFunctions.isFetchingOrRecentlyUpdated)(status, order, category)) return;

            var _last_post$split = last_post.split('/'),
                _last_post$split2 = (0, _slicedToArray3.default)(_last_post$split, 2),
                author = _last_post$split2[0],
                permlink = _last_post$split2[1];

            this.props.requestData({
                author: author,
                permlink: permlink,
                order: order,
                category: category,
                observer: username
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _props3 = this.props,
                topics = _props3.topics,
                subscriptions = _props3.subscriptions,
                enableAds = _props3.enableAds,
                community = _props3.community,
                category = _props3.category,
                account_name = _props3.account_name,
                order = _props3.order,
                posts = _props3.posts,
                username = _props3.username;


            var status = this.props.status ? this.props.status.getIn([category || '', order]) : null;
            var fetching = status && status.fetching || this.props.loading;

            var emptyText = '';
            if (order === 'feed') {
                emptyText = noFriendsText;
            } else if (category === 'my') {
                if (!process.env.BROWSER) {
                    fetching = true;
                } else {
                    emptyText = noCommunitiesText;
                }
            } else if (posts.size === 0) {
                var cat = community ? 'community' //community.get('title')
                : category ? ' #' + category : '';

                if (order == 'payout') emptyText = 'No pending ' + cat + ' posts found. This view only shows posts within 12 - 36 hours of payout.';else if (order == 'created') emptyText = 'No posts in ' + cat + ' yet!';else emptyText = 'No ' + order + ' ' + cat + ' posts found.';
            } else {
                emptyText = 'Nothing here to see...';
            }

            // page title
            var page_title = (0, _counterpart2.default)('g.all_tags');
            if (order === 'feed') {
                if (account_name === this.props.username) {
                    page_title = (0, _counterpart2.default)('g.my_friends');
                } else if (account_name) {
                    page_title = '@' + account_name + "'s " + (0, _counterpart2.default)('g.friends');
                } else {
                    page_title = (0, _counterpart2.default)('g.my_friends');
                }
            } else if (category === 'my') {
                page_title = 'My communities';
            } else if (community) {
                page_title = community.get('title');
            } else if (category) {
                page_title = '#' + category;
            }

            var postsIndexDisplay = _react2.default.createElement(_PostsList2.default, {
                ref: 'list',
                post_refs: posts,
                loading: fetching,
                order: order,
                category: category,
                hideCategory: !!community,
                loadMore: this.loadMore
            });

            if (!fetching && !posts.size) {
                postsIndexDisplay = _react2.default.createElement(
                    _Callout2.default,
                    null,
                    emptyText
                );
            }
            if (!username && posts.size && category === 'my') {
                postsIndexDisplay = _react2.default.createElement(
                    _Callout2.default,
                    null,
                    emptyText
                );
            }
            if (order === 'feed' && !username) {
                postsIndexDisplay = _react2.default.createElement(
                    _Callout2.default,
                    null,
                    emptyText
                );
            }

            return _react2.default.createElement(
                _PostsIndexLayout2.default,
                {
                    category: category,
                    enableAds: enableAds,
                    blogmode: this.props.blogmode
                },
                _react2.default.createElement(
                    'div',
                    { className: 'articles__header row' },
                    _react2.default.createElement(
                        'div',
                        { className: 'small-8 medium-7 large-8 column' },
                        _react2.default.createElement(
                            'h1',
                            { className: 'articles__h1 show-for-mq-large articles__h1--no-wrap' },
                            page_title
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'show-for-mq-large' },
                            community && _react2.default.createElement(
                                'div',
                                {
                                    style: {
                                        fontSize: '80%',
                                        color: 'gray'
                                    }
                                },
                                'Community'
                            ),
                            !community && category && order !== 'feed' && category !== 'my' && _react2.default.createElement(
                                'div',
                                {
                                    style: {
                                        fontSize: '80%',
                                        color: 'gray'
                                    }
                                },
                                'Unmoderated tag'
                            )
                        ),
                        _react2.default.createElement(
                            'span',
                            { className: 'hide-for-mq-large articles__header-select' },
                            _react2.default.createElement(_Topics2.default, {
                                username: this.props.username,
                                current: category,
                                topics: topics,
                                subscriptions: subscriptions,
                                compact: true
                            })
                        )
                    ),
                    order != 'feed' && !(category === 'my' && !posts.size) && _react2.default.createElement(
                        'div',
                        { className: 'small-4 medium-5 large-4 column articles__header-select' },
                        _react2.default.createElement(_SortOrder2.default, {
                            sortOrder: order,
                            topic: category,
                            horizontal: false
                        })
                    )
                ),
                _react2.default.createElement('hr', { className: 'articles__hr' }),
                postsIndexDisplay
            );
        }
    }]);
    return PostsIndex;
}(_react2.default.Component), _class.propTypes = {
    posts: _propTypes2.default.object,
    status: _propTypes2.default.object,
    routeParams: _propTypes2.default.object,
    requestData: _propTypes2.default.func,
    loading: _propTypes2.default.bool,
    username: _propTypes2.default.string,
    blogmode: _propTypes2.default.bool,
    topics: _propTypes2.default.object
}, _temp);


module.exports = {
    path: ':order(/:category)',
    component: (0, _reactRedux.connect)(function (state, ownProps) {
        // route can be e.g. trending/food (order/category);
        //   or, @username/feed (category/order). Branch on presence of `@`.
        var route = ownProps.routeParams;
        var account_name = route.order && route.order[0] == '@' ? route.order.slice(1).toLowerCase() : null;
        var category = account_name ? route.order : route.category ? route.category.toLowerCase() : null;
        var order = account_name ? route.category : route.order || 'trending';

        var hive = (0, _Community.ifHive)(category);
        var community = state.global.getIn(['community', hive], null);

        var enableAds = ownProps.gptEnabled && !_GptUtils.GptUtils.HasBannedTags([category], state.app.getIn(['googleAds', 'gptBannedTags']));

        var key = ['discussion_idx', category || '', order];
        var posts = state.global.getIn(key, (0, _immutable.List)());

        // if 'pending' post is found, prepend it to posts list
        //   (see GlobalReducer RECEIVE_CONTENT)
        var pkey = ['discussion_idx', category || '', '_' + order];
        var pending = state.global.getIn(pkey, null);
        if (pending && !posts.includes(pending)) {
            posts = posts.unshift(pending);
        }
        var username = state.user.getIn(['current', 'username']) || state.offchain.get('account');

        return {
            subscriptions: state.global.getIn(['subscriptions', username]),
            status: state.global.get('status'),
            loading: state.app.get('loading'),
            account_name: account_name,
            category: category,
            order: order,
            posts: posts,
            pending: pending,
            community: community,
            username: username,
            blogmode: state.app.getIn(['user_preferences', 'blogmode']),
            topics: state.global.getIn(['topics'], (0, _immutable.List)()),
            isBrowser: process.env.BROWSER,
            enableAds: enableAds
        };
    }, function (dispatch) {
        return {
            getSubscriptions: function getSubscriptions(account) {
                return dispatch(_FetchDataSaga.actions.getSubscriptions(account));
            },
            requestData: function requestData(args) {
                return dispatch(_FetchDataSaga.actions.requestData(args));
            },
            setRouteTag: function setRouteTag(community, category, order) {
                if (community) {
                    // community
                    dispatch(appActions.setRouteTag({
                        routeTag: 'community_index',
                        params: {
                            community_name: category,
                            order: order
                        }
                    }));
                } else if (category) {
                    dispatch(appActions.setRouteTag({
                        routeTag: 'category',
                        params: {
                            category: category,
                            order: order,
                            is_user_feed: category[0] === '@'
                        }
                    }));
                } else {
                    dispatch(appActions.setRouteTag({
                        routeTag: 'index',
                        params: {
                            order: order
                        }
                    }));
                }
            }
        };
    })(PostsIndex)
};