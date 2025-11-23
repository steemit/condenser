'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

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

exports.sortComments = sortComments;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _immutable = require('immutable');

var _Author = require('app/components/elements/Author');

var _Author2 = _interopRequireDefault(_Author);

var _ReplyEditor = require('app/components/elements/ReplyEditor');

var _ReplyEditor2 = _interopRequireDefault(_ReplyEditor);

var _MuteButton = require('app/components/elements/MuteButton');

var _MuteButton2 = _interopRequireDefault(_MuteButton);

var _FlagButton = require('app/components/elements/FlagButton');

var _FlagButton2 = _interopRequireDefault(_FlagButton);

var _MarkdownViewer = require('app/components/cards/MarkdownViewer');

var _MarkdownViewer2 = _interopRequireDefault(_MarkdownViewer);

var _shouldComponentUpdate = require('app/utils/shouldComponentUpdate');

var _shouldComponentUpdate2 = _interopRequireDefault(_shouldComponentUpdate);

var _Voting = require('app/components/elements/Voting');

var _Voting2 = _interopRequireDefault(_Voting);

var _reactRedux = require('react-redux');

var _reactRouter = require('react-router');

var _UserReducer = require('app/redux/UserReducer');

var userActions = _interopRequireWildcard(_UserReducer);

var _TimeAgoWrapper = require('app/components/elements/TimeAgoWrapper');

var _TimeAgoWrapper2 = _interopRequireDefault(_TimeAgoWrapper);

var _Userpic = require('app/components/elements/Userpic');

var _Userpic2 = _interopRequireDefault(_Userpic);

var _TransactionReducer = require('app/redux/TransactionReducer');

var transactionActions = _interopRequireWildcard(_TransactionReducer);

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _ParsersAndFormatters = require('app/utils/ParsersAndFormatters');

var _bytebuffer = require('bytebuffer');

var _ImageUserBlockList = require('app/utils/ImageUserBlockList');

var _ImageUserBlockList2 = _interopRequireDefault(_ImageUserBlockList);

var _ContentEditedWrapper = require('../elements/ContentEditedWrapper');

var _ContentEditedWrapper2 = _interopRequireDefault(_ContentEditedWrapper);

var _StateFunctions = require('app/utils/StateFunctions');

var _Community = require('app/utils/Community');

var _ServerApiClient = require('app/utils/ServerApiClient');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function sortComments(cont, comments, sort_order) {
    var rshares = function rshares(post) {
        return _bytebuffer.Long.fromString(String(post.get('net_rshares')));
    };
    var demote = function demote(post) {
        return post.getIn(['stats', 'gray']);
    };
    var upvotes = function upvotes(post) {
        return post.get('active_votes').filter(function (v) {
            return v.get('rshares') != '0';
        }).size;
    };
    var ts = function ts(post) {
        return Date.parse(post.get('created'));
    };
    var payout = function payout(post) {
        return post.get('payout');
    };

    var sort_orders = {
        votes: function votes(pa, pb) {
            return upvotes(cont.get(pb)) - upvotes(cont.get(pa));
        },
        new: function _new(pa, pb) {
            var a = cont.get(pa);
            var b = cont.get(pb);
            if (demote(a) != demote(b)) return demote(a) ? 1 : -1;
            return ts(b) - ts(a);
        },
        trending: function trending(pa, pb) {
            var a = cont.get(pa);
            var b = cont.get(pb);
            if (demote(a) != demote(b)) return demote(a) ? 1 : -1;
            if (payout(a) !== payout(b)) return payout(b) - payout(a);
            return rshares(b).compare(rshares(a));
        }
    };
    comments.sort(sort_orders[sort_order]);
}

function commentUrl(post, rootRef) {
    var root = rootRef ? '@' + rootRef + '#' : '';
    return '/' + post.category + '/' + root + '@' + post.author + '/' + post.permlink;
}

