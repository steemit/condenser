import React from 'react';
import { Link } from 'react-router';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import pluralize from 'pluralize';
import Icon from 'app/components/elements/Icon';
import { connect } from 'react-redux';
// import FormattedAsset from 'app/components/elements/FormattedAsset';
// import Userpic from 'app/components/elements/Userpic';
import user from 'app/redux/User';
import transaction from 'app/redux/Transaction'
import Voting from 'app/components/elements/Voting';
import Tooltip from 'app/components/elements/Tooltip';
import MarkdownViewer from 'app/components/cards/MarkdownViewer';
import ReplyEditor from 'app/components/elements/ReplyEditor';
import {immutableAccessor} from 'app/utils/Accessors';
import extractContent from 'app/utils/ExtractContent';
import FoundationDropdownMenu from 'app/components/elements/FoundationDropdownMenu';
import Follow from 'app/components/elements/Follow';
import TagList from 'app/components/elements/TagList';
import Author from 'app/components/elements/Author';
import {Long} from 'bytebuffer'
import {List} from 'immutable'
import {/*formatDecimal,*/ parsePayoutAmount} from 'app/utils/ParsersAndFormatters';

export default class PostFull extends React.Component {
    static propTypes = {
        // html props
        /* Show extra options (component is being viewed alone) */
        global: React.PropTypes.object.isRequired,
        post: React.PropTypes.string.isRequired,

        // connector props
        username: React.PropTypes.string,
        unlock: React.PropTypes.func.isRequired,
        deletePost: React.PropTypes.func.isRequired,
    };

    constructor() {
        super();
        this.state = {};
        this.fbShare = this.fbShare.bind(this);
        this.twitterShare = this.twitterShare.bind(this);
        this.linkedInShare = this.linkedInShare.bind(this);
        this.onShowReply = () => {
            const {state: {showReply, formId}} = this
            this.setState({showReply: !showReply, showEdit: false})
            saveOnShow(formId, !showReply ? 'reply' : null)
        }
        this.onShowEdit = () => {
            const {state: {showEdit, formId}} = this
            this.setState({showEdit: !showEdit, showReply: false})
            saveOnShow(formId, !showEdit ? 'edit' : null)
        }
        this.onDeletePost = () => {
            const {props: {deletePost}} = this
            const content = this.props.global.get('content').get(this.props.post);
            deletePost(content.get('author'), content.get('permlink'))
        }
    }

