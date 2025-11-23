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

var _TimeAgoWrapper = require('app/components/elements/TimeAgoWrapper');

var _TimeAgoWrapper2 = _interopRequireDefault(_TimeAgoWrapper);

var _Icon = require('app/components/elements/Icon');

var _Icon2 = _interopRequireDefault(_Icon);

var _reactRedux = require('react-redux');

var _Reblog = require('app/components/elements/Reblog');

var _Reblog2 = _interopRequireDefault(_Reblog);

var _Voting = require('app/components/elements/Voting');

var _Voting2 = _interopRequireDefault(_Voting);

var _Accessors = require('app/utils/Accessors');

var _ExtractContent = require('app/utils/ExtractContent');

var _VotesAndComments = require('app/components/elements/VotesAndComments');

var _VotesAndComments2 = _interopRequireDefault(_VotesAndComments);

var _immutable = require('immutable');

var _Author = require('app/components/elements/Author');

var _Author2 = _interopRequireDefault(_Author);

var _Tag = require('app/components/elements/Tag');

var _Tag2 = _interopRequireDefault(_Tag);

var _UserNames = require('app/components/elements/UserNames');

var _UserNames2 = _interopRequireDefault(_UserNames);

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _ImageUserBlockList = require('app/utils/ImageUserBlockList');

var _ImageUserBlockList2 = _interopRequireDefault(_ImageUserBlockList);

var _ProxifyUrl = require('app/utils/ProxifyUrl');

var _Userpic = require('app/components/elements/Userpic');

var _Userpic2 = _interopRequireDefault(_Userpic);

var _SearchUserList = require('app/components/cards/SearchUserList');

var _SearchUserList2 = _interopRequireDefault(_SearchUserList);

var _constants = require('shared/constants');

