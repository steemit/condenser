import React from 'react';
import PropTypes from 'prop-types';
import Author from 'app/components/elements/Author';
import ReplyEditor from 'app/components/elements/ReplyEditor';
import MuteButtonContainer from 'app/components/elements/MuteButtonContainer';
import MarkdownViewer from 'app/components/cards/MarkdownViewer';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import Voting from 'app/components/elements/Voting';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import * as userActions from 'app/redux/UserReducer';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import Userpic from 'app/components/elements/Userpic';
import * as transactionActions from 'app/redux/TransactionReducer';
import tt from 'counterpart';
import { parsePayoutAmount } from 'app/utils/ParsersAndFormatters';
import { Long } from 'bytebuffer';
import ImageUserBlockList from 'app/utils/ImageUserBlockList';
import ContentEditedWrapper from '../elements/ContentEditedWrapper';
import { allowDelete } from 'app/utils/StateFunctions';
import { Role, ifHive } from 'app/utils/Community';

// returns true if the comment has a 'hide' flag AND has no descendants w/ positive payout
function hideSubtree(cont, c) {
    // TODO: re-evaluate
    return (
        false && cont.getIn([c, 'stats', 'hide']) && !hasPositivePayout(cont, c)
    );
}

function hasPositivePayout(postmap, post_url) {
    const post = postmap.get(post_url);
    if (parseFloat(post.get('net_rshares')) > 0) {
        return true;
    }
    if (post.get('replies').find(url => hasPositivePayout(postmap, url))) {
        return true;
    }
    return false;
}

export function sortComments(cont, comments, sort_order) {
    function netNegative(a) {
        return a.getIn(['stats', 'gray']) || a.get('net_rshares') < 0;
    }
    function totalPayout(a) {
        return (
            parsePayoutAmount(a.get('pending_payout_value')) +
            parsePayoutAmount(a.get('total_payout_value')) +
            parsePayoutAmount(a.get('curator_payout_value'))
        );
    }
    function netRshares(a) {
        return Long.fromString(String(a.get('net_rshares')));
    }
    function countUpvotes(a) {
        return a.get('active_votes').filter(vote => vote.get('percent') > 0)
            .size;
    }

    /** sorts replies by upvotes, age, or payout */
    const sort_orders = {
        votes: (a, b) => {
            const aactive = countUpvotes(cont.get(a));
            const bactive = countUpvotes(cont.get(b));
            return bactive - aactive;
        },
        new: (a, b) => {
            const post_a = cont.get(a);
            const post_b = cont.get(b);
            if (netNegative(post_a) != netNegative(post_b))
                return netNegative(post_a) ? 1 : -1;
            const aactive = Date.parse(post_a.get('created'));
            const bactive = Date.parse(post_b.get('created'));
            return bactive - aactive;
        },
        trending: (a, b) => {
            const post_a = cont.get(a);
            const post_b = cont.get(b);
            if (netNegative(post_a) != netNegative(post_b))
                return netNegative(post_a) ? 1 : -1;
            const apayout = totalPayout(post_a);
            const bpayout = totalPayout(post_b);
            if (apayout !== bpayout) return bpayout - apayout;
            return netRshares(post_b).compare(netRshares(post_a));
        },
        author_reputation: (a, b) => {
            return b.get('author_reputation') - a.get('author_reputation');
        },
    };
    comments.sort(sort_orders[sort_order]);
}

function commentUrl(post, rootRef) {
    if (rootRef) {
        return `/${post.category}/@${rootRef}#@${post.author}/${post.permlink}`;
    }
    return `/${post.category}/@${post.author}/${post.permlink}`;
}

