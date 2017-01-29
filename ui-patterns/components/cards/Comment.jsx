import React from 'react';
import Author from 'ui-patterns/components/elements/Author';
import ReplyEditor from 'ui-patterns/components/elements/ReplyEditor';
import MarkdownViewer from 'ui-patterns/components/cards/MarkdownViewer';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate'
import Voting from 'ui-patterns/components/elements/Voting';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import user from 'app/redux/User';
import TimeAgoWrapper from 'ui-patterns/components/elements/TimeAgoWrapper';
import Userpic from 'ui-patterns/components/elements/Userpic';
import transaction from 'app/redux/Transaction'
import {List} from 'immutable'
import { translate } from 'app/Translator';
import {parsePayoutAmount} from 'app/utils/ParsersAndFormatters';

export function sortComments( cont, comments, sort_order ) {

  function netNegative(a)  {
      return a.get("net_rshares") < 0;
  }
  function totalPayout(a) {
      return parsePayoutAmount(a.get('pending_payout_value'))
             + parsePayoutAmount(a.get('total_payout_value'))
             + parsePayoutAmount(a.get('curator_payout_value'));
  }

  /** sorts replies by upvotes, age, or payout */
  let sort_orders = {
      votes: (a,b) => {
                let acontent = cont.get(a);
                let bcontent = cont.get(b);
                let aactive = acontent.get('active_votes').filter(vote => vote.get('percent') > 0).size;
                let bactive = bcontent.get('active_votes').filter(vote => vote.get('percent') > 0).size;
                return bactive - aactive;
              },
      new:  (a,b) =>  {
                let acontent = cont.get(a);
                let bcontent = cont.get(b);
                if (netNegative(acontent)) {
                    return 1;
                } else if (netNegative(bcontent)) {
                    return -1;
                }
                let aactive = Date.parse( acontent.get('created') );
                let bactive = Date.parse( bcontent.get('created') );
                return bactive - aactive;
              },
      trending:  (a,b) => {
                let acontent = cont.get(a);
                let bcontent = cont.get(b);
                if (netNegative(acontent)) {
                    return 1;
                } else if (netNegative(bcontent)) {
                    return -1;
                }
                let apayout = totalPayout(acontent)
                let bpayout = totalPayout(bcontent)
                return bpayout - apayout;
              }
  }
  comments.sort( sort_orders[sort_order] );
};

class CommentImpl extends React.Component {

    static propTypes = {
        // html props
        cont: React.PropTypes.object.isRequired,
        content: React.PropTypes.string.isRequired,
        sort_order: React.PropTypes.oneOf(['votes', 'new', 'trending']).isRequired,
        root: React.PropTypes.bool,
        showNegativeComments: React.PropTypes.bool,
        onHide: React.PropTypes.func,
        noImage: React.PropTypes.bool,

        // component props (for recursion)
        depth: React.PropTypes.number,

        // redux props
        username: React.PropTypes.string,
        rootComment: React.PropTypes.string,
        anchor_link: React.PropTypes.string.isRequired,
        deletePost: React.PropTypes.func.isRequired,
    };
    static defaultProps = {
        depth: 1,
    }