var CommentImpl = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(CommentImpl, _React$Component);

    function CommentImpl() {
        (0, _classCallCheck3.default)(this, CommentImpl);

        var _this = (0, _possibleConstructorReturn3.default)(this, (CommentImpl.__proto__ || (0, _getPrototypeOf2.default)(CommentImpl)).call(this));

        _this.state = { collapsed: false, hide_body: false, highlight: false };
        _this.revealBody = _this.revealBody.bind(_this);
        //this.shouldComponentUpdate = shouldComponentUpdate(this, 'Comment');
        _this.onShowReply = function () {
            var showReply = _this.state.showReply;

            _this.setState({ showReply: !showReply, showEdit: false });
            _this.saveOnShow(!showReply ? 'reply' : null);
        };
        _this.onShowEdit = function () {
            var showEdit = _this.state.showEdit;

            _this.setState({ showEdit: !showEdit, showReply: false });
            _this.saveOnShow(!showEdit ? 'edit' : null);
        };
        _this.saveOnShow = function (type) {
            if (process.env.BROWSER) {
                var postref = _this.props.postref;

                var formId = postref;
                if (type) localStorage.setItem('showEditor-' + formId, (0, _stringify2.default)({ type: type }, null, 0));else {
                    localStorage.removeItem('showEditor-' + formId);
                    localStorage.removeItem('replyEditorData-' + formId + '-reply');
                    localStorage.removeItem('replyEditorData-' + formId + '-edit');
                }
            }
        };
        _this.saveOnShow = _this.saveOnShow.bind(_this);
        _this.onDeletePost = function () {
            var _this$props = _this.props,
                deletePost = _this$props.deletePost,
                post = _this$props.post;

            deletePost(post.get('author'), post.get('permlink'));
        };
        _this.toggleCollapsed = _this.toggleCollapsed.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(CommentImpl, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.initEditor(this.props);
            this._checkHide(this.props);
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            if (window.location.hash == this.props.anchor_link) {
                this.setState({ highlight: true }); // eslint-disable-line react/no-did-mount-set-state
            }
        }

        /**
         * - `hide` is based on author reputation, and will hide the entire post on initial render.
         * - `hide_body` is true when comment rshares OR author rep is negative.
         *    it hides the comment body (but not the header) until the "reveal comment" link is clicked.
         */

    }, {
        key: '_checkHide',
        value: function _checkHide(props) {
            var cont = props.cont,
                postref = props.postref,
                post = props.post;

            if (post) {
                var hide = false && post.getIn(['stats', 'hide']);
                var gray = post.getIn(['stats', 'gray']);

                if (hide) {
                    // trigger parent component to show 'reveal comments' button
                    var onHide = this.props.onHide;

                    if (onHide) onHide();
                }

                var notOwn = this.props.username !== post.get('author');
                this.setState({ hide: hide, hide_body: notOwn && (hide || gray) });
            }
        }
    }, {
        key: 'toggleCollapsed',
        value: function toggleCollapsed() {
            this.setState({ collapsed: !this.state.collapsed });
        }
    }, {
        key: 'revealBody',
        value: function revealBody() {
            this.setState({ hide_body: false });
        }
    }, {
        key: 'initEditor',
        value: function initEditor(props) {
            if (this.state.PostReplyEditor) return;
            var _props = this.props,
                post = _props.post,
                postref = _props.postref;

            if (!post) return;
            var PostReplyEditor = (0, _ReplyEditor2.default)(postref + '-reply');
            var PostEditEditor = (0, _ReplyEditor2.default)(postref + '-edit');
            if (process.env.BROWSER) {
                var formId = postref;
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
            this.setState({ PostReplyEditor: PostReplyEditor, PostEditEditor: PostEditEditor });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props2 = this.props,
                cont = _props2.cont,
                post = _props2.post,
                postref = _props2.postref,
                viewer_role = _props2.viewer_role;

            // Don't server-side render the comment if it has a certain number of newlines

            if (!post || global.process !== undefined && (post.get('body').match(/\r?\n/g) || '').length > 25) {
                return _react2.default.createElement(
                    'div',
                    null,
                    (0, _counterpart2.default)('g.loading'),
                    '...'
                );
            }

            var onShowReply = this.onShowReply,
                onShowEdit = this.onShowEdit,
                onDeletePost = this.onDeletePost;
            var _props3 = this.props,
                username = _props3.username,
                depth = _props3.depth,
                anchor_link = _props3.anchor_link,
                showNegativeComments = _props3.showNegativeComments,
                ignored = _props3.ignored,
                rootComment = _props3.rootComment,
                community = _props3.community;
            var _state = this.state,
                PostReplyEditor = _state.PostReplyEditor,
                PostEditEditor = _state.PostEditEditor,
                showReply = _state.showReply,
                showEdit = _state.showEdit,
                hide = _state.hide,
                hide_body = _state.hide_body;


            if (!showNegativeComments && (hide || ignored)) return null;

            var Editor = showReply ? PostReplyEditor : PostEditEditor;

            var author = post.get('author');
            var comment = post.toJS();
            var gray = comment.stats.gray || _ImageUserBlockList2.default.includes(author);

            var allowReply = _Community.Role.canComment(community, viewer_role);
            var canEdit = username && username === author;
            var canDelete = username && username === author && (0, _StateFunctions.allowDelete)(post);
            var canReply = allowReply && comment.depth < 255;
            var canMute = username && _Community.Role.atLeast(viewer_role, 'mod');
            var canFlag = username && community && _Community.Role.atLeast(viewer_role, 'guest');

            var body = null;
            var controls = null;
            if (!this.state.collapsed && !hide_body) {
                body = gray ? _react2.default.createElement(
                    'pre',
                    { style: { opacity: 0.5, whiteSpace: 'pre-wrap' } },
                    comment.body
                ) : _react2.default.createElement(_MarkdownViewer2.default, {
                    formId: postref + '-viewer',
                    text: comment.body
                    //noImage={gray}
                    //hideImages={hideImages}
                });
                controls = _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(_Voting2.default, { post: post }),
                    _react2.default.createElement(
                        'span',
                        { className: 'Comment__footer__controls' },
                        canReply && _react2.default.createElement(
                            'a',
                            { onClick: onShowReply },
                            (0, _counterpart2.default)('g.reply')
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
                    )
                );
            }

            var replies = null;
            if (!this.state.collapsed && comment.children > 0) {
                if (depth > 7) {
                    replies = _react2.default.createElement(
                        _reactRouter.Link,
                        { to: commentUrl(comment) },
                        'Show ',
                        comment.children,
                        ' more',
                        ' ',
                        comment.children == 1 ? 'reply' : 'replies'
                    );
                } else {
                    replies = comment.replies;
                    sortComments(cont, replies, this.props.sort_order);
                    replies = replies.map(function (reply, idx) {
                        return _react2.default.createElement(Comment, {
                            key: idx,
                            postref: reply,
                            cont: cont,
                            sort_order: _this2.props.sort_order,
                            depth: depth + 1,
                            rootComment: rootComment,
                            showNegativeComments: showNegativeComments,
                            onHide: _this2.props.onHide
                        });
                    });
                }
            }

            var commentClasses = ['hentry'];
            commentClasses.push('Comment');
            commentClasses.push(depth == 1 ? 'root' : 'reply');
            if (this.state.collapsed) commentClasses.push('collapsed');

            var innerCommentClass = 'Comment__block';
            if (ignored || gray) {
                innerCommentClass += ' downvoted clearfix';
                if (!hide_body) innerCommentClass += ' revealed';
            }
            if (this.state.highlight) innerCommentClass += ' highlighted';

            var renderedEditor = null;
            if (showReply || showEdit) {
                renderedEditor = _react2.default.createElement(
                    'div',
                    { key: 'editor' },
                    _react2.default.createElement(Editor, (0, _extends3.default)({}, comment, {
                        type: showReply ? 'submit_comment' : 'edit',
                        successCallback: function successCallback() {
                            _this2.setState({
                                showReply: false,
                                showEdit: false
                            });
                            _this2.saveOnShow(null);
                        },
                        onCancel: function onCancel() {
                            _this2.setState({
                                showReply: false,
                                showEdit: false
                            });
                            _this2.saveOnShow(null);
                        },
                        jsonMetadata: showReply ? null : comment.json_metadata
                    }))
                );
            }

            return _react2.default.createElement(
                'div',
                {
                    className: commentClasses.join(' '),
                    id: anchor_link,
                    itemScope: true,
                    itemType: 'http://schema.org/comment'
                },
                _react2.default.createElement(
                    'div',
                    { className: innerCommentClass },
                    _react2.default.createElement(
                        'div',
                        { className: 'Comment__Userpic show-for-medium' },
                        _react2.default.createElement(_Userpic2.default, { account: author })
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'Comment__header' },
                        _react2.default.createElement(
                            'div',
                            { className: 'Comment__header_collapse' },
                            canFlag && _react2.default.createElement(_FlagButton2.default, { post: post, isComment: true }),
                            _react2.default.createElement(
                                'a',
                                { onClick: this.toggleCollapsed },
                                this.state.collapsed ? '[+]' : '[-]'
                            )
                        ),
                        _react2.default.createElement(
                            'span',
                            { className: 'Comment__header-user' },
                            _react2.default.createElement(
                                'div',
                                { className: 'Comment__Userpic-small' },
                                _react2.default.createElement(_Userpic2.default, { account: author })
                            ),
                            _react2.default.createElement(_Author2.default, { post: post, showAffiliation: true })
                        ),
                        '\xA0',
                        _react2.default.createElement(
                            _reactRouter.Link,
                            {
                                to: commentUrl(comment, rootComment),
                                className: 'PlainLink'
                            },
                            _react2.default.createElement(_TimeAgoWrapper2.default, { date: comment.created })
                        ),
                        '\xA0',
                        _react2.default.createElement(_ContentEditedWrapper2.default, {
                            createDate: comment.created,
                            updateDate: comment.updated
                        }),
                        (this.state.collapsed || hide_body) && _react2.default.createElement(_Voting2.default, { post: post, showList: false }),
                        this.state.collapsed && comment.children > 0 && _react2.default.createElement(
                            'span',
                            null,
                            (0, _counterpart2.default)('g.reply_count', {
                                count: comment.children
                            })
                        ),
                        !this.state.collapsed && hide_body && _react2.default.createElement(
                            'a',
                            { onClick: this.revealBody },
                            (0, _counterpart2.default)('g.reveal_comment')
                        ),
                        !this.state.collapsed && !hide_body && (ignored || gray) && _react2.default.createElement(
                            'span',
                            null,
                            '\xB7\xA0',
                            (0, _counterpart2.default)('g.will_be_hidden_due_to_low_rating')
                        )
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'Comment__body entry-content' },
                        showEdit ? renderedEditor : body
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'Comment__footer' },
                        controls
                    )
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'Comment__replies hfeed' },
                    showReply && renderedEditor,
                    replies
                )
            );
        }
    }]);
    return CommentImpl;
}(_react2.default.Component), _class.propTypes = {
    // html props
    cont: _propTypes2.default.object.isRequired,
    postref: _propTypes2.default.string.isRequired,
    sort_order: _propTypes2.default.oneOf(['votes', 'new', 'trending']).isRequired,
    showNegativeComments: _propTypes2.default.bool,
    onHide: _propTypes2.default.func,
    viewer_role: _propTypes2.default.string,

    // component props (for recursion)
    depth: _propTypes2.default.number,

    // redux props
    username: _propTypes2.default.string,
    rootComment: _propTypes2.default.string,
    anchor_link: _propTypes2.default.string.isRequired,
    deletePost: _propTypes2.default.func.isRequired
}, _temp);


