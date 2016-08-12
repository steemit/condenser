import React from 'react';
import {browserHistory} from 'react-router';
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
// import Tooltip from 'app/components/elements/Tooltip';
import Icon from 'app/components/elements/Icon';
import Userpic from 'app/components/elements/Userpic';
import transaction from 'app/redux/Transaction'
import {List} from 'immutable'
import {Long} from 'bytebuffer'
import pluralize from 'pluralize';
import {parsePayoutAmount, repLog10} from 'app/utils/ParsersAndFormatters';

export function sortComments( g, comments, sort_order ){

  function netNegative(a)  {
      return a.get("net_rshares") < 0;
  }

  let sort_orders = {
  /** sort replies by active */
      active: (a,b) => {
                let acontent = g.get('content').get(a);
                let bcontent = g.get('content').get(b);
                if (netNegative(acontent)) {
                    return 1;
                } else if (netNegative(bcontent)) {
                    return -1;
                }
                let aactive = Date.parse( acontent.get('active') );
                let bactive = Date.parse( bcontent.get('active') );
                return bactive - aactive;
              },
      update: (a,b) => {
                let acontent = g.get('content').get(a);
                let bcontent = g.get('content').get(b);
                if (netNegative(acontent)) {
                    return 1;
                } else if (netNegative(bcontent)) {
                    return -1;
                }
                let aactive = Date.parse( acontent.get('last_update') );
                let bactive = Date.parse( bcontent.get('last_update') );
                return bactive.getTime() - aactive.getTime();
              },
      created:  (a,b) =>  {
                let acontent = g.get('content').get(a);
                let bcontent = g.get('content').get(b);
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
                let acontent = g.get('content').get(a);
                let bcontent = g.get('content').get(b);
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
        global: React.PropTypes.object.isRequired,
        content: React.PropTypes.string.isRequired,
        sort_order: React.PropTypes.oneOf(['active', 'update', 'created', 'trending']).isRequired,
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
        deletePost: React.PropTypes.func.isRequired,
    };
    static defaultProps = {
        depth: 1,
    }

    constructor() {
        super();
        // const hide_body = this.shouldHide(props)
        this.state = {show_details: true, hide_body: false};
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
                const g = this.props.global;
                const content = g.get('content').get(this.props.content)
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
            const content = this.props.global.get('content').get(this.props.content);
            deletePost(content.get('author'), content.get('permlink'))
        }
        this.toggleDetails = this.toggleDetails.bind(this);
    }

    componentWillMount() {
        this.initEditor(this.props)
        this._checkHide(this.props);
    }

    componentWillReceiveProps(np) {
        this._checkHide(np);
    }

    _checkHide(props) {
        const g = props.global;
        const content = g.get('content').get(props.content);
        if (content) {
            const {hide_body} = this.state
            const hide = content.getIn(['stats', 'hide'])
            if(hide || hide_body) {
                const {onHide} = this.props
                // console.log('Comment --> onHide')
                if(onHide) onHide()
            }
        }
    }

    shouldHide(props) {
        const {showNegativeComments} = props
        const content = this.props.global.getIn(['content', this.props.content]);
        return !showNegativeComments && content.getIn(['stats', 'hide'])
    }
    toggleDetails() {
        this.setState({show_details: !this.state.show_details});
    }
    revealBody() {
        this.setState({hide_body: false});
    }
    initEditor(props) {
        if(this.state.PostReplyEditor) return
        const g = props.global;
        const content = g.get('content').get(props.content);
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
        let g = this.props.global;
        const dis = g.get('content').get(this.props.content);
        if (!dis) {
            return <div>Loading...</div>
        }
        const comment = dis.toJS();
        if(!comment.stats) {
            console.error('Comment -- missing stats object')
            comment.stats = {}
        }
        const {netVoteSign, hasReplies, authorRepLog10, hide, pictures, gray} = comment.stats
        const {author, permlink, json_metadata} = comment
        const {username, depth, rootComment, comment_link,
            showNegativeComments, ignore, noImage} = this.props
        const {onCommentClick, onShowReply, onShowEdit, onDeletePost} = this
        const post = comment.author + '/' + comment.permlink
        const anchor_link = '#@' + post
        const {PostReplyEditor, PostEditEditor, showReply, showEdit, hide_body} = this.state
        const Editor = showReply ? PostReplyEditor : PostEditEditor

        if(!showNegativeComments && (hide || hide_body)) {
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

        // let robohash = "https://robohash.org/" + author + ".png?size=64x64"
        const total_payout = parsePayoutAmount(comment.total_payout_value);
        const showEditOption = username === author && total_payout === 0

        let replies = null;
        let body = null;
        let controls = null;

        if (this.state.show_details && (!hide_body || showNegativeComments)) {
            body = (<MarkdownViewer formId={post + '-viewer'} text={comment.body}
                noImage={noImage || !pictures} jsonMetadata={jsonMetadata} />);
            controls = (<div>
                <Voting post={post} pending_payout={comment.pending_payout_value} total_payout={comment.total_payout_value} />
                {!$STM_Config.read_only_mode && depth !== 5 && <a onClick={onShowReply}>Reply</a>}
                {showEditOption && <span>
                    &nbsp;&nbsp;
                    <a onClick={onShowEdit}>Edit</a>
                </span>}
                {showDeleteOption && <span>
                    &nbsp;&nbsp;
                    <a onClick={onDeletePost}>Delete</a>
                </span>}
            </div>);
        }

        if(this.state.show_details) {
            replies = comment.replies;
            sortComments( g, replies, this.props.sort_order );
            replies = replies.map((reply, idx) => <Comment key={idx} content={reply} global={g}
                sort_order={this.props.sort_order} depth={depth + 1} rootComment={rootComment} showNegativeComments={showNegativeComments} />);
        }

        const commentClasses = ['hentry']
        commentClasses.push('Comment')
        commentClasses.push(this.props.root ? 'root' : 'reply')
        if((hide_body && !showNegativeComments) || !this.state.show_details) commentClasses.push('collapsed');
        const downVotedClass = ignore || gray ? 'downvoted' : ' '
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
                <div className={downVotedClass}>
                    <div className="Comment__header">
                        <div className="Comment__header_collapse">
                            <Voting post={post} flag />
                            <a title="Collapse/Expand" onClick={this.toggleDetails}>{ this.state.show_details ? '[-]' : '[+]' }</a>
                        </div>
                        <span className="Comment__header-user">
                            <Icon name="user" className="Comment__Userpic-small" />
                            <span itemProp="author" itemScope itemType="http://schema.org/Person">
                                <Author author={comment.author} authorRepLog10={authorRepLog10} /></span>
                        </span>
                        &nbsp; &middot; &nbsp;
                        <Link to={comment_link} className="PlainLink">
                            <TimeAgoWrapper date={comment.created} />
                        </Link>
                        { !this.state.show_details && (hide_body && !showNegativeComments) &&
                          <Voting post={post} pending_payout={comment.pending_payout_value} total_payout={comment.total_payout_value} showList={comment.active_votes.length !== 0 ? true : false} /> }
                        { this.state.show_details || comment.children == 0 ||
                          <span className="marginLeft1rem">{pluralize('replies', comment.children, true)}</span>}
                        { this.state.show_details && (hide_body && !showNegativeComments) &&
                            <a className="marginLeft1rem" onClick={this.revealBody}>reveal comment</a>}
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
        const {global, content} = ownProps
        let {depth} = ownProps
        if(depth == null) depth = 1
        const c = global.getIn(['content', content])
        let comment_link = null
        let rc = ownProps.rootComment
        if(c) {
            if(depth === 1) rc = c.get('parent_author') + '/' + c.get('parent_permlink')
            comment_link = `/${c.get('category')}/@${rc}#@${c.get('author')}/${c.get('permlink')}`
        }
        const current = state.user.get('current')
        const username = current ? current.get('username') : null
        const key = ['follow', 'get_following', username, 'result', c.get('author')]
        const ignore = username ? state.global.getIn(key, List()).contains('ignore') : false
        return {
            ...ownProps,
            comment_link,
            rootComment: rc,
            username,
            ignore,
        }
    },

    // mapDispatchToProps
    (dispatch) => ({
        unlock: () => { dispatch(user.actions.showLogin()) },
        deletePost: (author, permlink) => {
            dispatch(transaction.actions.broadcastOperation({
                type: 'delete_comment',
                operation: {author, permlink},
                confirm: 'Are you sure?'
            }))
        },
    })
)(CommentImpl)
export default Comment;
