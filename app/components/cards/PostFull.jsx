import React from 'react';
import { Link } from 'react-router';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import pluralize from 'pluralize';
import Icon from 'app/components/elements/Icon';
import { connect } from 'react-redux';
import user from 'app/redux/User';
import transaction from 'app/redux/Transaction'
import Voting from 'app/components/elements/Voting';
import Reblog from 'app/components/elements/Reblog';
import Tooltip from 'app/components/elements/Tooltip';
import MarkdownViewer from 'app/components/cards/MarkdownViewer';
import ReplyEditor from 'app/components/elements/ReplyEditor';
import {immutableAccessor} from 'app/utils/Accessors';
import extractContent from 'app/utils/ExtractContent';
import FoundationDropdownMenu from 'app/components/elements/FoundationDropdownMenu';
import TagList from 'app/components/elements/TagList';
import Author from 'app/components/elements/Author';
import {Long} from 'bytebuffer'
import {List} from 'immutable'
import {repLog10, parsePayoutAmount} from 'app/utils/ParsersAndFormatters';
import DMCAList from 'app/utils/DMCAList'
import PageViewsCounter from 'app/components/elements/PageViewsCounter';
import ShareMenu from 'app/components/elements/ShareMenu';
import {serverApiRecordEvent} from 'app/utils/ServerApiClient';
import { translate } from 'app/Translator';
import { APP_NAME, APP_ICON, APP_NAME_LATIN, APP_URL, SEO_TITLE } from 'config/client_config';
import { isPostVisited, visitPost } from 'app/utils/helpers';

function TimeAuthorCategory({content, authorRepLog10, showTags}) {
    return (
        <span className="PostFull__time_author_category vcard">
            <Tooltip t={new Date(content.created).toLocaleString()}>
                <Icon name="clock" className="space-right" />
                <TimeAgoWrapper date={content.created} className="updated" />
            </Tooltip>
            {translate('by')} <Author author={content.author} authorRepLog10={authorRepLog10} />
            {showTags && <span> {translate('in')} <TagList post={content} single /></span>}
        </span>
     );
}

class PostFull extends React.Component {
    static propTypes = {
        // html props
        /* Show extra options (component is being viewed alone) */
        cont: React.PropTypes.object.isRequired,
        post: React.PropTypes.string.isRequired,

        // connector props
        username: React.PropTypes.string,
        unlock: React.PropTypes.func.isRequired,
        deletePost: React.PropTypes.func.isRequired,
        showPromotePost: React.PropTypes.func.isRequired,
    };

