'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

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

var _class, _temp, _initialiseProps;

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

var _TransactionReducer = require('app/redux/TransactionReducer');

var transactionActions = _interopRequireWildcard(_TransactionReducer);

var _GlobalReducer = require('app/redux/GlobalReducer');

var globalActions = _interopRequireWildcard(_GlobalReducer);

var _Voting = require('app/components/elements/Voting');

var _Voting2 = _interopRequireDefault(_Voting);

var _Reblog = require('app/components/elements/Reblog');

var _Reblog2 = _interopRequireDefault(_Reblog);

var _MarkdownViewer = require('app/components/cards/MarkdownViewer');

var _MarkdownViewer2 = _interopRequireDefault(_MarkdownViewer);

var _ReplyEditor = require('app/components/elements/ReplyEditor');

var _ReplyEditor2 = _interopRequireDefault(_ReplyEditor);

var _Accessors = require('app/utils/Accessors');

var _ExtractContent = require('app/utils/ExtractContent');

var _Tag = require('app/components/elements/Tag');

var _Tag2 = _interopRequireDefault(_Tag);

var _TagList = require('app/components/elements/TagList');

var _TagList2 = _interopRequireDefault(_TagList);

var _Author = require('app/components/elements/Author');

var _Author2 = _interopRequireDefault(_Author);

var _ParsersAndFormatters = require('app/utils/ParsersAndFormatters');

var _DMCAList = require('app/utils/DMCAList');

var _DMCAList2 = _interopRequireDefault(_DMCAList);

var _ShareMenu = require('app/components/elements/ShareMenu');

var _ShareMenu2 = _interopRequireDefault(_ShareMenu);

var _MuteButton = require('app/components/elements/MuteButton');

var _MuteButton2 = _interopRequireDefault(_MuteButton);

var _FlagButton = require('app/components/elements/FlagButton');

var _FlagButton2 = _interopRequireDefault(_FlagButton);

var _ServerApiClient = require('app/utils/ServerApiClient');

var _Userpic = require('app/components/elements/Userpic');

var _Userpic2 = _interopRequireDefault(_Userpic);

var _client_config = require('app/client_config');

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _userIllegalContent = require('app/utils/userIllegalContent');

var _userIllegalContent2 = _interopRequireDefault(_userIllegalContent);

var _ImageUserBlockList = require('app/utils/ImageUserBlockList');

var _ImageUserBlockList2 = _interopRequireDefault(_ImageUserBlockList);

var _LoadingIndicator = require('app/components/elements/LoadingIndicator');

var _LoadingIndicator2 = _interopRequireDefault(_LoadingIndicator);

var _StateFunctions = require('app/utils/StateFunctions');

var _ContentEditedWrapper = require('../elements/ContentEditedWrapper');

var _ContentEditedWrapper2 = _interopRequireDefault(_ContentEditedWrapper);

var _Community = require('app/utils/Community');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function TimeAuthorCategory(_ref) {
    var post = _ref.post;

    return _react2.default.createElement(
        'span',
        { className: 'PostFull__time_author_category vcard' },
        _react2.default.createElement(_Icon2.default, { name: 'clock', className: 'space-right' }),
        _react2.default.createElement(_TimeAgoWrapper2.default, { date: post.get('created') }),
        ' ',
        (0, _counterpart2.default)('g.in'),
        ' ',
        _react2.default.createElement(_Tag2.default, { post: post }),
        ' ',
        (0, _counterpart2.default)('g.by'),
        ' ',
        _react2.default.createElement(_Author2.default, { post: post, showAffiliation: true })
    );
}

