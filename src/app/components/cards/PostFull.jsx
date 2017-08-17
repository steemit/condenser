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
import MarkdownViewer from 'app/components/cards/MarkdownViewer';
import ReplyEditor from 'app/components/elements/ReplyEditor';
import {immutableAccessor} from 'app/utils/Accessors';
import extractContent from 'app/utils/ExtractContent';
import TagList from 'app/components/elements/TagList';
import Author from 'app/components/elements/Author';
import {repLog10, parsePayoutAmount} from 'app/utils/ParsersAndFormatters';
import DMCAList from 'app/utils/DMCAList'
import PageViewsCounter from 'app/components/elements/PageViewsCounter';
import ShareMenu from 'app/components/elements/ShareMenu';
import {serverApiRecordEvent} from 'app/utils/ServerApiClient';
import Userpic from 'app/components/elements/Userpic';
import { APP_DOMAIN, APP_NAME } from 'app/client_config';
import tt from 'counterpart';
import userIllegalContent from 'app/utils/userIllegalContent';

// function loadFbSdk(d, s, id) {
//     return new Promise(resolve => {
//         window.fbAsyncInit = function () {
//             window.FB.init({
//                 appId: $STM_Config.fb_app,
//                 xfbml: false,
//                 version: 'v2.6',
//                 status: true
//             });
//             resolve(window.FB);
//         };
//
//         var js, fjs = d.getElementsByTagName(s)[0];
//         if (d.getElementById(id)) {return;}
//         js = d.createElement(s);
//         js.id = id;
//         js.src = "//connect.facebook.net/en_US/sdk.js";
//         fjs.parentNode.insertBefore(js, fjs);
//     });
// }

function TimeAuthorCategory({content, authorRepLog10, showTags}) {
    return (
      <span className="PostFull__time_author_category vcard">
        <Icon name="clock" className="space-right" />
        <TimeAgoWrapper date={content.created} className="updated" />
        {} {tt('g.by')} <Author author={content.author} authorRepLog10={authorRepLog10} />
        {showTags && <span> {tt('g.in')} <TagList post={content} single /></span>}
      </span>
    );
}

