'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

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

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _immutable = require('immutable');

var _UserReducer = require('app/redux/UserReducer');

var userActions = _interopRequireWildcard(_UserReducer);

var _FetchDataSaga = require('app/redux/FetchDataSaga');

var _PostSummary = require('app/components/cards/PostSummary');

var _PostSummary2 = _interopRequireDefault(_PostSummary);

var _Post = require('app/components/pages/Post');

var _Post2 = _interopRequireDefault(_Post);

var _LoadingIndicator = require('app/components/elements/LoadingIndicator');

var _LoadingIndicator2 = _interopRequireDefault(_LoadingIndicator);

var _lodash = require('lodash.debounce');

var _lodash2 = _interopRequireDefault(_lodash);

var _DomUtils = require('app/utils/DomUtils');

var _Icon = require('app/components/elements/Icon');

var _Icon2 = _interopRequireDefault(_Icon);

var _VideoAd = require('app/components/elements/VideoAd');

var _VideoAd2 = _interopRequireDefault(_VideoAd);

var _SearchUserList = require('app/components/cards/SearchUserList');

var _SearchUserList2 = _interopRequireDefault(_SearchUserList);

var _shouldComponentUpdate = require('app/utils/shouldComponentUpdate');

var _shouldComponentUpdate2 = _interopRequireDefault(_shouldComponentUpdate);

var _index = require('axios/index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function topPosition(domElt) {
    if (!domElt) {
        return 0;
    }
    return domElt.offsetTop + topPosition(domElt.offsetParent);
}