    componentWillMount() {
        const {post} = this.props
        const formId = `postFull-${post}`
        this.setState({
            formId,
            PostFullReplyEditor: ReplyEditor(formId + '-reply'),
            PostFullEditEditor: ReplyEditor(formId + '-edit')
        })
        if (process.env.BROWSER) {
            let showEditor = localStorage.getItem('showEditor-' + formId)
            if (showEditor) {
                showEditor = JSON.parse(showEditor)
                if (showEditor.type === 'reply') {
                    this.setState({showReply: true})
                }
                if (showEditor.type === 'edit') {
                    this.setState({showEdit: true})
                }
            }
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        const names = 'global, post, username'.split(', ')
        return names.findIndex(name => this.props[name] !== nextProps[name]) !== -1 ||
            this.state !== nextState
    }

    fbShare(e) {
        e.preventDefault();
        window.FB.ui({
            method: 'share',
            href: this.share_params.url
        }, () => {});
    }

    twitterShare(e) {
        e.preventDefault();
        const winWidth = 640;
        const winHeight = 320;
        const winTop = (screen.height / 2) - (winWidth / 2);
        const winLeft = (screen.width / 2) - (winHeight / 2);
        const s = this.share_params;
        const q = 'text=' + encodeURIComponent(s.title) + '&url=' + encodeURIComponent(s.url);
        window.open('http://twitter.com/share?' + q, 'Share', 'top=' + winTop + ',left=' + winLeft + ',toolbar=0,status=0,width=' + winWidth + ',height=' + winHeight);
    }

    linkedInShare(e) {
        e.preventDefault();
        const winWidth = 720;
        const winHeight = 480;
        const winTop = (screen.height / 2) - (winWidth / 2);
        const winLeft = (screen.width / 2) - (winHeight / 2);
        const s = this.share_params;
        const q = 'title=' + encodeURIComponent(s.title) + '&url=' + encodeURIComponent(s.url) + '&source=Steemit&mini=true';
        window.open('https://www.linkedin.com/shareArticle?' + q, 'Share', 'top=' + winTop + ',left=' + winLeft + ',toolbar=0,status=0,width=' + winWidth + ',height=' + winHeight);
    }

    render() {
        const {props: {username, post}, state: {PostFullReplyEditor, PostFullEditEditor, formId, showReply, showEdit},
            onShowReply, onShowEdit, onDeletePost} = this
        const post_content = this.props.global.get('content').get(this.props.post);
        if (!post_content) return null;
        const p = extractContent(immutableAccessor, post_content);
        const content = post_content.toJS();
        const {author, permlink, parent_author, parent_permlink} = content
        const jsonMetadata = this.state.showReply ? null : p.json_metadata
        // let author_link = '/@' + content.author;
        let link = `/@${content.author}/${content.permlink}`;
        if (content.category) link = `/${content.category}${link}`;

        const content_body = content.body;
        const {category, title, body} = content;
        if (process.env.BROWSER && title) document.title = title + ' — Steemit';

        const replyParams = {author, permlink, parent_author, parent_permlink, category, title, body}

        let net_rshares = Long.ZERO
        post_content.get('active_votes', List()).forEach(v => {
            // Remove negative votes unless full power -1000 (we had downvoting spam)
            // const percent = v.get('percent')
            // if(percent < 0 && percent !== -1000) return
            net_rshares = net_rshares.add(Long.fromString(String(v.get('rshares'))))
        })
        const showDeleteOption = username === author &&
            post_content.get('replies', List()).size === 0 &&
            net_rshares.compare(Long.ZERO) <= 0

        this.share_params = {
            url: 'https://steemit.com' + link,
            title: title + ' — Steemit',
            desc: p.desc
        };

        const share_menu = [
            {link: '#', onClick: this.fbShare, value: 'Facebook', icon: 'facebook'},
            {link: '#', onClick: this.twitterShare, value: 'Twitter', icon: 'twitter'},
            {link: '#', onClick: this.linkedInShare, value: 'LinkedIn', icon: 'linkedin'},
        ];
        const Editor = this.state.showReply ? PostFullReplyEditor : PostFullEditEditor
        let renderedEditor = null;
        if (showReply || showEdit) {
            renderedEditor = <div key="editor">
                <Editor {...replyParams} type={this.state.showReply ? 'submit_comment' : 'edit'}
                                         successCallback={() => {
                                                this.setState({showReply: false, showEdit: false})
                                                saveOnShow(formId, null)
                                            }}
                                         onCancel={() => {
                                                this.setState({showReply: false, showEdit: false});
                                                saveOnShow(formId, null)
                                            }}
                                         jsonMetadata={jsonMetadata}
                />
            </div>
        }

        const pending_payout = parsePayoutAmount(content.pending_payout_value);
        const total_payout = parsePayoutAmount(content.total_payout_value);
        const high_quality_post = pending_payout + total_payout > 10.0;
        const showEditOption = username === author && total_payout === 0

        const time_author_category = <span className="PostFull__time_author_category vcard">
            <Tooltip t={new Date(content.created).toLocaleString()}>
                <Icon name="clock" className="space-right" />
                <span className="TimeAgo"><TimeAgoWrapper date={content.created} /></span>
            </Tooltip>
            <span> by <Author author={content.author} /></span>
        </span>;

        return (
            <article className="PostFull hentry" itemScope itemType ="http://schema.org/blogPost">
                <div className="float-right"><Voting post={post} flag /></div>
                <div className="PostFull__header">
                    <h1 className="entry-title">{content.title}</h1>
                    {time_author_category}
                </div>
                {showEdit ?
                    renderedEditor :
                    <div className="PostFull__body entry-content">
                        <MarkdownViewer formId={formId + '-viewer'} text={content_body} jsonMetadata={jsonMetadata} large highQualityPost={high_quality_post} />
                    </div>
                }

                <div className="PostFull__footer row align-middle">
                    <div className="column">
                        {time_author_category}
                        <Voting post={post} pending_payout={content.pending_payout_value} total_payout={content.total_payout_value} cashout_time={content.cashout_time} />
                    </div>
                    <div className="column shrink">
                            <span className="PostFull__responses">
                                <Link to={link} title={pluralize('Responses', content.children, true)}>
                                    <Icon name="chatboxes" className="space-right" />{content.children}
                                </Link>
                            </span>
                            <span className="PostFull__reply">
                                {!$STM_Config.read_only_mode && <a onClick={onShowReply}>Reply</a>}
                                {showEditOption && !showEdit && <span>
                                    &nbsp;&nbsp;
                                    <a onClick={onShowEdit}>Edit</a>
                                </span>}
                                {showDeleteOption && !showReply && <span>
                                    &nbsp;&nbsp;
                                    <a onClick={onDeletePost}>Delete</a>
                                </span>}
                            </span>
                            <FoundationDropdownMenu menu={share_menu} icon="share" label="Share" dropdownPosition="bottom" dropdownAlignment="right" />
                    </div>
                </div>
                <div className="row">
                    <div className="column small-12">
                        <TagList post={content} horizontal />
                    </div>
                    <div className="column large-8 medium-10 small-12">
                        {showReply && renderedEditor}
                    </div>
                </div>
            </article>
        )
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => ({
        ...ownProps,
        username: state.user.getIn(['current', 'username']),
    }),

    // mapDispatchToProps
    (dispatch) => ({
        dispatchSubmit: data => { dispatch(user.actions.usernamePasswordLogin({...data})) },
        clearError: () => { dispatch(user.actions.loginError({error: null})) },
        unlock: () => { dispatch(user.actions.showLogin()) },
        deletePost: (author, permlink) => {
            dispatch(transaction.actions.broadcastOperation({
                type: 'delete_comment',
                operation: {author, permlink},
                confirm: 'Are you sure?'
            }))
        },
    })
)(PostFull)

const saveOnShow = (formId, type) => {
    if (process.env.BROWSER) {
        if (type)
            localStorage.setItem('showEditor-' + formId, JSON.stringify({type}, null, 0))
        else {
            // console.log('del formId', formId)
            localStorage.removeItem('showEditor-' + formId)
            localStorage.removeItem('replyEditorData-' + formId + '-reply')
            localStorage.removeItem('replyEditorData-' + formId + '-edit')
        }
    }
}