function TimeAuthorCategoryLarge({content, authorRepLog10}) {
    return (
      <span className="PostFull__time_author_category_large vcard">
        <TimeAgoWrapper date={content.created} className="updated float-right" />
        <Userpic account={content.author} />
        <div className="right-side">
          <Author author={content.author} authorRepLog10={authorRepLog10} />
          <span> {tt('g.in')} <TagList post={content} single /></span>
        </div>
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
        showExplorePost: React.PropTypes.func.isRequired,
    };

    constructor() {
        super();
        this.state = {};
        this.fbShare = this.fbShare.bind(this);
        this.twitterShare = this.twitterShare.bind(this);
        this.linkedInShare = this.linkedInShare.bind(this);
        this.showExplorePost = this.showExplorePost.bind(this);
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
            }
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        const names = 'cont, post, username'.split(', ');
        return names.findIndex(name => this.props[name] !== nextProps[name]) !== -1 ||
            this.state !== nextState
    }

    fbShare(e) {
        const href = this.share_params.url;
        e.preventDefault();
        // loadFbSdk(document, 'script', 'facebook-jssdk').then(fb => {
        window.FB.ui({
            method: 'share',
            href
        }, (response) => {
            if (response && !response.error_message)
                serverApiRecordEvent('FbShare', this.share_params.link);
        });
        // });
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

    linkedInShare(e) {
        serverApiRecordEvent('LinkedInShare', this.share_params.link);
        e.preventDefault();
        const winWidth = 720;
        const winHeight = 480;
        const winTop = (screen.height / 2) - (winWidth / 2);
        const winLeft = (screen.width / 2) - (winHeight / 2);
        const s = this.share_params;
        const q = 'title=' + encodeURIComponent(s.title) + '&url=' + encodeURIComponent(s.url) + '&source=Steemit&mini=true';
        window.open('https://www.linkedin.com/shareArticle?' + q, 'Share', 'top=' + winTop + ',left=' + winLeft + ',toolbar=0,status=0,width=' + winWidth + ',height=' + winHeight);
    }

    showPromotePost = () => {
        const post_content = this.props.cont.get(this.props.post);
        if (!post_content) return
        const author = post_content.get('author')
        const permlink = post_content.get('permlink')
        this.props.showPromotePost(author, permlink)
    };

    showExplorePost = () => {
        const permlink = this.share_params.link;
        this.props.showExplorePost(permlink)
    };

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
        if (process.env.BROWSER && title) document.title = title + ' — '+ APP_NAME;

        let content_body = content.body;
        const url = `/${category}/@${author}/${permlink}`
        if(DMCAList.includes(url)) {
            content_body = tt('postfull_jsx.this_post_is_not_available_due_to_a_copyright_claim')
        }
        // detect illegal users
        if (userIllegalContent.includes(content.author)) {
            content_body = 'Not available for legal reasons.'
        }

        const replyParams = {author, permlink, parent_author, parent_permlink, category, title, body}

        this.share_params = {
            link,
            url: 'https://' + APP_DOMAIN + link,
            title: title + ' — ' + APP_NAME,
            desc: p.desc
        };

        const share_menu = [
            {link: '#', onClick: this.fbShare, value: 'Facebook', title: tt('postfull_jsx.share_on_facebook'), icon: 'facebook'},
            {link: '#', onClick: this.twitterShare, value: 'Twitter', title: tt('postfull_jsx.share_on_twitter'), icon: 'twitter'},
            {link: '#', onClick: this.linkedInShare, value: 'LinkedIn', title: tt('postfull_jsx.share_on_linkedin'), icon: 'linkedin'},
        ];

        const Editor = this.state.showReply ? PostFullReplyEditor : PostFullEditEditor;
        let renderedEditor = null;
        if (showReply || showEdit) {
            renderedEditor = (<div key="editor">
              <Editor
                  {...replyParams}
                  type={this.state.showReply ? 'submit_comment' : 'edit'}
                  successCallback={() => {
                        this.setState({showReply: false, showEdit: false});
                        saveOnShow(formId, null)
                    }}
                  onCancel={() => {
                        this.setState({showReply: false, showEdit: false});
                        saveOnShow(formId, null)
                    }}
                  jsonMetadata={jsonMetadata}
                />
            </div>)
        }
        const pending_payout = parsePayoutAmount(content.pending_payout_value);
        const total_payout = parsePayoutAmount(content.total_payout_value);
        const high_quality_post = pending_payout + total_payout > 10.0;
        const full_power = post_content.get('percent_steem_dollars') === 0;

        let post_header = (<h1 className="entry-title">
          {content.title}
          {full_power && <span title={tt('g.powered_up_100')}><Icon name="steem" /></span>}
        </h1>);
        if(content.depth > 0) {
            const parent_link = `/${content.category}/@${content.parent_author}/${content.parent_permlink}`;
            let direct_parent_link;
            if(content.depth > 1) {
                direct_parent_link = (<li>
                  <Link to={parent_link}>
                    {tt('postfull_jsx.view_the_direct_parent')}
                  </Link>
                </li>)
            }
            post_header = (<div className="callout">
              <h3 className="entry-title">{tt('g.re')}: {content.root_title}</h3>
              <h5>{tt('postfull_jsx.you_are_viewing_a_single_comments_thread_from')}:</h5>
              <p>
                {content.root_title}
              </p>
              <ul>
                <li>
                  <Link to={content.url}>
                    {tt('postfull_jsx.view_the_full_context')}
                  </Link>
                </li>
                {direct_parent_link}
              </ul>
            </div>)
        }

        const archived = post_content.get('cashout_time') === '1969-12-31T23:59:59' // TODO: audit after HF19. #1259
        const readonly = archived || $STM_Config.read_only_mode
        const showPromote = username && !archived && post_content.get('depth') == 0
        const showReplyOption = post_content.get('depth') < 255
        const showEditOption = username === author
        const showDeleteOption = username === author && content.stats.allowDelete

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
                        <TimeAuthorCategoryLarge content={content} authorRepLog10={authorRepLog10} />
                      </div>
                      <div className="PostFull__body entry-content">
                        <MarkdownViewer formId={formId + '-viewer'} text={content_body} jsonMetadata={jsonMetadata} large highQualityPost={high_quality_post} noImage={content.stats.gray} />
                      </div>
                    </span>
                }

            {showPromote && <button className="Promote__button float-right button hollow tiny" onClick={this.showPromotePost}>{tt('g.promote')}</button>}
            <TagList post={content} horizontal />
            <div className="PostFull__footer row">
              <div className="column">
                <TimeAuthorCategory content={content} authorRepLog10={authorRepLog10} />
                <Voting post={post} />
              </div>
              <div className="RightShare__Menu small-11 medium-5 large-5 columns text-right">
                {!readonly && <Reblog author={author} permlink={permlink} />}
                <span className="PostFull__reply">
                  {showReplyOption && <a onClick={onShowReply}>{tt('g.reply')}</a>}
                  {' '}{!readonly && showEditOption && !showEdit && <a onClick={onShowEdit}>{tt('g.edit')}</a>}
                  {' '}{!readonly && showDeleteOption && !showReply && <a onClick={onDeletePost}>{tt('g.delete')}</a>}
                </span>
                <span className="PostFull__responses">
                  <Link to={link} title={pluralize('Responses', content.children, true)}>
                    <Icon name="chatboxes" className="space-right" />{content.children}
                  </Link>
                </span>
                <span className="PostFull__views">
                  <PageViewsCounter hidden={false} sinceDate={isPreViewCount ? 'Dec 2016' : null} />
                </span>
                <ShareMenu menu={share_menu} />
                <button className="explore-post" title={tt('g.share_this_post')} onClick={this.showExplorePost}>
                  <Icon name="link" className="chain-right" />
                </button>
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
    dispatch => ({
        dispatchSubmit: (data) => { dispatch(user.actions.usernamePasswordLogin({...data})) },
        clearError: () => { dispatch(user.actions.loginError({error: null})) },
        unlock: () => { dispatch(user.actions.showLogin()) },
        deletePost: (author, permlink) => {
            dispatch(transaction.actions.broadcastOperation({
                type: 'delete_comment',
                operation: {author, permlink},
                confirm: tt('g.are_you_sure')
            }));
        },
        showPromotePost: (author, permlink) => {
            dispatch({type: 'global/SHOW_DIALOG', payload: {name: 'promotePost', params: {author, permlink}}});
        },
        showExplorePost: (permlink) => {
            dispatch({type: 'global/SHOW_DIALOG', payload: {name: 'explorePost', params: {permlink}}});
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
};