var PostsList = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(PostsList, _React$Component);

    function PostsList() {
        (0, _classCallCheck3.default)(this, PostsList);

        var _this = (0, _possibleConstructorReturn3.default)(this, (PostsList.__proto__ || (0, _getPrototypeOf2.default)(PostsList)).call(this));

        _this.scrollListener = (0, _lodash2.default)(function () {
            var el = window.document.getElementById('posts_list');
            if (!el) return;
            var scrollTop = window.pageYOffset !== undefined ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
            if (topPosition(el) + el.offsetHeight - scrollTop - window.innerHeight < 10) {
                var _this$props = _this.props,
                    loadMore = _this$props.loadMore,
                    posts = _this$props.posts,
                    total_result = _this$props.total_result;

                if (loadMore && posts.size > 0 /*&& posts.size < total_result*/) loadMore();
            }

            // Detect if we're in mobile mode (renders larger preview imgs)
            var mq = window.matchMedia('screen and (max-width: 39.9375em)');
            if (mq.matches) {
                _this.setState({ thumbSize: 'mobile' });
            } else {
                _this.setState({ thumbSize: 'desktop' });
            }
        }, 150);

        _this.state = {
            thumbSize: 'desktop',
            showNegativeComments: false,
            blist: []
        };
        _this.scrollListener = _this.scrollListener.bind(_this);
        _this.onBackButton = _this.onBackButton.bind(_this);
        _this.shouldComponentUpdate = (0, _shouldComponentUpdate2.default)(_this, 'PostsList');
        return _this;
    }

    (0, _createClass3.default)(PostsList, [{
        key: 'componentWillMount',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function componentWillMount() {
                return _ref.apply(this, arguments);
            }

            return componentWillMount;
        }()
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.attachScrollListener();
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.detachScrollListener();
            window.removeEventListener('popstate', this.onBackButton);
            window.removeEventListener('keydown', this.onBackButton);
        }
    }, {
        key: 'onBackButton',
        value: function onBackButton(e) {
            if ('keyCode' in e && e.keyCode !== 27) return;
            window.removeEventListener('popstate', this.onBackButton);
            window.removeEventListener('keydown', this.onBackButton);
        }
    }, {
        key: 'fetchIfNeeded',
        value: function fetchIfNeeded() {
            this.scrollListener();
        }
    }, {
        key: 'attachScrollListener',
        value: function attachScrollListener() {
            window.addEventListener('scroll', this.scrollListener, {
                capture: false,
                passive: true
            });
            window.addEventListener('resize', this.scrollListener, {
                capture: false,
                passive: true
            });
            this.scrollListener();
        }
    }, {
        key: 'detachScrollListener',
        value: function detachScrollListener() {
            window.removeEventListener('scroll', this.scrollListener);
            window.removeEventListener('resize', this.scrollListener);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                posts = _props.posts,
                loading = _props.loading,
                category = _props.category,
                order = _props.order,
                nsfwPref = _props.nsfwPref,
                hideCategory = _props.hideCategory,
                blacklist = _props.blacklist,
                depth = _props.depth;
            var _state = this.state,
                thumbSize = _state.thumbSize,
                blist = _state.blist;


            var renderSummary = function renderSummary(items) {
                return items.map(function (post, i) {
                    var ps = _react2.default.createElement(_PostSummary2.default, {
                        post: post,
                        thumbSize: thumbSize,
                        nsfwPref: nsfwPref,
                        hideCategory: hideCategory,
                        order: order,
                        depth: depth
                    });

                    var summary = [];
                    summary.push(_react2.default.createElement(
                        'li',
                        { key: i },
                        ps
                    ));

                    var every = _this2.props.adSlots.in_feed_1.every;
                    if (false && _this2.props.videoAdsEnabled && i === 4) {
                        summary.push(_react2.default.createElement(
                            'div',
                            { key: 'id-' + i },
                            _react2.default.createElement(
                                'div',
                                { className: 'articles__content-block--ad video-ad' },
                                _react2.default.createElement(_VideoAd2.default, { id: 'bsa-zone_1572296522077-3_123456' })
                            )
                        ));
                    } else if (_this2.props.shouldSeeAds && i >= every && i % every === 0 && depth !== 2) {
                        summary.push(_react2.default.createElement('div', {
                            key: 'ad-' + i,
                            className: 'articles__content-block--ad'
                        }));
                    }
                    return summary;
                });
            };

            return _react2.default.createElement(
                'div',
                { id: 'posts_list', className: 'PostsList' },
                _react2.default.createElement(
                    'ul',
                    {
                        className: 'PostsList__summaries hfeed',
                        itemScope: true,
                        itemType: 'http://schema.org/blogPosts'
                    },
                    renderSummary(posts)
                ),
                loading && _react2.default.createElement(
                    'center',
                    null,
                    _react2.default.createElement(_LoadingIndicator2.default, {
                        style: { marginBottom: '2rem' },
                        type: 'circle'
                    })
                )
            );
        }
    }]);
    return PostsList;
}(_react2.default.Component), _class.propTypes = {
    posts: _propTypes2.default.object,
    loading: _propTypes2.default.bool.isRequired,
    category: _propTypes2.default.string,
    loadMore: _propTypes2.default.func,
    nsfwPref: _propTypes2.default.string.isRequired
}, _class.defaultProps = {
    loading: false
}, _temp);
exports.default = (0, _reactRedux.connect)(function (state, props) {
    var userPreferences = state.app.get('user_preferences').toJS();
    var nsfwPref = userPreferences.nsfwPref || 'warn';
    var shouldSeeAds = state.app.getIn(['googleAds', 'enabled']);
    var videoAdsEnabled = state.app.getIn(['googleAds', 'videoAdsEnabled']);
    var adSlots = state.app.getIn(['googleAds', 'adSlots']).toJS();

    var current = state.user.get('current');
    var username = current ? current.get('username') : state.offchain.get('account');
    var mutes = state.global.getIn(['follow', 'getFollowingAsync', username, 'ignore_result'], (0, _immutable.List)());
    var blacklist = state.global.get('blacklist');
    var posts = props.posts;

    if (typeof posts === 'undefined') {
        var post_refs = props.post_refs,
            loading = props.loading;

        if (post_refs) {
            posts = [];
            props.post_refs.forEach(function (ref) {
                var post = state.global.getIn(['content', ref]);
                if (!post) {
                    // can occur when deleting a post
                    // console.error('PostsList --> Missing cont key: ' + ref);
                    return;
                }
                var muted = mutes.has(post.get('author'));
                if (!muted) posts.push(post);
            });
            posts = (0, _immutable.List)(posts);
        } else {
            console.error('PostsList: no `posts` or `post_refs`');
        }
    }

    return (0, _extends3.default)({}, props, { //loading,category,order,hideCategory
        posts: posts,
        nsfwPref: nsfwPref,
        shouldSeeAds: shouldSeeAds,
        videoAdsEnabled: videoAdsEnabled,
        adSlots: adSlots,
        blacklist: blacklist
    });
}, function (dispatch) {
    return {
        fetchState: function fetchState(pathname) {
            dispatch(_FetchDataSaga.actions.fetchState({ pathname: pathname }));
        }
    };
})(PostsList);