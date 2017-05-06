import React from 'react';
import Author from 'app/components/elements/Author';
import ReplyEditor from 'app/components/elements/ReplyEditor';
import MarkdownViewer from 'app/components/cards/MarkdownViewer';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate'
// import FormattedAsset from 'app/components/elements/FormattedAsset';
import Voting from 'app/components/elements/Voting';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import user from 'app/redux/User';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import Userpic from 'app/components/elements/Userpic';
import transaction from 'app/redux/Transaction'
import {List} from 'immutable'
import { translate } from 'app/Translator';

export function sortComments( cont, comments, sort_order ) {

  function netNegative(a)  {
      return a.get("net_rshares") < 0;
  }

  let sort_orders = {
  /** sort replies by active */
      votes: (a,b) => {
                let acontent = cont.get(a);
                let bcontent = cont.get(b);
                let aactive = acontent.get('active_votes').size;
                let bactive = bcontent.get('active_votes').size;
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
                let aactive = acontent.get('children_rshares2');
                let bactive = bcontent.get('children_rshares2');
                aactive = ("0").repeat( 100 - aactive.length ) + aactive;
                bactive = ("0").repeat( 100 - bactive.length ) + bactive;
                if( bactive < aactive ) return -1;
                if( bactive > aactive ) return 1;
                return 0;
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
        rootComment: React.PropTypes.string.isRequired,
        comment_link: React.PropTypes.string.isRequired,
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
            if(hide) {
                const {onHide} = this.props
                // console.log('Comment --> onHide')
                if(onHide) onHide()
            }
            this.setState({hide_body: hide || content.getIn(['stats', 'netVoteSign']) == -1})
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
        const {username, depth, rootComment, comment_link, anchor_link,
            showNegativeComments, ignore, noImage} = this.props
        const {onShowReply, onShowEdit, onDeletePost} = this
        const post = comment.author + '/' + comment.permlink
        const {PostReplyEditor, PostEditEditor, showReply, showEdit, hide_body} = this.state
        const Editor = showReply ? PostReplyEditor : PostEditEditor

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
                noImage={noImage || !pictures} jsonMetadata={jsonMetadata} timeCteated={new Date(comment.created)} />);
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

        return (
            <div className={commentClasses.join(' ')} id={anchor_link} itemScope itemType ="http://schema.org/comment">
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
        const {content, cont} = ownProps
        let {depth} = ownProps
        if(depth == null) depth = 1
        const c = cont.get(content);
        let comment_link = null
        let rc = ownProps.rootComment
        if(c) {
            if(depth === 1) rc = c.get('parent_author') + '/' + c.get('parent_permlink')
            comment_link = `/${c.get('category')}/@${rc}#@${c.get('author')}/${c.get('permlink')}`
        }
        const current = state.user.get('current')
        const username = current ? current.get('username') : null

        const key = ['follow', 'get_following', username, 'ignore_result', c.get('author')]
        const ignore = username ? state.global.hasIn(key) : false
        // if(ignore) console.log(username, 'ignored comment by', c.get('author'), '\t', comment_link)

        return {
            ...ownProps,
            comment_link,
            anchor_link: '#@' + content, // Using a hash here is not standard but intentional; see issue #124 for details
            rootComment: rc,
            username,
            ignore
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