var Comment = (0, _reactRedux.connect)(
// mapStateToProps
function (state, ownProps) {
    var postref = ownProps.postref,
        cont = ownProps.cont,
        sort_order = ownProps.sort_order;

    var post = ownProps.cont.get(postref);

    var category = post.get('category');
    var community = state.global.getIn(['community', category], (0, _immutable.Map)());
    var author = post.get('author');
    var username = state.user.getIn(['current', 'username']);
    var ignored = author && username ? state.global.hasIn(['follow', 'getFollowingAsync', username, 'ignore_result', author]) : null;

    var depth = ownProps.depth || 1;
    var rootComment = ownProps.rootComment || postref;

    return {
        postref: postref,
        post: post,
        cont: cont,
        sort_order: ownProps.sort_order,
        showNegativeComments: ownProps.showNegativeComments,
        onHide: ownProps.onHide,
        depth: depth,
        rootComment: rootComment,
        anchor_link: '#@' + postref, // Using a hash here is not standard but intentional; see issue #124 for details
        username: username,
        ignored: ignored,
        community: community.get('name', null),
        viewer_role: community.getIn(['context', 'role'], 'guest')
    };
},

// mapDispatchToProps
function (dispatch) {
    return {
        unlock: function unlock() {
            dispatch(userActions.showLogin());
        },
        deletePost: function deletePost(author, permlink) {
            (0, _ServerApiClient.userActionRecord)('delete_comment', {
                username: author,
                comment_type: 'reply',
                permlink: permlink
            });
            dispatch(transactionActions.broadcastOperation({
                type: 'delete_comment',
                operation: { author: author, permlink: permlink },
                confirm: (0, _counterpart2.default)('g.are_you_sure')
            }));
        }
    };
})(CommentImpl);
exports.default = Comment;