class CommentImpl extends React.Component {
    static propTypes = {
        // html props
        cont: PropTypes.object.isRequired,
        postref: PropTypes.string.isRequired,
        sort_order: PropTypes.oneOf([
            'votes',
            'new',
            'trending',
            'author_reputation',
        ]).isRequired,
        showNegativeComments: PropTypes.bool,
        onHide: PropTypes.func,
        community: PropTypes.string,
        viewer_role: PropTypes.string,

        // component props (for recursion)
        depth: PropTypes.number,

        // redux props
        username: PropTypes.string,
        rootComment: PropTypes.string,
        anchor_link: PropTypes.string.isRequired,
        deletePost: PropTypes.func.isRequired,
    };

    constructor() {
        super();
        this.state = { collapsed: false, hide_body: false, highlight: false };
        this.revealBody = this.revealBody.bind(this);
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'Comment');
        this.onShowReply = () => {
            const { showReply } = this.state;
            this.setState({ showReply: !showReply, showEdit: false });
            this.saveOnShow(!showReply ? 'reply' : null);
        };
        this.onShowEdit = () => {
            const { showEdit } = this.state;
            this.setState({ showEdit: !showEdit, showReply: false });
            this.saveOnShow(!showEdit ? 'edit' : null);
        };
        this.saveOnShow = type => {
            if (process.env.BROWSER) {
                const { postref } = this.props;
                const formId = postref;
                if (type)
                    localStorage.setItem(
                        'showEditor-' + formId,
                        JSON.stringify({ type }, null, 0)
                    );
                else {
                    localStorage.removeItem('showEditor-' + formId);
                    localStorage.removeItem(`replyEditorData-${formId}-reply`);
                    localStorage.removeItem(`replyEditorData-${formId}-edit`);
                }
            }
        };
        this.saveOnShow = this.saveOnShow.bind(this);
        this.onDeletePost = () => {
            const { deletePost, post } = this.props;
            deletePost(post.get('author'), post.get('permlink'));
        };
        this.toggleCollapsed = this.toggleCollapsed.bind(this);
    }

    componentWillMount() {
        this.initEditor(this.props);
        this._checkHide(this.props);
    }

    componentDidMount() {
        if (window.location.hash == this.props.anchor_link) {
            this.setState({ highlight: true }); // eslint-disable-line react/no-did-mount-set-state
        }
    }

    /**
     * - `hide` is based on author reputation, and will hide the entire post on initial render.
     * - `hide_body` is true when comment rshares OR author rep is negative.
     *    it hides the comment body (but not the header) until the "reveal comment" link is clicked.
     */
    _checkHide(props) {
        const { cont, postref, post } = props;
        if (post) {
            const hide = hideSubtree(cont, postref);
            const gray = post.getIn(['stats', 'gray']);

            if (hide) {
                const { onHide } = this.props;
                if (onHide) onHide();
            }

            const notOwn = this.props.username !== post.get('author');
            this.setState({ hide, hide_body: notOwn && (hide || gray) });
        }
    }

    toggleCollapsed() {
        this.setState({ collapsed: !this.state.collapsed });
    }
    revealBody() {
        this.setState({ hide_body: false });
    }
    initEditor(props) {
        if (this.state.PostReplyEditor) return;
        const { post, postref } = this.props;
        if (!post) return;
        const PostReplyEditor = ReplyEditor(postref + '-reply');
        const PostEditEditor = ReplyEditor(postref + '-edit');
        if (process.env.BROWSER) {
            const formId = postref;
            let showEditor = localStorage.getItem('showEditor-' + formId);
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
        this.setState({ PostReplyEditor, PostEditEditor });
    }
    render() {
        const { cont, post, postref, community, viewer_role } = this.props;

        if (!post) {
            return <div>{tt('g.loading')}...</div>;
        }

        // Don't server-side render the comment if it has a certain number of newlines
        if (
            global.process !== undefined &&
            (post.get('body').match(/\r?\n/g) || '').length > 25
        ) {
            return <div>{tt('g.loading')}...</div>;
        }

        const { onShowReply, onShowEdit, onDeletePost } = this;
        const {
            username,
            depth,
            anchor_link,
            showNegativeComments,
            ignore_list,
            rootComment,
        } = this.props;
        const {
            PostReplyEditor,
            PostEditEditor,
            showReply,
            showEdit,
            hide,
            hide_body,
        } = this.state;
        const Editor = showReply ? PostReplyEditor : PostEditEditor;

        const comment = post.toJS();
        const { gray } = comment.stats;

        const comment_link = commentUrl(comment, rootComment);
        const ignore = ignore_list && ignore_list.has(comment.author);

        if (!showNegativeComments && (hide || ignore)) {
            return null;
        }

        // hide images if author is in blacklist
        const hideImages = ImageUserBlockList.includes(comment.author);

        const showEditOption = username === comment.author;
        const showMuteToggle = Role.atLeast(viewer_role, 'mod');
        const showDeleteOption =
            username === comment.author && allowDelete(comment);
        const showReplyOption = username !== undefined && comment.depth < 255;

        let body = null;
        let controls = null;

        if (!this.state.collapsed && !hide_body) {
            body = (
                <MarkdownViewer
                    formId={postref + '-viewer'}
                    text={comment.body}
                    noImage={gray}
                    hideImages={hideImages}
                />
            );
            controls = (
                <div>
                    <Voting post={postref} />
                    <span className="Comment__footer__controls">
                        {showReplyOption && (
                            <a onClick={onShowReply}>{tt('g.reply')}</a>
                        )}{' '}
                        {showMuteToggle && (
                            <MuteButtonContainer
                                account={comment.author}
                                community={community}
                                isMuted={gray}
                                permlink={comment.permlink}
                            />
                        )}{' '}
                        {showEditOption && (
                            <a onClick={onShowEdit}>{tt('g.edit')}</a>
                        )}{' '}
                        {showDeleteOption && (
                            <a onClick={onDeletePost}>{tt('g.delete')}</a>
                        )}
                    </span>
                </div>
            );
        }

        let replies = null;
        if (!this.state.collapsed && comment.children > 0) {
            if (depth > 7) {
                replies = (
                    <Link to={commentUrl(comment)}>
                        Show {comment.children} more{' '}
                        {comment.children == 1 ? 'reply' : 'replies'}
                    </Link>
                );
            } else {
                replies = comment.replies;
                sortComments(cont, replies, this.props.sort_order);
                replies = replies.map((reply, idx) => (
                    <Comment
                        key={idx}
                        postref={reply}
                        cont={cont}
                        sort_order={this.props.sort_order}
                        depth={depth + 1}
                        rootComment={rootComment}
                        showNegativeComments={showNegativeComments}
                        onHide={this.props.onHide}
                    />
                ));
            }
        }

        const commentClasses = ['hentry'];
        commentClasses.push('Comment');
        commentClasses.push(depth == 1 ? 'root' : 'reply');
        if (this.state.collapsed) commentClasses.push('collapsed');

        let innerCommentClass = 'Comment__block';
        if (ignore || gray) {
            innerCommentClass += ' downvoted clearfix';
            if (!hide_body) {
                innerCommentClass += ' revealed';
            }
        }
        if (this.state.highlight) innerCommentClass += ' highlighted';

        let renderedEditor = null;
        if (showReply || showEdit) {
            let jsonMetadata = null;
            if (!showReply) {
                try {
                    jsonMetadata = JSON.parse(comment.json_metadata);
                } catch (error) {}
            }

            renderedEditor = (
                <div key="editor">
                    <Editor
                        {...comment}
                        type={showReply ? 'submit_comment' : 'edit'}
                        successCallback={() => {
                            this.setState({
                                showReply: false,
                                showEdit: false,
                            });
                            this.saveOnShow(null);
                        }}
                        onCancel={() => {
                            this.setState({
                                showReply: false,
                                showEdit: false,
                            });
                            this.saveOnShow(null);
                        }}
                        jsonMetadata={jsonMetadata}
                    />
                </div>
            );
        }

        return (
            <div
                className={commentClasses.join(' ')}
                id={anchor_link}
                itemScope
                itemType="http://schema.org/comment"
            >
                <div className={innerCommentClass}>
                    <div className="Comment__Userpic show-for-medium">
                        <Userpic account={comment.author} />
                    </div>
                    <div className="Comment__header">
                        <div className="Comment__header_collapse">
                            <a
                                title={tt('g.collapse_or_expand')}
                                onClick={this.toggleCollapsed}
                            >
                                {this.state.collapsed ? '[+]' : '[-]'}
                            </a>
                        </div>
                        <span className="Comment__header-user">
                            <div className="Comment__Userpic-small">
                                <Userpic account={comment.author} />
                            </div>
                            <Author
                                author={comment.author}
                                authorRep={comment.author_reputation}
                                showAffiliation
                                role={comment.author_role}
                                title={comment.author_title}
                                permlink={comment.permlink}
                                community={community}
                                viewer_role={viewer_role}
                            />
                        </span>
                        &nbsp; &middot; &nbsp;
                        <Link to={comment_link} className="PlainLink">
                            <TimeAgoWrapper date={comment.created} />
                        </Link>
                        &nbsp;
                        <ContentEditedWrapper
                            createDate={comment.created}
                            updateDate={comment.last_update}
                        />
                        {(this.state.collapsed || hide_body) && (
                            <Voting post={postref} showList={false} />
                        )}
                        {this.state.collapsed &&
                            comment.children > 0 && (
                                <span className="marginLeft1rem">
                                    {tt('g.reply_count', {
                                        count: comment.children,
                                    })}
                                </span>
                            )}
                        {!this.state.collapsed &&
                            hide_body && (
                                <a
                                    className="marginLeft1rem"
                                    onClick={this.revealBody}
                                >
                                    {tt('g.reveal_comment')}
                                </a>
                            )}
                        {!this.state.collapsed &&
                            !hide_body &&
                            (ignore || gray) && (
                                <span>
                                    &nbsp; &middot; &nbsp;{' '}
                                    {tt('g.will_be_hidden_due_to_low_rating')}
                                </span>
                            )}
                    </div>
                    <div className="Comment__body entry-content">
                        {showEdit ? renderedEditor : body}
                    </div>
                    <div className="Comment__footer">{controls}</div>
                </div>
                <div className="Comment__replies hfeed">
                    {showReply && renderedEditor}
                    {replies}
                </div>
            </div>
        );
    }
}

