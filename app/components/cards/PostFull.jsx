import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import tt from 'counterpart';
import user from 'app/redux/User';
import transaction from 'app/redux/Transaction';
import { repLog10, parsePayoutAmount } from 'app/utils/ParsersAndFormatters';
import extractContent from 'app/utils/ExtractContent';
import { immutableAccessor } from 'app/utils/Accessors';
import DMCAList from 'app/utils/DMCAList';
import LEGALList from 'app/utils/LEGALList';
import { isPostVisited, visitPost } from 'app/utils/helpers';
import { serverApiRecordEvent } from 'app/utils/ServerApiClient';
import Icon from 'app/components/elements/Icon';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import Voting from 'app/components/elements/Voting';
import Reblog from 'app/components/elements/Reblog';
import MarkdownViewer from 'app/components/cards/MarkdownViewer';
import ReplyEditor from 'app/components/elements/ReplyEditor';
import TagList from 'app/components/elements/TagList';
import Author from 'app/components/elements/Author';
import PageViewsCounter from 'app/components/elements/PageViewsCounter';
import ShareMenu from 'app/components/elements/ShareMenu';
import Userpic from 'app/components/elements/Userpic';
import PostForm from 'app/components/modules/PostForm/PostForm';

import { APP_ICON, SEO_TITLE, LIQUID_TICKER } from 'app/client_config';

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

function TimeAuthorCategory({ content, authorRepLog10, showTags }) {
    return (
        <span className="PostFull__time_author_category vcard">
            <Icon name="clock" className="space-right" />
            <TimeAgoWrapper date={content.created} className="updated" />
            {} {tt('g.by')}{' '}
            <Author author={content.author} authorRepLog10={authorRepLog10} />
            {showTags && (
                <span>
                    {' '}
                    {tt('g.in')} <TagList post={content} single />
                </span>
            )}
        </span>
    );
}

function TimeAuthorCategoryLarge({ content, authorRepLog10 }) {
    return (
        <span className="PostFull__time_author_category_large vcard">
            <TimeAgoWrapper
                date={content.created}
                className="updated float-right"
            />
            <Userpic account={content.author} />
            <div className="right-side">
                <Author
                    author={content.author}
                    authorRepLog10={authorRepLog10}
                />
                <span>
                    {' '}
                    {tt('g.in')} <TagList post={content} single />
                </span>
            </div>
        </span>
    );
}

class PostFull extends React.Component {
    static propTypes = {
        // html props
        /* Show extra options (component is being viewed alone) */
        cont: PropTypes.object.isRequired,
        post: PropTypes.string.isRequired,
        aiPosts: PropTypes.array,

        // connector props
        username: PropTypes.string,
        unlock: PropTypes.func.isRequired,
        deletePost: PropTypes.func.isRequired,
        showPromotePost: PropTypes.func.isRequired,
        showExplorePost: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        const formId = `postFull-${props.post}`;

        this.PostFullEditor = ReplyEditor(formId + '-edit');
        this.PostFullReplyEditor = ReplyEditor(formId + '-reply');

        this.state = {
            formId,
        };

        if (process.env.BROWSER) {
            const { formId } = this.state;

            const showEditorJson = localStorage.getItem('showEditor-' + formId);

            if (showEditorJson) {
                const showEditor = JSON.parse(showEditorJson);

                if (showEditor.type === 'edit') {
                    const permLink = PostForm.getEditDraftPermLink();
                    const content = this.props.cont.get(this.props.post);

                    if (permLink === content.get('permlink')) {
                        this.state.showEdit = true;
                    }
                }

                if (showEditor.type === 'reply') {
                    this.state.showReply = true;
                }

                if (!isPostVisited(this.props.post)) {
                    visitPost(this.props.post);
                }
            }
        }
    }

    shouldComponentUpdate(props, state) {
        const { cont, post, username } = this.props;

        return (
            cont !== props.cont ||
            post !== props.post ||
            username !== props.username ||
            this.state !== state
        );
    }

    onShowReply = () => {
        const { showReply, formId } = this.state;
        const newShowReply = !showReply;

        this.setState({
            showReply: newShowReply,
            showEdit: false,
        });

        saveOnShow(formId, newShowReply ? 'reply' : null);
    };

    onShowEdit = () => {
        this.setState({
            showEdit: true,
            showReply: false,
        });

        saveOnShow(this.state.formId, 'edit');
    };

    onDeletePost = () => {
        const content = this.props.cont.get(this.props.post);
        this.props.deletePost(content.get('author'), content.get('permlink'));
    };