    constructor() {
        super();
        this.state = {collapsed: false, hide_body: false, highlight: false};
        this.revealBody = this.revealBody.bind(this);
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'Comment')
        this.onShowReply = () => {
            const {showReply} = this.state
            this.setState({showReply: !showReply, showEdit: false})
            this.saveOnShow(!showReply ? 'reply' : null)
        }
        this.onShowEdit = () => {
            const {showEdit} = this.state
            this.setState({showEdit: !showEdit, showReply: false})
            this.saveOnShow(!showEdit ? 'edit' : null)
        }
        this.saveOnShow = (type) => {
            if(process.env.BROWSER) {
                const {cont} = this.props;
                const content = cont.get(this.props.content)
                const formId = content.get('author') + '/' + content.get('permlink')
                if(type)
                    localStorage.setItem('showEditor-' + formId, JSON.stringify({type}, null, 0))
                else {
                    localStorage.removeItem('showEditor-' + formId)
                    localStorage.removeItem('replyEditorData-' + formId + '-reply')
                    localStorage.removeItem('replyEditorData-' + formId + '-edit')
                }
            }
        }
        this.saveOnShow = this.saveOnShow.bind(this)
        this.onDeletePost = () => {
            const {props: {deletePost}} = this
            const content = this.props.cont.get(this.props.content);
            deletePost(content.get('author'), content.get('permlink'))
        }
        this.toggleCollapsed = this.toggleCollapsed.bind(this);
    }

    componentWillMount() {
        this.initEditor(this.props)
        this._checkHide(this.props);
    }

    componentDidMount() {
        // Jump to comment via hash (note: comment element's id has a hash(#) in it)
        if (window.location.hash == this.props.anchor_link) {
            const comment_el = document.getElementById(this.props.anchor_link)
            if (comment_el) {
                comment_el.scrollIntoView(true);
                document.body.scrollTop -= 200;
                this.setState({highlight: true})
            }
        }
    }

    //componentWillReceiveProps(np) {
    //    this._checkHide(np);
    //}

    /**
     * - `hide` is based on author reputation, and will hide the entire post on initial render.
     * - `hide_body` is true when comment rshares OR author rep is negative.
     *    it hides the comment body (but not the header) until the "reveal comment" link is clicked.
     */
    _checkHide(props) {
        const content = props.cont.get(props.content);
        if (content) {
            const hide = content.getIn(['stats', 'hide'])
            const gray = content.getIn(['stats', 'gray'])
            if(hide) {
                const {onHide} = this.props
                // console.log('Comment --> onHide')
                if(onHide) onHide()
            }
            this.setState({hide_body: hide || gray})
        }
    }

    toggleCollapsed() {
        this.setState({collapsed: !this.state.collapsed});
    }
    revealBody() {
        this.setState({hide_body: false});
    }
    initEditor(props) {
        if(this.state.PostReplyEditor) return
        const {cont} = this.props;
        const content = cont.get(props.content);
        if (!content) return
        const post = content.get('author') + '/' + content.get('permlink')
        const PostReplyEditor = ReplyEditor(post + '-reply')
        const PostEditEditor = ReplyEditor(post + '-edit')
        if(process.env.BROWSER) {
            const formId = post
            let showEditor = localStorage.getItem('showEditor-' + formId)
            if(showEditor) {
                showEditor = JSON.parse(showEditor)
                if(showEditor.type === 'reply') {
                    this.setState({showReply: true})
                }
                if(showEditor.type === 'edit') {
                    this.setState({showEdit: true})
                }
            }
        }
        this.setState({PostReplyEditor, PostEditEditor})
    }
    render() {
        const {cont} = this.props;
        const dis = cont.get(this.props.content);
        if (!dis) {
            return <div>{translate('loading')}...</div>
        }
        const comment = dis.toJS();
        if(!comment.stats) {
            console.error('Comment -- missing stats object')
            comment.stats = {}
        }
        const {netVoteSign, hasReplies, authorRepLog10, hide, pictures, gray} = comment.stats
        const {author, json_metadata} = comment
        const {username, depth, anchor_link,
            showNegativeComments, ignore_list, noImage} = this.props
        const {onShowReply, onShowEdit, onDeletePost} = this
        const post = comment.author + '/' + comment.permlink
        const {PostReplyEditor, PostEditEditor, showReply, showEdit, hide_body} = this.state
        const Editor = showReply ? PostReplyEditor : PostEditEditor

        let {rootComment} = this.props
        if(!rootComment && depth === 1) {
            rootComment = comment.parent_author + '/' + comment.parent_permlink;
        }
        const comment_link = `/${comment.category}/@${rootComment}#@${comment.author}/${comment.permlink}`
        const ignore = ignore_list && ignore_list.has(comment.author)

        if(!showNegativeComments && (hide || ignore)) {
            return null;
        }

        let jsonMetadata = null
        try {
            if(!showReply) jsonMetadata = JSON.parse(json_metadata)
        } catch(error) {
            // console.error('Invalid json metadata string', json_metadata, 'in post', this.props.content);
        }
        // const get_asset_value = ( asset_str ) => { return parseFloat( asset_str.split(' ')[0] ); }
        // const steem_supply = this.props.global.getIn(['props','current_supply']);

        const showDeleteOption = username === author && !hasReplies && netVoteSign <= 0
        const showEditOption = username === author
        const readonly = comment.mode == 'archived' || $STM_Config.read_only_mode

        let replies = null;
        let body = null;
        let controls = null;

        if (!this.state.collapsed && !hide_body) {
            body = (<MarkdownViewer formId={post + '-viewer'} text={comment.body}
                noImage={noImage || !pictures} jsonMetadata={jsonMetadata} />);
            controls = <div>
                <Voting post={post} />
                {!readonly &&
                    <span className="Comment__footer__controls">
                        {depth < 6 && <a onClick={onShowReply}>{translate('reply')}</a>}
                        {' '}{showEditOption   && <a onClick={onShowEdit}>{translate('edit')}</a>}
                        {' '}{showDeleteOption && <a onClick={onDeletePost}>{translate('delete')}</a>}
                    </span>}
            </div>;
        }

        if(!this.state.collapsed) {
            replies = comment.replies;
            sortComments( cont, replies, this.props.sort_order );
            // When a comment has hidden replies and is collapsed, the reply count is off
            //console.log("replies:", replies.length, "num_visible:", replies.filter( reply => !g.get('content').get(reply).getIn(['stats', 'hide'])).length)
            replies = replies.map((reply, idx) => (
                <Comment
                    key={idx}
                    content={reply}
                    cont={cont}
                    sort_order={this.props.sort_order}
                    depth={depth + 1}
                    rootComment={rootComment}
                    showNegativeComments={showNegativeComments}
                />)
            );
        }

        const commentClasses = ['hentry']
        commentClasses.push('Comment')
        commentClasses.push(this.props.root ? 'root' : 'reply')
        if(hide_body || this.state.collapsed) commentClasses.push('collapsed');

        let innerCommentClass = ignore || gray ? 'downvoted' : ''
        if(this.state.highlight) innerCommentClass = innerCommentClass + ' highlighted'

        //console.log(comment);
        let renderedEditor = null;
        if (showReply || showEdit) {
            renderedEditor = <div key="editor">
                <Editor {...comment} type={showReply ? 'submit_comment' : 'edit'}
                                     successCallback={() => {
                                this.setState({showReply: false, showEdit: false})
                                this.saveOnShow(null)
                            }}
                                     onCancel={() => {
                                this.setState({showReply: false, showEdit: false})
                                this.saveOnShow(null)
                            }}
                                     jsonMetadata={jsonMetadata}
                />
            </div>
        }

        let depth_indicator = [];
        if (depth > 1) {
            for (let i = 1; i < depth; ++i) {
                depth_indicator.push(<div key={i} className={`depth di-${i}`}>&middot;</div>);
            }
        }

        return (
            <div className={commentClasses.join(' ')} id={anchor_link} itemScope itemType ="http://schema.org/comment">
                {depth_indicator}
                <div className="Comment__Userpic show-for-medium">
                    <Userpic account={comment.author} />
                </div>
                <div className={innerCommentClass}>
                    <div className="Comment__header">
                        <div className="Comment__header_collapse">
                            <Voting post={post} flag />
                            <a title={translate('collapse_or_expand')} onClick={this.toggleCollapsed}>{ this.state.collapsed ? '[+]' : '[-]' }</a>
                        </div>
                        <span className="Comment__header-user">
                            <div className="Comment__Userpic-small">
                                <Userpic account={comment.author} />
                            </div>
                            <Author author={comment.author} authorRepLog10={authorRepLog10} />
                        </span>
                        &nbsp; &middot; &nbsp;
                        <Link to={comment_link} className="PlainLink">
                            <TimeAgoWrapper date={comment.created} className="updated" />
                        </Link>
                        { (this.state.collapsed || hide_body) &&
                          <Voting post={post} showList={false} /> }
                        { this.state.collapsed && comment.children > 0 &&
                          <span className="marginLeft1rem">{translate('reply_count', {replyCount: comment.children})}</span>}
                        { !this.state.collapsed && hide_body &&
                            <a className="marginLeft1rem" onClick={this.revealBody}>{translate('reveal_comment')}</a>}
                    </div>
                    <div className="Comment__body entry-content">
                        {showEdit ? renderedEditor : body}
                    </div>
                    <div className="Comment__footer">
                        {controls}
                    </div>
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
        const {content} = ownProps

        const username = state.user.getIn(['current', 'username'])
        const ignore_list = username ? state.global.getIn(['follow', 'get_following', username, 'ignore_result']) : null

        return {
            ...ownProps,
            anchor_link: '#@' + content, // Using a hash here is not standard but intentional; see issue #124 for details
            username,
            ignore_list
        }
    },

    // mapDispatchToProps
    (dispatch) => ({
        unlock: () => { dispatch(user.actions.showLogin()) },
        deletePost: (author, permlink) => {
            dispatch(transaction.actions.broadcastOperation({
                type: 'delete_comment',
                operation: {author, permlink},
                confirm: translate('are_you_sure'),
            }))
        },
    })
)(CommentImpl)
export default Comment;