var _StateFunctions = require('app/utils/StateFunctions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CURATOR_VESTS_THRESHOLD = 1.0 * 1000.0 * 1000.0;

// TODO: document why ` ` => `%20` is needed, and/or move to base fucntion
var proxify = function proxify(url, size) {
    return (0, _ProxifyUrl.proxifyImageUrl)(url, size).replace(/ /g, '%20');
};

var vote_weights = function vote_weights(post) {
    var rshares = post.get('net_rshares');
    var dn = post.getIn(['stats', 'flag_weight']);
    var up = Math.max(String(parseInt(rshares / 2, 10)).length - 10, 0);
    return { dn: dn, up: up };
};

var PostSummary = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(PostSummary, _React$Component);

    function PostSummary() {
        (0, _classCallCheck3.default)(this, PostSummary);

        var _this = (0, _possibleConstructorReturn3.default)(this, (PostSummary.__proto__ || (0, _getPrototypeOf2.default)(PostSummary)).call(this));

        _this.state = { revealNsfw: false };
        _this.onRevealNsfw = _this.onRevealNsfw.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(PostSummary, [{
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(props, state) {
            return props.username !== this.props.username || props.nsfwPref !== this.props.nsfwPref || props.blogmode !== this.props.blogmode || state.revealNsfw !== this.state.revealNsfw || props.post != this.props.post;
        }
    }, {
        key: 'onRevealNsfw',
        value: function onRevealNsfw(e) {
            e.preventDefault();
            this.setState({ revealNsfw: true });
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props,
                ignore = _props.ignore,
                hideCategory = _props.hideCategory,
                net_vests = _props.net_vests,
                depth = _props.depth;
            var _props2 = this.props,
                post = _props2.post,
                onClose = _props2.onClose;

            if (!post) return null;
            var reblogged_by = void 0;
            if (post.get('reblogged_by', (0, _immutable.List)()).size > 0) {
                reblogged_by = post.get('reblogged_by').toJS();
            }

            if (reblogged_by) {
                reblogged_by = _react2.default.createElement(
                    'div',
                    { className: 'articles__resteem' },
                    _react2.default.createElement(
                        'p',
                        { className: 'articles__resteem-text' },
                        _react2.default.createElement(
                            'span',
                            { className: 'articles__resteem-icon' },
                            _react2.default.createElement(_Icon2.default, { name: 'reblog' })
                        ),
                        _react2.default.createElement(_UserNames2.default, { names: reblogged_by }),
                        ' ',
                        (0, _counterpart2.default)('postsummary_jsx.resteemed')
                    )
                );
            }

            var gray = post.getIn(['stats', 'gray']);
            var isNsfw = (0, _StateFunctions.hasNsfwTag)(post);
            var isReply = post.get('depth') > 0;
            var showReblog = !isReply;
            var full_power = post.get('percent_steem_dollars') === 0;

            var author = post.get('author');
            var permlink = post.get('permlink');
            var category = post.get('category');
            var post_url = '/' + category + '/@' + author + '/' + permlink;

            var summary = (0, _ExtractContent.extractBodySummary)(post.get('body'), isReply);
            var keyWord = process.env.BROWSER ? decodeURI(window.location.search).split('=')[1] : null;
            var highlightColor = '#00FFC8';
            var content_body = _react2.default.createElement(
                'div',
                { className: 'PostSummary__body entry-content' },
                _react2.default.createElement(_reactRouter.Link, {
                    to: post_url,
                    dangerouslySetInnerHTML: {
                        __html: (0, _ExtractContent.highlightKeyword)(summary, keyWord, highlightColor)
                    }
                })
            );

            var content_title = _react2.default.createElement(
                'h2',
                { className: 'articles__h2 entry-title' },
                _react2.default.createElement(
                    _reactRouter.Link,
                    { to: post_url },
                    isNsfw && _react2.default.createElement(
                        'span',
                        { className: 'nsfw-flag' },
                        'nsfw'
                    ),
                    _react2.default.createElement('span', {
                        dangerouslySetInnerHTML: {
                            __html: (0, _ExtractContent.highlightKeyword)(post.get('title'), keyWord, highlightColor)
                        }
                    })
                )
            );

            // New Post Summary heading
            var summary_header = _react2.default.createElement(
                'div',
                { className: 'articles__summary-header' },
                _react2.default.createElement(
                    'div',
                    { className: 'user' },
                    !isNsfw ? _react2.default.createElement(
                        'div',
                        { className: 'user__col user__col--left' },
                        _react2.default.createElement(
                            'a',
                            { className: 'user__link', href: '/@' + author },
                            _react2.default.createElement(_Userpic2.default, { account: author, size: _Userpic.SIZE_SMALL })
                        )
                    ) : null,
                    _react2.default.createElement(
                        'div',
                        { className: 'user__col user__col--right' },
                        _react2.default.createElement(
                            'span',
                            { className: 'user__name' },
                            _react2.default.createElement(_Author2.default, {
                                post: post,
                                follow: false,
                                hideEditor: true
                            })
                        ),
                        hideCategory || _react2.default.createElement(
                            'span',
                            { className: 'articles__tag-link' },
                            (0, _counterpart2.default)('g.in'),
                            '\xA0',
                            _react2.default.createElement(_Tag2.default, { post: post }),
                            '\xA0\u2022\xA0'
                        ),
                        _react2.default.createElement(
                            _reactRouter.Link,
                            { className: 'timestamp__link', to: post_url },
                            _react2.default.createElement(
                                'span',
                                { className: 'timestamp__time' },
                                this.props.order == 'payout' && _react2.default.createElement(
                                    'span',
                                    null,
                                    'payout '
                                ),
                                _react2.default.createElement(_TimeAgoWrapper2.default, {
                                    date: this.props.order == 'payout' ? post.get('payout_at') : post.get('created'),
                                    className: 'updated'
                                })
                            ),
                            full_power && _react2.default.createElement(
                                'span',
                                {
                                    className: 'articles__icon-100',
                                    title: (0, _counterpart2.default)('g.powered_up_100')
                                },
                                _react2.default.createElement(_Icon2.default, { name: 'steempower' })
                            ),
                            post.getIn(['stats', 'is_pinned'], false) && _react2.default.createElement(
                                'span',
                                { className: 'FeaturedTag' },
                                'Pinned'
                            )
                        )
                    )
                )
            );

            var dots = void 0;
            if (net_vests >= CURATOR_VESTS_THRESHOLD) {
                var _dots = function _dots(cnt) {
                    return cnt > 0 ? '•'.repeat(cnt) : null;
                };

                var _vote_weights = vote_weights(post),
                    up = _vote_weights.up,
                    dn = _vote_weights.dn;

                dots = up || dn ? _react2.default.createElement(
                    'span',
                    { className: 'vote_weights' },
                    _dots(up),
                    _react2.default.createElement(
                        'span',
                        null,
                        _dots(dn)
                    )
                ) : null;
            }

            var summary_footer = _react2.default.createElement(
                'div',
                { className: 'articles__summary-footer' },
                dots,
                _react2.default.createElement(_Voting2.default, { post: post, showList: false }),
                _react2.default.createElement(_VotesAndComments2.default, {
                    post: post,
                    commentsLink: post_url + '#comments'
                }),
                _react2.default.createElement(
                    'span',
                    { className: 'PostSummary__time_author_category' },
                    showReblog && _react2.default.createElement(_Reblog2.default, {
                        author: post.get('author'),
                        permlink: post.get('permlink')
                    })
                )
            );

            var userList = _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(_SearchUserList2.default, { post: post })
            );

            var _props3 = this.props,
                nsfwPref = _props3.nsfwPref,
                username = _props3.username;
            var revealNsfw = this.state.revealNsfw;


            if (isNsfw) {
                if (nsfwPref === 'hide') {
                    // user wishes to hide these posts entirely
                    return null;
                } else if (nsfwPref === 'warn' && !revealNsfw) {
                    // user wishes to be warned, and has not revealed this post
                    return _react2.default.createElement(
                        'article',
                        {
                            className: 'PostSummary hentry',
                            itemScope: true,
                            itemType: 'http://schema.org/blogPost'
                        },
                        _react2.default.createElement(
                            'div',
                            { className: 'PostSummary__nsfw-warning' },
                            summary_header,
                            _react2.default.createElement(
                                'span',
                                { className: 'nsfw-flag' },
                                'nsfw'
                            ),
                            '\xA0\xA0',
                            _react2.default.createElement(
                                'span',
                                {
                                    role: 'button',
                                    onClick: this.onRevealNsfw
                                },
                                _react2.default.createElement(
                                    'a',
                                    null,
                                    (0, _counterpart2.default)('postsummary_jsx.reveal_it')
                                )
                            ),
                            ' ',
                            (0, _counterpart2.default)('g.or') + ' ',
                            username ? _react2.default.createElement(
                                'span',
                                null,
                                (0, _counterpart2.default)('postsummary_jsx.adjust_your'),
                                ' ',
                                _react2.default.createElement(
                                    _reactRouter.Link,
                                    { to: '/@' + username + '/settings' },
                                    (0, _counterpart2.default)('postsummary_jsx.display_preferences')
                                ),
                                '.'
                            ) : _react2.default.createElement(
                                'span',
                                null,
                                _react2.default.createElement(
                                    'a',
                                    { href: _constants.SIGNUP_URL },
                                    (0, _counterpart2.default)('postsummary_jsx.create_an_account')
                                ),
                                ' ',
                                (0, _counterpart2.default)('postsummary_jsx.to_save_your_preferences'),
                                '.'
                            ),
                            summary_footer
                        )
                    );
                }
            }

            var image_link = (0, _ExtractContent.extractImageLink)(post.get('json_metadata'), post.get('body'));
            var thumb = null;
            if (!gray && image_link && !_ImageUserBlockList2.default.includes(author)) {
                // on mobile, we always use blog layout style -- there's no toggler
                // on desktop, we offer a choice of either blog or list
                // if blogmode is false, output an image with a srcset
                // which has the 256x512 for whatever the large breakpoint is where the list layout is used
                // and the 640 for lower than that
                var blogImg = proxify(image_link, '640x480');

                if (this.props.blogmode) {
                    thumb = _react2.default.createElement('img', { className: 'articles__feature-img', src: blogImg });
                } else {
                    var listImg = proxify(image_link, '256x512');
                    thumb = _react2.default.createElement(
                        'picture',
                        { className: 'articles__feature-img' },
                        _react2.default.createElement('source', { srcSet: listImg, media: '(min-width: 1000px)' }),
                        _react2.default.createElement('img', { srcSet: blogImg })
                    );
                }
                thumb = _react2.default.createElement(
                    'span',
                    { className: 'articles__feature-img-container' },
                    thumb
                );
            }

            return depth === 2 ? _react2.default.createElement(
                'div',
                { className: 'articles__summary' },
                userList
            ) : _react2.default.createElement(
                'div',
                { className: 'articles__summary' },
                reblogged_by,
                summary_header,
                _react2.default.createElement(
                    'div',
                    {
                        className: 'articles__content hentry' + (thumb ? ' with-image ' : ' ') + (gray || ignore ? ' downvoted' : ''),
                        itemScope: true,
                        itemType: 'http://schema.org/blogPost'
                    },
                    thumb ? _react2.default.createElement(
                        'div',
                        { className: 'articles__content-block articles__content-block--img' },
                        _react2.default.createElement(
                            _reactRouter.Link,
                            { className: 'articles__link', to: post_url },
                            thumb
                        )
                    ) : null,
                    _react2.default.createElement(
                        'div',
                        { className: 'articles__content-block articles__content-block--text' },
                        content_title,
                        content_body,
                        this.props.blogmode ? null : _react2.default.createElement(
                            'div',
                            { className: 'articles__footer' },
                            summary_footer
                        )
                    ),
                    this.props.blogmode ? summary_footer : null
                )
            );
        }
    }]);
    return PostSummary;
}(_react2.default.Component), _class.propTypes = {
    post: _propTypes2.default.object.isRequired,
    onClose: _propTypes2.default.func,
    nsfwPref: _propTypes2.default.string
}, _temp);
exports.default = (0, _reactRedux.connect)(function (state, props) {
    var post = props.post,
        hideCategory = props.hideCategory,
        nsfwPref = props.nsfwPref;

    var net_vests = state.user.getIn(['current', 'effective_vests'], 0.0);
    return {
        post: post,
        hideCategory: hideCategory,
        username: state.user.getIn(['current', 'username']) || state.offchain.get('account'),
        blogmode: state.app.getIn(['user_preferences', 'blogmode']),
        nsfwPref: nsfwPref,
        net_vests: net_vests
    };
})(PostSummary);