    fbShare = e => {
        const href = this.share_params.url;
        e.preventDefault();

        window.FB.ui(
            {
                method: 'share',
                href,
            },
            response => {
                if (response && !response.error_message) {
                    serverApiRecordEvent('FbShare', this.share_params.link);
                }
            }
        );
    };

    twitterShare = e => {
        e.preventDefault();

        const winWidth = 640;
        const winHeight = 320;
        const winTop = screen.height / 2 - winWidth / 2;
        const winLeft = screen.width / 2 - winHeight / 2;
        const s = this.share_params;

        const q =
            'text=' +
            encodeURIComponent(s.title) +
            '&url=' +
            encodeURIComponent(s.url);

        window.open(
            'http://twitter.com/share?' + q,
            'Share',
            `top=${winTop},left=${winLeft},toolbar=0,status=0,width=${winWidth},height=${winHeight}`
        );
    };

    vkShare = e => {
        e.preventDefault();
        const winWidth = 720;
        const winHeight = 480;
        const winTop = screen.height / 2 - winWidth / 2;
        const winLeft = screen.width / 2 - winHeight / 2;

        window.open(
            'https://vk.com/share.php?url=' + this.share_params.url,
            this.share_params,
            `top=${winTop},left=${winLeft},toolbar=0,status=0,width=${winWidth},height=${winHeight}`
        );
    };

    ljShare = e => {
        e.preventDefault();

        const href = this.share_params.url;
        const title = this.share_params.title;
        const desc = this.share_params.desc;
        const link = `<div><a href=${href}>${title}</a></div>`;

        window.open(
            `http://www.livejournal.com/update.bml?subject=${title}&event=${desc +
                link}`
        );
    };

    showPromotePost = () => {
        const postContent = this.props.cont.get(this.props.post);

        if (!postContent) {
            return;
        }

        const author = postContent.get('author');
        const permlink = postContent.get('permlink');

        this.props.showPromotePost(author, permlink);
    };

    showExplorePost = () => {
        this.props.showExplorePost(this.share_params.link);
    };

    showTransfer = () => {
        const postContent = this.props.cont.get(this.props.post);
        const content = postContent.toJS();
        const { author, url } = content;
        const asset = LIQUID_TICKER;
        const transferType = 'Transfer to Account';
        // const memo = url;
        // const memo = window.JSON.stringify({donate: {post: url}});
        // store/user/transfer_defaults structure initialized correctly for each transfer type
        // (click in wallet, external link, donate from PostFull)
        // so, mark this kind of transfer with a flag for now to analyze in transfer.jsx
        // the rest of transfer types don't have the flag for now
        // todo redesign transfer types globally
        const flag = {
            type: `donate`,
            fMemo: () => JSON.stringify({ donate: { post: url } }),
        };

        this.props.showTransfer({
            flag,
            to: author,
            asset,
            transferType,
            // memo,
            disableMemo: false,
            disableTo: true,
        });
    };

    render() {
        const { post, cont } = this.props;
        const { showReply, showEdit } = this.state;

        const postContent = cont.get(post);

        if (!postContent) {
            return null;
        }

        const p = extractContent(immutableAccessor, postContent);
        const content = postContent.toJS();
        const { author, permlink, parent_author, parent_permlink } = content;
        const jsonMetadata = this.state.showReply ? null : p.json_metadata;
        let link = `/@${content.author}/${content.permlink}`;

        const { category, title, body } = content;

        if (category) {
            link = `/${category}${link}`;
        }

        if (process.env.BROWSER && title) {
            document.title = title + ' | ' + SEO_TITLE;
        }

        const replyParams = {
            author,
            permlink,
            parent_author,
            parent_permlink,
            category,
            title,
            body,
        };

        const APP_DOMAIN = $STM_Config.site_domain;

        this.share_params = {
            link,
            url: 'https://' + APP_DOMAIN + link,
            title: title + ' | ' + SEO_TITLE,
            desc: p.desc,
        };

        const authorRepLog10 = repLog10(content.author_reputation);

        return (
            <article
                className="PostFull hentry"
                itemScope
                itemType="http://schema.org/blogPost"
            >
                {showEdit
                    ? this._renderPostEditor(replyParams, jsonMetadata)
                    : this._renderContent(
                          postContent,
                          content,
                          jsonMetadata,
                          authorRepLog10
                      )}
                {this._renderFooter(postContent, content, link, authorRepLog10)}
                <div className="row">
                    <div className="column large-8 medium-10 small-12">
                        {showReply && this._renderReplyEditor(replyParams)}
                    </div>
                </div>
            </article>
        );
    }

