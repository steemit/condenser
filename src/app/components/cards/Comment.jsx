import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import Author from 'app/components/elements/Author';
import ReplyEditor from 'app/components/elements/ReplyEditor';
import MuteButton from 'app/components/elements/MuteButton';
import FlagButton from 'app/components/elements/FlagButton';
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
import { Role } from 'app/utils/Community';

export function sortComments(cont, comments, sort_order) {
    const rshares = post => Long.fromString(String(post.get('net_rshares')));
    const demote = post => post.getIn(['stats', 'gray']);
    const upvotes = post =>
        post.get('active_votes').filter(v => v.get('rshares') != '0').size;
    const ts = post => Date.parse(post.get('created'));
    const payout = post => post.get('payout');

    const sort_orders = {
        votes: (pa, pb) => {
            return upvotes(cont.get(pb)) - upvotes(cont.get(pa));
        },
        new: (pa, pb) => {
            const a = cont.get(pa);
            const b = cont.get(pb);
            if (demote(a) != demote(b)) return demote(a) ? 1 : -1;
            return ts(b) - ts(a);
        },
        trending: (pa, pb) => {
            const a = cont.get(pa);
            const b = cont.get(pb);
            if (demote(a) != demote(b)) return demote(a) ? 1 : -1;
            if (payout(a) !== payout(b)) return payout(b) - payout(a);
            return rshares(b).compare(rshares(a));
        },
    };
    comments.sort(sort_orders[sort_order]);
}

function commentUrl(post, rootRef) {
    const root = rootRef ? `@${rootRef}#` : '';
    return `/${post.category}/${root}@${post.author}/${post.permlink}`;
}

class CommentImpl extends React.Component {
    static propTypes = {
        // html props
        cont: PropTypes.object.isRequired,
        postref: PropTypes.string.isRequired,
        sort_order: PropTypes.oneOf(['votes', 'new', 'trending']).isRequired,
        showNegativeComments: PropTypes.bool,
        onHide: PropTypes.func,
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
        //this.shouldComponentUpdate = shouldComponentUpdate(this, 'Comment');
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
            const hide = false && post.getIn(['stats', 'hide']);
            const gray = post.getIn(['stats', 'gray']);

            if (hide) {
                // trigger parent component to show 'reveal comments' button
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
        const { cont, post, postref, viewer_role } = this.props;

        // Don't server-side render the comment if it has a certain number of newlines
        if (
            !post ||
            (global.process !== undefined &&
                (post.get('body').match(/\r?\n/g) || '').length > 25)
        ) {
            return <div>{tt('g.loading')}...</div>;
        }

        const { onShowReply, onShowEdit, onDeletePost } = this;

        const {
            username,
            depth,
            anchor_link,
            showNegativeComments,
            ignored,
            rootComment,
            community,
        } = this.props;

        const {
            PostReplyEditor,
            PostEditEditor,
            showReply,
            showEdit,
            hide,
            hide_body,
        } = this.state;

        if (!showNegativeComments && (hide || ignored)) return null;

        const Editor = showReply ? PostReplyEditor : PostEditEditor;

        const author = post.get('author');
        const comment = post.toJS();
        const gray = comment.stats.gray || ImageUserBlockList.includes(author);

        const allowReply = Role.canComment(community, viewer_role);
        const canEdit = username && username === author;
        const canDelete = username && username === author && allowDelete(post);
        const canReply = allowReply && comment.depth < 255;
        const canMute = username && Role.atLeast(viewer_role, 'mod');
        const canFlag =
            username && community && Role.atLeast(viewer_role, 'guest');

        let body = null;
        let controls = null;
        if (!this.state.collapsed && !hide_body) {
            body = gray ? (
                <pre style={{ opacity: 0.5, whiteSpace: 'pre-wrap' }}>
                    {comment.body}
                </pre>
            ) : (
                <MarkdownViewer
                    formId={postref + '-viewer'}
                    text={comment.body}
                    //noImage={gray}
                    //hideImages={hideImages}
                />
            );
            controls = (
                <div>
                    <Voting post={postref} />
                    <span className="Comment__footer__controls">
                        {canReply && (
                            <a onClick={onShowReply}>{tt('g.reply')}</a>
                        )}{' '}
                        {canMute && <MuteButton post={post} />}{' '}
                        {canEdit && <a onClick={onShowEdit}>{tt('g.edit')}</a>}{' '}
                        {canDelete && (
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
        if (ignored || gray) {
            innerCommentClass += ' downvoted clearfix';
            if (!hide_body) innerCommentClass += ' revealed';
        }
        if (this.state.highlight) innerCommentClass += ' highlighted';

        let renderedEditor = null;
        if (showReply || showEdit) {
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
                        jsonMetadata={showReply ? null : comment.json_metadata}
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
                        <Userpic account={author} />
                    </div>
                    <div className="Comment__header">
                        <div className="Comment__header_collapse">
                            {canFlag && (
                                <FlagButton post={post} isComment={true} />
                            )}
                            <a onClick={this.toggleCollapsed}>
                                {this.state.collapsed ? '[+]' : '[-]'}
                            </a>
                        </div>
                        <span className="Comment__header-user">
                            <div className="Comment__Userpic-small">
                                <Userpic account={author} />
                            </div>
                            <Author post={post} showAffiliation />
                        </span>
                        &nbsp; &middot; &nbsp;
                        <Link
                            to={commentUrl(comment, rootComment)}
                            className="PlainLink"
                        >
                            <TimeAgoWrapper date={comment.created} />
                        </Link>
                        &nbsp;
                        <ContentEditedWrapper
                            createDate={comment.created}
                            updateDate={comment.updated}
                        />
                        {(this.state.collapsed || hide_body) && (
                            <Voting post={postref} showList={false} />
                        )}
                        {this.state.collapsed &&
                            comment.children > 0 && (
                                <span>
                                    {tt('g.reply_count', {
                                        count: comment.children,
                                    })}
                                </span>
                            )}
                        {!this.state.collapsed &&
                            hide_body && (
                                <a onClick={this.revealBody}>
                                    {tt('g.reveal_comment')}
                                </a>
                            )}
                        {!this.state.collapsed &&
                            !hide_body &&
                            (ignored || gray) && (
                                <span>
                                    &middot;&nbsp;
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
        const post = ownProps.cont.get(postref);

        const category = post.get('category');
        const community = state.global.getIn(['community', category], Map());
        const author = post.get('author');
        const username = state.user.getIn(['current', 'username']);
        const ignored =
            author && username
                ? state.global.hasIn([
                      'follow',
                      'getFollowingAsync',
                      username,
                      'ignore_result',
                      author,
                  ])
                : null;

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
            ignored,
            community: community.get('name', null),
            viewer_role: community.getIn(['context', 'role'], 'guest'),
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