const Comment = connect(
    // mapStateToProps
    (state, ownProps) => {
        const { postref, cont, sort_order } = ownProps;

        const username = state.user.getIn(['current', 'username']);
        const ignore_list = username
            ? state.global.getIn([
                  'follow',
                  'getFollowingAsync',
                  username,
                  'ignore_result',
              ])
            : null;

        const post = ownProps.cont.get(postref);
        const community = ifHive(post.get('category'));

        const depth = ownProps.depth || 1;
        const rootComment = ownProps.rootComment || postref;

        return {
            postref,
            post,
            cont,
            sort_order: ownProps.sort_order,
            showNegativeComments: ownProps.showNegativeComments,
            onHide: ownProps.onHide,
            depth,
            rootComment,
            anchor_link: '#@' + postref, // Using a hash here is not standard but intentional; see issue #124 for details
            username,
            ignore_list,
            community,
            viewer_role: state.global.getIn(
                ['community', community, 'context', 'role'],
                'guest'
            ),
        };
    },

    // mapDispatchToProps
    dispatch => ({
        unlock: () => {
            dispatch(userActions.showLogin());
        },
        deletePost: (author, permlink) => {
            dispatch(
                transactionActions.broadcastOperation({
                    type: 'delete_comment',
                    operation: { author, permlink },
                    confirm: tt('g.are_you_sure'),
                })
            );
        },
    })
)(CommentImpl);
export default Comment;