    _renderPostEditor(replyParams, jsonMetadata) {
        if (window.IS_MOBILE) {
            return (
                <this.PostFullEditor
                    {...replyParams}
                    type="edit"
                    jsonMetadata={jsonMetadata}
                    successCallback={this._onEditFinish}
                    onCancel={this._onEditFinish}
                />
            );
        } else {
            return (
                <PostForm
                    editMode
                    editParams={replyParams}
                    jsonMetadata={jsonMetadata}
                    onSuccess={this._onEditFinish}
                    onCancel={this._onEditFinish}
                />
            );
        }
    }

    _renderReplyEditor(replyParams) {
        return (
            <div>
                <this.PostFullReplyEditor
                    {...replyParams}
                    type="submit_comment"
                    successCallback={this._onEditFinish}
                    onCancel={this._onEditFinish}
                />
            </div>
        );
    }

    _renderContent(postContent, content, jsonMetadata, authorRepLog10) {
        const { username, post } = this.props;
        const { author, permlink, category } = content;

        const url = `/${category}/@${author}/${permlink}`;
        let contentBody;

        if (DMCAList.includes(url)) {
            contentBody = tt(
                'postfull_jsx.this_post_is_not_available_due_to_a_copyright_claim'
            );
        } else if (LEGALList.includes(url)) {
            contentBody = tt(
                'postfull_jsx.this_post_is_not_available_due_to_breach_of_legislation'
            );
        } else {
            contentBody = content.body;
        }

        const payout =
            parsePayoutAmount(content.pending_payout_value) +
            parsePayoutAmount(content.total_payout_value);

        const fullPower = postContent.get('percent_steem_dollars') === 0;

        let postHeader;

        if (content.depth > 0) {
            const parent_link = `/${category}/@${content.parent_author}/${
                content.parent_permlink
            }`;

            let direct_parent_link;

            if (content.depth > 1) {
                direct_parent_link = (
                    <li>
                        <Link to={parent_link}>
                            {tt('g.view_the_direct_parent')}
                        </Link>
                    </li>
                );
            }

            postHeader = (
                <div className="callout">
                    <h3 className="entry-title">
                        {tt('g.re')}: {content.root_title}
                    </h3>
                    <h5>
                        {tt('g.you_are_viewing_a_single_comments_thread_from')}:
                    </h5>
                    <p>{content.root_title}</p>
                    <ul>
                        <li>
                            <Link to={content.url}>
                                {tt('g.view_the_full_context')}
                            </Link>
                        </li>
                        {direct_parent_link}
                    </ul>
                </div>
            );
        } else {
            postHeader = (
                <h1 className="entry-title">
                    {content.title}
                    {fullPower && (
                        <span title={tt('g.powered_up_100')}>
                            <Icon name={APP_ICON} />
                        </span>
                    )}
                </h1>
            );
        }

        const main = [
            <span key="content">
                <div className="float-right">
                    <Voting post={post} flag />
                </div>
                <div className="PostFull__header">
                    {postHeader}
                    <TimeAuthorCategoryLarge
                        content={content}
                        authorRepLog10={authorRepLog10}
                    />
                </div>
                <div className="PostFull__body entry-content">
                    <MarkdownViewer
                        formId={this.state.formId + '-viewer'}
                        text={contentBody}
                        jsonMetadata={jsonMetadata}
                        large
                        highQualityPost={payout > 10}
                        noImage={!content.stats.pictures}
                        timeCteated={new Date(content.created)}
                    />
                </div>
            </span>,
        ];

        const showPromote =
            username &&
            postContent.get('last_payout') === '1970-01-01T00:00:00' &&
            postContent.get('depth') == 0; // TODO: audit after HF17. #1259

        if (showPromote) {
            main.push(
                <button
                    key="b1"
                    className="Promote__button float-right button hollow tiny"
                    onClick={this.showPromotePost}
                >
                    {tt('g.promote')}
                </button>
            );
        }

        if (username && username !== author) {
            main.push(
                <button
                    key="b2"
                    className="Donate__button float-right button hollow tiny"
                    onClick={this.showTransfer}
                >
                    {tt('g.donate')}
                </button>
            );
        }

        main.push(<TagList key="tags" post={content} horizontal />);

        return main;
    }