function TimeAuthorCategoryLarge(_ref2) {
    var post = _ref2.post;

    return _react2.default.createElement(
        'span',
        { className: 'PostFull__time_author_category_large vcard' },
        _react2.default.createElement(_Userpic2.default, { account: post.get('author') }),
        _react2.default.createElement(
            'div',
            { className: 'right-side' },
            _react2.default.createElement(_Author2.default, { post: post, showAffiliation: true }),
            (0, _counterpart2.default)('g.in'),
            ' ',
            _react2.default.createElement(_Tag2.default, { post: post }),
            ' • ',
            _react2.default.createElement(_TimeAgoWrapper2.default, { date: post.get('created') }),
            ' ',
            _react2.default.createElement(_ContentEditedWrapper2.default, {
                createDate: post.get('created'),
                updateDate: post.get('updated')
            })
        )
    );
}

var PostFull = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(PostFull, _React$Component);

    function PostFull(props) {
        (0, _classCallCheck3.default)(this, PostFull);

        var _this = (0, _possibleConstructorReturn3.default)(this, (PostFull.__proto__ || (0, _getPrototypeOf2.default)(PostFull)).call(this, props));

        _initialiseProps.call(_this);

        var post = _this.props.post;


        _this.fbShare = _this.fbShare.bind(_this);
        _this.twitterShare = _this.twitterShare.bind(_this);
        _this.redditShare = _this.redditShare.bind(_this);
        _this.linkedInShare = _this.linkedInShare.bind(_this);
        _this.showExplorePost = _this.showExplorePost.bind(_this);

        _this.onShowReply = function () {
            var _this$state = _this.state,
                showReply = _this$state.showReply,
                formId = _this$state.formId;

            _this.setState({ showReply: !showReply, showEdit: false });
            saveOnShow(formId, !showReply ? 'reply' : null);
        };
        _this.onShowEdit = function () {
            var _this$state2 = _this.state,
                showEdit = _this$state2.showEdit,
                formId = _this$state2.formId;

            _this.setState({ showEdit: !showEdit, showReply: false });
            saveOnShow(formId, !showEdit ? 'edit' : null);
        };
        _this.onDeletePost = function () {
            var _this$props = _this.props,
                deletePost = _this$props.deletePost,
                post = _this$props.post;

            deletePost(post.get('author'), post.get('permlink'));
        };
        return _this;
    }

    (0, _createClass3.default)(PostFull, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            var postref = this.props.postref;

            var formId = 'postFull-' + postref;
            this.setState({
                formId: formId,
                PostFullReplyEditor: (0, _ReplyEditor2.default)(formId + '-reply'),
                PostFullEditEditor: (0, _ReplyEditor2.default)(formId + '-edit')
            });
            if (process.env.BROWSER) {
                var showEditor = localStorage.getItem('showEditor-' + formId);
                if (showEditor) {
                    showEditor = JSON.parse(showEditor);
                    if (showEditor.type === 'reply') {
                        this.setState({ showReply: true });
                    }
                    if (showEditor.type === 'edit') {
                        this.setState({ showEdit: true });
                    }
                }
            }
        }
    }, {
        key: 'fbShare',
        value: function fbShare(e) {
            var href = this.share_params.url;
            e.preventDefault();
            window.open('https://www.facebook.com/sharer/sharer.php?u=' + href, 'fbshare', 'width=600, height=400, scrollbars=no');
            (0, _ServerApiClient.userActionRecord)('FbShare', {
                trackingId: this.props.trackingId,
                permlink: this.share_params.link
            });
        }
    }, {
        key: 'twitterShare',
        value: function twitterShare(e) {
            (0, _ServerApiClient.userActionRecord)('TwitterShare', {
                trackingId: this.props.trackingId,
                permlink: this.share_params.link
            });
            e.preventDefault();
            var winWidth = 640;
            var winHeight = 320;
            var winTop = screen.height / 2 - winWidth / 2;
            var winLeft = screen.width / 2 - winHeight / 2;
            var s = this.share_params;
            var q = 'text=' + encodeURIComponent(s.title) + '&url=' + encodeURIComponent(s.url);
            window.open('http://twitter.com/share?' + q, 'Share', 'top=' + winTop + ',left=' + winLeft + ',toolbar=0,status=0,width=' + winWidth + ',height=' + winHeight);
        }
    }, {
        key: 'redditShare',
        value: function redditShare(e) {
            (0, _ServerApiClient.userActionRecord)('RedditShare', {
                trackingId: this.props.trackingId,
                permlink: this.share_params.link
            });
            e.preventDefault();
            var s = this.share_params;
            var q = 'title=' + encodeURIComponent(s.title) + '&url=' + encodeURIComponent(s.url);
            window.open('https://www.reddit.com/submit?' + q, 'Share');
        }
    }, {
        key: 'linkedInShare',
        value: function linkedInShare(e) {
            (0, _ServerApiClient.userActionRecord)('LinkedInShare', {
                trackingId: this.props.trackingId,
                permlink: this.share_params.link
            });
            e.preventDefault();
            var winWidth = 720;
            var winHeight = 480;
            var winTop = screen.height / 2 - winWidth / 2;
            var winLeft = screen.width / 2 - winHeight / 2;
            var s = this.share_params;
            var q = 'title=' + encodeURIComponent(s.title) + '&url=' + encodeURIComponent(s.url) + '&source=Steemit&mini=true';
            window.open('https://www.linkedin.com/shareArticle?' + q, 'Share', 'top=' + winTop + ',left=' + winLeft + ',toolbar=0,status=0,width=' + winWidth + ',height=' + winHeight);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                username = _props.username,
                post = _props.post,
                community = _props.community,
                viewer_role = _props.viewer_role,
                _state = this.state,
                PostFullReplyEditor = _state.PostFullReplyEditor,
                PostFullEditEditor = _state.PostFullEditEditor,
                formId = _state.formId,
                showReply = _state.showReply,
                showEdit = _state.showEdit,
                onShowReply = this.onShowReply,
                onShowEdit = this.onShowEdit,
                onDeletePost = this.onDeletePost;

            if (!post) return null;
            var content = post.toJS();
            var author = content.author,
                permlink = content.permlink,
                parent_author = content.parent_author,
                parent_permlink = content.parent_permlink;
            var category = content.category,
                title = content.title;

            var link = '/' + category + '/@' + author + '/' + permlink;

            if (process.env.BROWSER && title) document.title = title + ' — ' + _client_config.APP_NAME;

            var content_body = post.get('body');
            var bDMCAStop = _DMCAList2.default.includes(link);
            var bIllegalContentUser = _userIllegalContent2.default.includes(author);
            if (bDMCAStop) {
                content_body = (0, _counterpart2.default)('postfull_jsx.this_post_is_not_available_due_to_a_copyright_claim');
            }
            // detect illegal users
            if (bIllegalContentUser) {
                content_body = 'Not available for legal reasons.';
            }

            // TODO: get global loading state
            //loading = !bIllegalContentUser && !bDMCAStop && partial data loaded;
            var bShowLoading = false;

            // hide images if user is on blacklist
            var hideImages = _ImageUserBlockList2.default.includes(author);

            var replyParams = {
                author: author,
                permlink: permlink,
                parent_author: parent_author,
                parent_permlink: post.get('depth') == 0 ? post.get('category') : parent_permlink,
                category: category,
                title: title,
                body: post.get('body')
            };

            this.share_params = {
                link: link,
                url: 'https://' + _client_config.APP_DOMAIN + link,
                rawtitle: title,
                title: title + ' — ' + _client_config.APP_NAME,
                desc: (0, _ExtractContent.extractBodySummary)(post.get('body'))
            };

            var share_menu = [{
                onClick: this.fbShare,
                title: (0, _counterpart2.default)('postfull_jsx.share_on_facebook'),
                icon: 'facebook'
            }, {
                onClick: this.twitterShare,
                title: (0, _counterpart2.default)('postfull_jsx.share_on_twitter'),
                icon: 'twitter'
            }, {
                onClick: this.redditShare,
                title: (0, _counterpart2.default)('postfull_jsx.share_on_reddit'),
                icon: 'reddit'
            }, {
                onClick: this.linkedInShare,
                title: (0, _counterpart2.default)('postfull_jsx.share_on_linkedin'),
                icon: 'linkedin'
            }];

            var Editor = this.state.showReply ? PostFullReplyEditor : PostFullEditEditor;
            var renderedEditor = null;
            if (showReply || showEdit) {
                var editJson = showReply ? null : post.get('json_metadata');
                renderedEditor = _react2.default.createElement(
                    'div',
                    { key: 'editor' },
                    _react2.default.createElement(Editor, (0, _extends3.default)({}, replyParams, {
                        type: this.state.showReply ? 'submit_comment' : 'edit',
                        successCallback: function successCallback() {
                            _this2.setState({
                                showReply: false,
                                showEdit: false
                            });
                            saveOnShow(formId, null);
                        },
                        onCancel: function onCancel() {
                            _this2.setState({
                                showReply: false,
                                showEdit: false
                            });
                            saveOnShow(formId, null);
                        },
                        jsonMetadata: editJson
                    }))
                );
            }
            var high_quality_post = post.get('payout') > 10.0;
            var full_power = post.get('percent_steem_dollars') === 0;
            var isReply = post.get('depth') > 0;

            var post_header = _react2.default.createElement(
                'h1',
                { className: 'entry-title' },
                post.get('title'),
                full_power && _react2.default.createElement(
                    'span',
                    { title: (0, _counterpart2.default)('g.powered_up_100') },
                    _react2.default.createElement(_Icon2.default, { name: 'steempower' })
                )
            );

            if (isReply) {
                var rooturl = post.get('url');
                var prnturl = '/' + category + '/@' + parent_author + '/' + parent_permlink;
                post_header = _react2.default.createElement(
                    'div',
                    { className: 'callout' },
                    _react2.default.createElement(
                        'div',
                        null,
                        (0, _counterpart2.default)('postfull_jsx.you_are_viewing_a_single_comments_thread_from'),
                        ':'
                    ),
                    _react2.default.createElement(
                        'h4',
                        null,
                        post.get('title')
                    ),
                    _react2.default.createElement(
                        'ul',
                        null,
                        _react2.default.createElement(
                            'li',
                            null,
                            _react2.default.createElement(
                                _reactRouter.Link,
                                { to: rooturl },
                                (0, _counterpart2.default)('postfull_jsx.view_the_full_context')
                            )
                        ),
                        post.get('depth') > 1 && _react2.default.createElement(
                            'li',
                            null,
                            _react2.default.createElement(
                                _reactRouter.Link,
                                { to: prnturl },
                                (0, _counterpart2.default)('postfull_jsx.view_the_direct_parent')
                            )
                        )
                    )
                );
            }

            var allowReply = _Community.Role.canComment(community, viewer_role);
            var canReblog = !isReply;
            var canPromote = false && !post.get('is_paidout') && !isReply;
            var canPin = post.get('depth') == 0 && _Community.Role.atLeast(viewer_role, 'mod');
            var canMute = username && _Community.Role.atLeast(viewer_role, 'mod');
            var canFlag = username && community && _Community.Role.atLeast(viewer_role, 'guest');
            var canReply = allowReply && post.get('depth') < 255;
            var canEdit = username === author && !showEdit;
            var canDelete = username === author && (0, _StateFunctions.allowDelete)(post);

            var isPinned = post.getIn(['stats', 'is_pinned'], false);

            var isPreViewCount = Date.parse(post.get('created')) < 1480723200000; // check if post was created before view-count tracking began (2016-12-03)
            var contentBody = void 0;

            if (bShowLoading) {
                contentBody = _react2.default.createElement(_LoadingIndicator2.default, { type: 'circle-strong' });
            } else {
                contentBody = _react2.default.createElement(_MarkdownViewer2.default, {
                    formId: formId + '-viewer',
                    text: content_body,
                    large: true,
                    highQualityPost: high_quality_post,
                    noImage: post.getIn(['stats', 'gray']),
                    hideImages: hideImages
                });
            }

            return _react2.default.createElement(
                'article',
                {
                    className: 'PostFull hentry',
                    itemScope: true,
                    itemType: 'http://schema.org/Blog'
                },
                canFlag && _react2.default.createElement(_FlagButton2.default, { post: post }),
                showEdit ? renderedEditor : _react2.default.createElement(
                    'span',
                    null,
                    _react2.default.createElement(
                        'div',
                        { className: 'PostFull__header' },
                        post_header,
                        _react2.default.createElement(TimeAuthorCategoryLarge, { post: post })
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'PostFull__body entry-content' },
                        contentBody
                    )
                ),
                canPromote && username && _react2.default.createElement(
                    'button',
                    {
                        className: 'Promote__button float-right button hollow tiny',
                        onClick: this.showPromotePost
                    },
                    (0, _counterpart2.default)('g.promote')
                ),
                !isReply && _react2.default.createElement(_TagList2.default, { post: post }),
                _react2.default.createElement(
                    'div',
                    { className: 'PostFull__footer row' },
                    _react2.default.createElement(
                        'div',
                        { className: 'columns medium-12 large-8' },
                        _react2.default.createElement(TimeAuthorCategory, { post: post }),
                        _react2.default.createElement(_Voting2.default, { post: post })
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'RightShare__Menu small-11 medium-12 large-4 columns' },
                        canReblog && _react2.default.createElement(_Reblog2.default, { author: author, permlink: permlink }),
                        _react2.default.createElement(
                            'span',
                            { className: 'PostFull__reply' },
                            canReply && _react2.default.createElement(
                                'a',
                                { onClick: onShowReply },
                                (0, _counterpart2.default)('g.reply')
                            ),
                            ' ',
                            canPin && _react2.default.createElement(
                                'a',
                                { onClick: function onClick() {
                                        return _this2.onTogglePin(isPinned);
                                    } },
                                isPinned ? (0, _counterpart2.default)('g.unpin') : (0, _counterpart2.default)('g.pin')
                            ),
                            ' ',
                            canMute && _react2.default.createElement(_MuteButton2.default, { post: post }),
                            ' ',
                            canEdit && _react2.default.createElement(
                                'a',
                                { onClick: onShowEdit },
                                (0, _counterpart2.default)('g.edit')
                            ),
                            ' ',
                            canDelete && _react2.default.createElement(
                                'a',
                                { onClick: onDeletePost },
                                (0, _counterpart2.default)('g.delete')
                            )
                        ),
                        _react2.default.createElement(
                            'span',
                            { className: 'PostFull__responses' },
                            _react2.default.createElement(
                                _reactRouter.Link,
                                {
                                    to: link,
                                    title: (0, _counterpart2.default)('g.responses', {
                                        count: post.get('children')
                                    })
                                },
                                _react2.default.createElement(_Icon2.default, {
                                    name: 'chatboxes',
                                    className: 'space-right'
                                }),
                                post.get('children')
                            )
                        ),
                        _react2.default.createElement(_ShareMenu2.default, { menu: share_menu }),
                        _react2.default.createElement(
                            'button',
                            {
                                className: 'explore-post',
                                title: (0, _counterpart2.default)('g.share_this_post'),
                                onClick: this.showExplorePost
                            },
                            _react2.default.createElement(_Icon2.default, { name: 'link', className: 'chain-right' })
                        )
                    )
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'row' },
                    _react2.default.createElement(
                        'div',
                        { className: 'column large-8 medium-10 small-12' },
                        showReply && renderedEditor
                    )
                )
            );
        }
    }]);
    return PostFull;
}(_react2.default.Component), _class.propTypes = {
    // html props
    /* Show extra options (component is being viewed alone) */
    postref: _propTypes2.default.string.isRequired,
    post: _propTypes2.default.object.isRequired,

    // connector props
    username: _propTypes2.default.string,
    deletePost: _propTypes2.default.func.isRequired,
    showPromotePost: _propTypes2.default.func.isRequired,
    showExplorePost: _propTypes2.default.func.isRequired,
    togglePinnedPost: _propTypes2.default.func.isRequired
}, _initialiseProps = function _initialiseProps() {
    var _this3 = this;

    this.showPromotePost = function () {
        var post = _this3.props.post;

        if (!post) return;
        var author = post.get('author');
        var permlink = post.get('permlink');
        _this3.props.showPromotePost(author, permlink);
    };

    this.showExplorePost = function () {
        var permlink = _this3.share_params.link;
        var title = _this3.share_params.rawtitle;
        _this3.props.showExplorePost(permlink, title);
    };

    this.onTogglePin = function (isPinned) {
        var _props2 = _this3.props,
            community = _props2.community,
            username = _props2.username,
            post = _props2.post,
            postref = _props2.postref;

        if (!community || !username) console.error('pin fail', _this3.props);

        var key = ['content', postref, 'stats', 'is_pinned'];
        _this3.props.stateSet(key, !isPinned);

        var account = post.get('author');
        var permlink = post.get('permlink');
        _this3.props.togglePinnedPost(!isPinned, username, community, account, permlink);
    };
}, _temp);
exports.default = (0, _reactRedux.connect)(function (state, ownProps) {
    var postref = ownProps.post;
    var post = ownProps.cont.get(postref);

    var category = post.get('category');
    var community = state.global.getIn(['community', category, 'name']);
    var trackingId = state.app.get('trackingId');

    return {
        post: post,
        postref: postref,
        community: community,
        username: state.user.getIn(['current', 'username']),
        viewer_role: state.global.getIn(['community', community, 'context', 'role'], 'guest'),
        trackingId: trackingId
    };
}, function (dispatch) {
    return {
        deletePost: function deletePost(author, permlink) {
            (0, _ServerApiClient.userActionRecord)('delete_comment', {
                username: author,
                comment_type: 'post',
                permlink: permlink
            });
            dispatch(transactionActions.broadcastOperation({
                type: 'delete_comment',
                operation: { author: author, permlink: permlink },
                confirm: (0, _counterpart2.default)('g.are_you_sure')
            }));
        },
        stateSet: function stateSet(key, value) {
            dispatch(globalActions.set({ key: key, value: value }));
        },
        showPromotePost: function showPromotePost(author, permlink) {
            dispatch(globalActions.showDialog({
                name: 'promotePost',
                params: { author: author, permlink: permlink }
            }));
        },
        showExplorePost: function showExplorePost(permlink, title) {
            dispatch(globalActions.showDialog({
                name: 'explorePost',
                params: { permlink: permlink, title: title }
            }));
        },
        togglePinnedPost: function togglePinnedPost(pinPost, username, community, account, permlink, successCallback, errorCallback) {
            var action = 'unpinPost';
            if (pinPost) action = 'pinPost';

            var payload = [action, {
                community: community,
                account: account,
                permlink: permlink
            }];

            return dispatch(transactionActions.broadcastOperation({
                type: 'custom_json',
                operation: {
                    id: 'community',
                    required_posting_auths: [username],
                    json: (0, _stringify2.default)(payload)
                },
                successCallback: successCallback,
                errorCallback: errorCallback
            }));
        }
    };
})(PostFull);


var saveOnShow = function saveOnShow(formId, type) {
    if (process.env.BROWSER) {
        if (type) localStorage.setItem('showEditor-' + formId, (0, _stringify2.default)({ type: type }, null, 0));else {
            localStorage.removeItem('showEditor-' + formId);
            localStorage.removeItem('replyEditorData-' + formId + '-reply');
            localStorage.removeItem('replyEditorData-' + formId + '-edit');
        }
    }
};