    constructor() {
        super();
        this.state = {};
        this.vkShare = this.vkShare.bind(this);
        this.fbShare = this.fbShare.bind(this);
        this.twitterShare = this.twitterShare.bind(this);
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
            const content = this.props.cont.get(this.props.post);
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

                if (!isPostVisited(this.props.post)) {
                    visitPost(this.props.post);
                }
            }
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        const names = 'cont, post, username'.split(', ')
        return names.findIndex(name => this.props[name] !== nextProps[name]) !== -1 ||
            this.state !== nextState
    }

    fbShare(e) {
        serverApiRecordEvent('FbShare', this.share_params.link);
        e.preventDefault();
        window.FB.ui({
            method: 'share',
            href: this.share_params.url
        }, () => {});
    }

    twitterShare(e) {
        serverApiRecordEvent('TwitterShare', this.share_params.link);
        e.preventDefault();
        const winWidth = 640;
        const winHeight = 320;
        const winTop = (screen.height / 2) - (winWidth / 2);
        const winLeft = (screen.width / 2) - (winHeight / 2);
        const s = this.share_params;
        const q = 'text=' + encodeURIComponent(s.title) + '&url=' + encodeURIComponent(s.url);
        window.open('http://twitter.com/share?' + q, 'Share', 'top=' + winTop + ',left=' + winLeft + ',toolbar=0,status=0,width=' + winWidth + ',height=' + winHeight);
    }

    vkShare = (e) => {
        e.preventDefault();
        const winWidth = 720;
        const winHeight = 480;
        const winTop = (screen.height / 2) - (winWidth / 2);
        const winLeft = (screen.width / 2) - (winHeight / 2);
        window.open('https://vk.com/share.php?url=' + this.share_params.url, this.share_params, 'top=' + winTop + ',left=' + winLeft + ',toolbar=0,status=0,width=' + winWidth + ',height=' + winHeight)
    }

    showPromotePost = () => {
        const post_content = this.props.cont.get(this.props.post);
        if (!post_content) return
        const author = post_content.get('author')
        const permlink = post_content.get('permlink')
        this.props.showPromotePost(author, permlink)
    }

    render() {
        const {props: {username, post}, state: {PostFullReplyEditor, PostFullEditEditor, formId, showReply, showEdit},
            onShowReply, onShowEdit, onDeletePost} = this
        const post_content = this.props.cont.get(this.props.post);
        if (!post_content) return null;
        const p = extractContent(immutableAccessor, post_content);
        const content = post_content.toJS();
        const {author, permlink, parent_author, parent_permlink} = content
        const jsonMetadata = this.state.showReply ? null : p.json_metadata
        // let author_link = '/@' + content.author;
        let link = `/@${content.author}/${content.permlink}`;
        if (content.category) link = `/${content.category}${link}`;

        const {category, title, body} = content;
        if (process.env.BROWSER && title) document.title = title + ' | ' + SEO_TITLE;

        let content_body = content.body;
        const url = `/${category}/@${author}/${permlink}`
        if(DMCAList.includes(url)) {
            content_body = 'This post is not available due to a copyright claim.'
        }

        const replyParams = {author, permlink, parent_author, parent_permlink, category, title, body}

        let net_rshares = Long.ZERO
        post_content.get('active_votes', List()).forEach(v => {
            // ? Remove negative votes unless full power -1000 (we had downvoting spam)
            const percent = v.get('percent')
            if(percent < 0 /*&& percent !== -1000*/) return
            net_rshares = net_rshares.add(Long.fromString(String(v.get('rshares'))))
        })
        const showDeleteOption = username === author &&
            post_content.get('replies', List()).size === 0 &&
            net_rshares.compare(Long.ZERO) <= 0

        this.share_params = {
            link,
            url: 'https://' + APP_URL + link,
            title: title + ' | '+ SEO_TITLE,
            desc: p.desc
        };

        const share_menu = [
            {link: '#', onClick: this.vkShare, value: 'VK', icon: 'vk'},
            {link: '#', onClick: this.fbShare, value: 'Facebook', icon: 'facebook'},
            {link: '#', onClick: this.twitterShare, value: 'Twitter', icon: 'twitter'},
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
        const full_power = post_content.get('percent_steem_dollars') === 0;

        let post_header = <h1 className="entry-title">
                {content.title}
                {full_power && <span title="Powered Up 100%"><Icon name={APP_ICON} /></span>}
            </h1>
        if(content.depth > 0) {
            let parent_link = `/${content.category}/@${content.parent_author}/${content.parent_permlink}`;
            let direct_parent_link
            if(content.depth > 1) {
                direct_parent_link = <li>
                    <Link to={parent_link}>
                        {translate('view_the_direct_parent')}
                    </Link>
                </li>
            }
            post_header = <div className="callout">
                <h3 className="entry-title">{translate('re')}: {content.root_title}</h3>
                <h5>{translate('you_are_viewing_single_comments_thread_from')}:</h5>
                <p>
                    {content.root_title}
                </p>
                <ul>
                    <li>
                        <Link to={content.url}>
                            {translate('view_the_full_context')}
                        </Link>
                    </li>
                    {direct_parent_link}
                </ul>
            </div>
        }

        const readonly = post_content.get('mode') === 'archived' || $STM_Config.read_only_mode
        const showPromote = username && post_content.get('mode') === "first_payout" && post_content.get('depth') == 0
        const showReplyOption = post_content.get('depth') < 6
        const showEditOption = username === author
        const authorRepLog10 = repLog10(content.author_reputation)
        const isPreViewCount = Date.parse(post_content.get('created')) < 1480723200000 // check if post was created before view-count tracking began (2016-12-03)

        return (
            <article className="PostFull hentry" itemScope itemType="http://schema.org/blogPost">
                {showEdit ?
                    renderedEditor :
                    <span>
                        <div className="float-right"><Voting post={post} flag /></div>
                        <div className="PostFull__header">
                            {post_header}
                            <TimeAuthorCategory content={content} authorRepLog10={authorRepLog10} showTags />
                        </div>
                        <div className="PostFull__body entry-content">
                            <MarkdownViewer formId={formId + '-viewer'}
                                            text={content_body}
                                            jsonMetadata={jsonMetadata}
                                            large highQualityPost={high_quality_post}
                                            noImage={!content.stats.pictures}
                                            timeCteated={new Date(content.created)}
                            />
                        </div>
                    </span>
                }

                {showPromote && <button className="Promote__button float-right button hollow tiny" onClick={this.showPromotePost}>{translate('promote')}</button>}
                <TagList post={content} horizontal />
                <div className="PostFull__footer row">
                    <div className="column small-12 medium-6 large-6">
                        <TimeAuthorCategory content={content} authorRepLog10={authorRepLog10} />
                        <Voting post={post} />
                    </div>
                    <div className="RightShare__Menu small-12 medium-6 large-6 columns text-right">
                        {!readonly && <Reblog author={author} permlink={permlink} />}
                        {!readonly &&
                            <span className="PostFull__reply">
                                {showReplyOption && <a onClick={onShowReply}>{translate('reply')}</a>}
                                {' '}{showEditOption   && !showEdit  && <a onClick={onShowEdit}>{translate('edit')}</a>}
                                {' '}{showDeleteOption && !showReply && <a onClick={onDeletePost}>{translate('delete')}</a>}
                            </span>}
                        <span className="PostFull__responses">
                            <Link to={link} title={translate('response_count', {responseCount: content.children})}>
                                <Icon name="chatboxes" className="space-right" />{content.children}
                            </Link>
                        </span>
                        <span className="PostFull__views">
                            <PageViewsCounter hidden={false} sinceDate={isPreViewCount ? 'Dec 2016' : null} />
                        </span>
                        <ShareMenu menu={share_menu} />
                    </div>
                </div>
                <div className="row">
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
            }));
        },
        showPromotePost: (author, permlink) => {
            dispatch({type: 'global/SHOW_DIALOG', payload: {name: 'promotePost', params: {author, permlink}}});
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