    _renderFooter(postContent, content, link, authorRepLog10) {
        const { username, post } = this.props;
        const { showReply, showEdit } = this.state;
        const { author, permlink } = content;

        const shareMenu = [
            {
                link: '#',
                onClick: this.ljShare,
                value: 'LJ',
                title: tt('postfull_jsx.share_on_lj'),
                icon: 'lj',
            },
            {
                link: '#',
                onClick: this.vkShare,
                value: 'VK',
                title: tt('postfull_jsx.share_on_vk'),
                icon: 'vk',
            },
            {
                link: '#',
                onClick: this.fbShare,
                value: 'Facebook',
                title: tt('postfull_jsx.share_on_facebook'),
                icon: 'facebook',
            },
            {
                link: '#',
                onClick: this.twitterShare,
                value: 'Twitter',
                title: tt('postfull_jsx.share_on_twitter'),
                icon: 'twitter',
            },
        ];

        const archived =
            postContent.get('cashout_time') === '1969-12-31T23:59:59'; // TODO: audit after HF17. #1259

        const readonly = archived || $STM_Config.read_only_mode;

        const showReplyOption = postContent.get('depth') < 255;
        const showEditOption = username === author;

        const showDeleteOption =
            username === author &&
            postContent.get('children') === 0 &&
            content.stats.netVoteSign <= 0;

        // check if post was created before view-count tracking began (2016-12-03)
        const isPreViewCount =
            Date.parse(postContent.get('created')) < 1480723200000;

        return (
            <div className="PostFull__footer row">
                <div className="column">
                    <TimeAuthorCategory
                        content={content}
                        authorRepLog10={authorRepLog10}
                    />
                    <Voting post={post} />
                </div>
                <div className="RightShare__Menu small-11 medium-5 large-5 columns text-right">
                    {!readonly ? (
                        <Reblog author={author} permlink={permlink} />
                    ) : null}
                    {!readonly && (
                        <span className="PostFull__reply">
                            {showReplyOption ? (
                                <a onClick={this.onShowReply}>
                                    {tt('g.reply')}
                                </a>
                            ) : null}{' '}
                            {showEditOption && !showEdit ? (
                                <a onClick={this.onShowEdit}>{tt('g.edit')}</a>
                            ) : null}{' '}
                            {showDeleteOption && !showReply ? (
                                <a onClick={this.onDeletePost}>
                                    {tt('g.delete')}
                                </a>
                            ) : null}
                        </span>
                    )}
                    <span className="PostFull__responses">
                        <Link
                            to={link}
                            title={tt('votesandcomments_jsx.response_count', {
                                count: content.children,
                            })}
                        >
                            <Icon name="chatboxes" className="space-right" />
                            {content.children}
                        </Link>
                    </span>
                    <span className="PostFull__views">
                        <PageViewsCounter
                            aiPosts={this.props.aiPosts}
                            sinceDate={isPreViewCount ? 'Dec 2016' : null}
                        />
                    </span>
                    <ShareMenu menu={shareMenu} />
                    <button
                        className="explore-post"
                        title={tt('g.share_this_post')}
                        onClick={this.showExplorePost}
                    >
                        <Icon name="link" className="chain-right" />
                    </button>
                </div>
            </div>
        );
    }

    _onEditFinish = () => {
        this.setState({
            showReply: false,
            showEdit: false,
        });

        saveOnShow(this.state.formId, null);
    };
}

function saveOnShow(formId, type) {
    if (process.env.BROWSER) {
        if (type) {
            localStorage.setItem(
                'showEditor-' + formId,
                JSON.stringify({ type }, null, 0)
            );
        } else {
            localStorage.removeItem('showEditor-' + formId);
            localStorage.removeItem('replyEditorData-' + formId + '-reply');
            localStorage.removeItem('replyEditorData-' + formId + '-edit');
        }
    }
}

export default connect(
    (state, props) => ({
        ...props,
        username: state.user.getIn(['current', 'username']),
    }),
    dispatch => ({
        dispatchSubmit(data) {
            dispatch(user.actions.usernamePasswordLogin({ ...data }));
        },
        clearError() {
            dispatch(user.actions.loginError({ error: null }));
        },
        unlock() {
            dispatch(user.actions.showLogin());
        },
        deletePost(author, permlink) {
            dispatch(
                transaction.actions.broadcastOperation({
                    type: 'delete_comment',
                    operation: { author, permlink },
                    confirm: tt('g.are_you_sure'),
                })
            );
        },
        showPromotePost(author, permlink) {
            dispatch({
                type: 'global/SHOW_DIALOG',
                payload: { name: 'promotePost', params: { author, permlink } },
            });
        },
        showExplorePost(permlink) {
            dispatch({
                type: 'global/SHOW_DIALOG',
                payload: { name: 'explorePost', params: { permlink } },
            });
        },
        showTransfer(transferDefaults) {
            dispatch(user.actions.setTransferDefaults(transferDefaults));
            dispatch(user.actions.showTransfer());
        },
    })
)(PostFull);
