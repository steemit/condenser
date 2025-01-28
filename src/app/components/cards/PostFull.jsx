import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import Icon from 'app/components/elements/Icon';
import { connect } from 'react-redux';
import * as transactionActions from 'app/redux/TransactionReducer';
import * as globalActions from 'app/redux/GlobalReducer';
import Voting from 'app/components/elements/Voting';
import Reblog from 'app/components/elements/Reblog';
import MarkdownViewer from 'app/components/cards/MarkdownViewer';
import ReplyEditor from 'app/components/elements/ReplyEditor';
import { immutableAccessor } from 'app/utils/Accessors';
import { extractBodySummary } from 'app/utils/ExtractContent';
import Tag from 'app/components/elements/Tag';
import TagList from 'app/components/elements/TagList';
import Author from 'app/components/elements/Author';
import { parsePayoutAmount } from 'app/utils/ParsersAndFormatters';
import DMCAList from 'app/utils/DMCAList';
import ShareMenu from 'app/components/elements/ShareMenu';
import MuteButton from 'app/components/elements/MuteButton';
import FlagButton from 'app/components/elements/FlagButton';
import { userActionRecord } from 'app/utils/ServerApiClient';
import Userpic from 'app/components/elements/Userpic';
import { APP_DOMAIN, APP_NAME } from 'app/client_config';
import tt from 'counterpart';
import userIllegalContent from 'app/utils/userIllegalContent';
import ImageUserBlockList from 'app/utils/ImageUserBlockList';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import { allowDelete } from 'app/utils/StateFunctions';
import { Role } from 'app/utils/Community';
import ContentEditedWrapper from '../elements/ContentEditedWrapper';

function TimeAuthorCategory({ post }) {
    return (
        <span className="PostFull__time_author_category vcard">
            <Icon name="clock" className="space-right" />
            <TimeAgoWrapper date={post.get('created')} /> {tt('g.in')}{' '}
            <Tag post={post} /> {tt('g.by')}{' '}
            <Author post={post} showAffiliation />
        </span>
    );
}

function TimeAuthorCategoryLarge({ post }) {
    return (
        <span className="PostFull__time_author_category_large vcard">
            <Userpic account={post.get('author')} />
            <div className="right-side">
                <Author post={post} showAffiliation />
                {tt('g.in')} <Tag post={post} />
                {' • '}
                <TimeAgoWrapper date={post.get('created')} />{' '}
                <ContentEditedWrapper
                    createDate={post.get('created')}
                    updateDate={post.get('updated')}
                />
            </div>
        </span>
    );
}

class PostFull extends React.Component {
    static propTypes = {
        // html props
        /* Show extra options (component is being viewed alone) */
        postref: PropTypes.string.isRequired,
        post: PropTypes.object.isRequired,

        // connector props
        username: PropTypes.string,
        deletePost: PropTypes.func.isRequired,
        showPromotePost: PropTypes.func.isRequired,
        showExplorePost: PropTypes.func.isRequired,
        togglePinnedPost: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        const { post } = this.props;

        this.fbShare = this.fbShare.bind(this);
        this.twitterShare = this.twitterShare.bind(this);
        this.redditShare = this.redditShare.bind(this);
        this.linkedInShare = this.linkedInShare.bind(this);
        this.showExplorePost = this.showExplorePost.bind(this);

        this.onShowReply = () => {
            const { state: { showReply, formId } } = this;
            this.setState({ showReply: !showReply, showEdit: false });
            saveOnShow(formId, !showReply ? 'reply' : null);
        };
        this.onShowEdit = () => {
            const { state: { showEdit, formId } } = this;
            this.setState({ showEdit: !showEdit, showReply: false });
            saveOnShow(formId, !showEdit ? 'edit' : null);
        };
        this.onDeletePost = () => {
            const { props: { deletePost, post } } = this;
            deletePost(post.get('author'), post.get('permlink'));
        };
    }

    componentWillMount() {
        const { postref } = this.props;
        const formId = `postFull-${postref}`;
        this.setState({
            formId,
            PostFullReplyEditor: ReplyEditor(formId + '-reply'),
            PostFullEditEditor: ReplyEditor(formId + '-edit'),
        });
        if (process.env.BROWSER) {
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
    }

    fbShare(e) {
        const href = this.share_params.url;
        e.preventDefault();
        window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${href}`,
            'fbshare',
            'width=600, height=400, scrollbars=no'
        );
        userActionRecord('FbShare', {
            trackingId: this.props.trackingId,
            permlink: this.share_params.link,
        });
    }

    twitterShare(e) {
        userActionRecord('TwitterShare', {
            trackingId: this.props.trackingId,
            permlink: this.share_params.link,
        });
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
            'top=' +
                winTop +
                ',left=' +
                winLeft +
                ',toolbar=0,status=0,width=' +
                winWidth +
                ',height=' +
                winHeight
        );
    }

    redditShare(e) {
        userActionRecord('RedditShare', {
            trackingId: this.props.trackingId,
            permlink: this.share_params.link,
        });
        e.preventDefault();
        const s = this.share_params;
        const q =
            'title=' +
            encodeURIComponent(s.title) +
            '&url=' +
            encodeURIComponent(s.url);
        window.open('https://www.reddit.com/submit?' + q, 'Share');
    }

    linkedInShare(e) {
        userActionRecord('LinkedInShare', {
            trackingId: this.props.trackingId,
            permlink: this.share_params.link,
        });
        e.preventDefault();
        const winWidth = 720;
        const winHeight = 480;
        const winTop = screen.height / 2 - winWidth / 2;
        const winLeft = screen.width / 2 - winHeight / 2;
        const s = this.share_params;
        const q =
            'title=' +
            encodeURIComponent(s.title) +
            '&url=' +
            encodeURIComponent(s.url) +
            '&source=Steemit&mini=true';
        window.open(
            'https://www.linkedin.com/shareArticle?' + q,
            'Share',
            'top=' +
                winTop +
                ',left=' +
                winLeft +
                ',toolbar=0,status=0,width=' +
                winWidth +
                ',height=' +
                winHeight
        );
    }

    showPromotePost = () => {
        const { post } = this.props;
        if (!post) return;
        const author = post.get('author');
        const permlink = post.get('permlink');
        this.props.showPromotePost(author, permlink);
    };

    showExplorePost = () => {
        const permlink = this.share_params.link;
        const title = this.share_params.rawtitle;
        this.props.showExplorePost(permlink, title);
    };

    onTogglePin = isPinned => {
        const { community, username, post, postref } = this.props;
        if (!community || !username) console.error('pin fail', this.props);

        const key = ['content', postref, 'stats', 'is_pinned'];
        this.props.stateSet(key, !isPinned);

        const account = post.get('author');
        const permlink = post.get('permlink');
        this.props.togglePinnedPost(
            !isPinned,
            username,
            community,
            account,
            permlink
        );
    };

    render() {
        const {
            props: { username, post, community, viewer_role },
            state: {
                PostFullReplyEditor,
                PostFullEditEditor,
                formId,
                showReply,
                showEdit,
            },
            onShowReply,
            onShowEdit,
            onDeletePost,
        } = this;
        if (!post) return null;
        const content = post.toJS();
        const { author, permlink, parent_author, parent_permlink } = content;
        const { category, title } = content;
        const link = `/${category}/@${author}/${permlink}`;

        if (process.env.BROWSER && title)
            document.title = title + ' — ' + APP_NAME;

        if (process.env.BROWSER) {
            const canonicalLink = document.getElementById('canonicalUrlID');
            if (!canonicalLink) {
                const newCanonicalUrlID = document.createElement('link');
                newCanonicalUrlID.rel = 'canonical';
                newCanonicalUrlID.key = 'canonical';
                newCanonicalUrlID.id = 'canonicalUrlID';
                document.head.appendChild(newCanonicalUrlID);
            }
            if (canonicalLink) {
                let tempCategory = category || '';
                const tags = content.json_metadata.tags || [];

                // Leave Options 1 and 2 uncommented for a combination of both approaches
                // Option 1: Replace hive-xxxxxx in the URL with the community name. This doesn't impact non-community posts
                const communityTitle =
                    content.community_title || `#${tempCategory}` || '';
                const sanitizedTitle = communityTitle
                    .replace(/[^a-zA-Z0-9 ]/g, '')
                    .trim();
                const urlFriendlyTitle = sanitizedTitle
                    .replace(/\s+/g, '-')
                    .toLowerCase();
                if (urlFriendlyTitle) {
                    tempCategory = urlFriendlyTitle;
                }

                // Option 2: Replace hive-xxxxxx in the URL with the first tag of a post
                if (tempCategory.startsWith('hive-') && tags.length > 0) {
                    const firstTag = tags[0].startsWith('#')
                        ? tags[0].substring(1)
                        : tags[0];
                    tempCategory =
                        firstTag.startsWith('hive-') && tags.length > 1
                            ? tags[1]
                            : firstTag; // Sometimes the first tag is still the community & need to check if there's a second tag
                    tempCategory = tempCategory.startsWith('#')
                        ? tempCategory.substring(1)
                        : tempCategory;
                }
                const canonicalURL = `/${tempCategory}/@${author}/${permlink}`;
                canonicalLink.href = 'https://' + APP_DOMAIN + canonicalURL;
            }
        }

        let content_body = post.get('body');
        const bDMCAStop = DMCAList.includes(link);
        const bIllegalContentUser = userIllegalContent.includes(author);
        if (bDMCAStop) {
            content_body = tt(
                'postfull_jsx.this_post_is_not_available_due_to_a_copyright_claim'
            );
        }
        // detect illegal users
        if (bIllegalContentUser) {
            content_body = 'Not available for legal reasons.';
        }

        // TODO: get global loading state
        //loading = !bIllegalContentUser && !bDMCAStop && partial data loaded;
        const bShowLoading = false;

        // hide images if user is on blacklist
        const hideImages = ImageUserBlockList.includes(author);

        const replyParams = {
            author,
            permlink,
            parent_author,
            parent_permlink:
                post.get('depth') == 0 ? post.get('category') : parent_permlink,
            category,
            title,
            body: post.get('body'),
        };

        this.share_params = {
            link,
            url: 'https://' + APP_DOMAIN + link,
            rawtitle: title,
            title: title + ' — ' + APP_NAME,
            desc: extractBodySummary(post.get('body')),
        };

        const share_menu = [
            {
                onClick: this.fbShare,
                title: tt('postfull_jsx.share_on_facebook'),
                icon: 'facebook',
            },
            {
                onClick: this.twitterShare,
                title: tt('postfull_jsx.share_on_twitter'),
                icon: 'twitter',
            },
            {
                onClick: this.redditShare,
                title: tt('postfull_jsx.share_on_reddit'),
                icon: 'reddit',
            },
            {
                onClick: this.linkedInShare,
                title: tt('postfull_jsx.share_on_linkedin'),
                icon: 'linkedin',
            },
        ];

        const Editor = this.state.showReply
            ? PostFullReplyEditor
            : PostFullEditEditor;
        let renderedEditor = null;
        if (showReply || showEdit) {
            const editJson = showReply ? null : post.get('json_metadata');
            renderedEditor = (
                <div key="editor">
                    <Editor
                        {...replyParams}
                        type={this.state.showReply ? 'submit_comment' : 'edit'}
                        successCallback={() => {
                            this.setState({
                                showReply: false,
                                showEdit: false,
                            });
                            saveOnShow(formId, null);
                        }}
                        onCancel={() => {
                            this.setState({
                                showReply: false,
                                showEdit: false,
                            });
                            saveOnShow(formId, null);
                        }}
                        jsonMetadata={editJson}
                    />
                </div>
            );
        }
        const high_quality_post = post.get('payout') > 10.0;
        const full_power = post.get('percent_steem_dollars') === 0;
        const isReply = post.get('depth') > 0;

        let post_header = (
            <h1 className="entry-title">
                {post.get('title')}
                {full_power && (
                    <span title={tt('g.powered_up_100')}>
                        <Icon name="steempower" />
                    </span>
                )}
            </h1>
        );

        if (isReply) {
            const rooturl = post.get('url');
            const prnturl = `/${category}/@${parent_author}/${parent_permlink}`;
            post_header = (
                <div className="callout">
                    <div>
                        {tt(
                            'postfull_jsx.you_are_viewing_a_single_comments_thread_from'
                        )}
                        :
                    </div>
                    <h4>{post.get('title')}</h4>
                    <ul>
                        <li>
                            <Link to={rooturl}>
                                {tt('postfull_jsx.view_the_full_context')}
                            </Link>
                        </li>
                        {post.get('depth') > 1 && (
                            <li>
                                <Link to={prnturl}>
                                    {tt('postfull_jsx.view_the_direct_parent')}
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
            );
        }

        const allowReply = Role.canComment(community, viewer_role);
        const canReblog = !isReply;
        const canPromote = false && !post.get('is_paidout') && !isReply;
        const canPin =
            post.get('depth') == 0 && Role.atLeast(viewer_role, 'mod');
        const canMute = username && Role.atLeast(viewer_role, 'mod');
        const canFlag =
            username && community && Role.atLeast(viewer_role, 'guest');
        const canReply = allowReply && post.get('depth') < 255;
        const canEdit = username === author && !showEdit;
        const canDelete = username === author && allowDelete(post);

        const isPinned = post.getIn(['stats', 'is_pinned'], false);

        const isPreViewCount = Date.parse(post.get('created')) < 1480723200000; // check if post was created before view-count tracking began (2016-12-03)
        let contentBody;

        if (bShowLoading) {
            contentBody = <LoadingIndicator type="circle-strong" />;
        } else {
            contentBody = (
                <MarkdownViewer
                    formId={formId + '-viewer'}
                    text={content_body}
                    large
                    highQualityPost={high_quality_post}
                    noImage={post.getIn(['stats', 'gray'])}
                    hideImages={hideImages}
                />
            );
        }

        return (
            <article
                className="PostFull hentry"
                itemScope
                itemType="http://schema.org/Blog"
            >
                {canFlag && <FlagButton post={post} />}
                {showEdit ? (
                    renderedEditor
                ) : (
                    <span>
                        <div className="PostFull__header">
                            {post_header}
                            <TimeAuthorCategoryLarge post={post} />
                        </div>
                        <div className="PostFull__body entry-content">
                            {contentBody}
                        </div>
                    </span>
                )}

                {canPromote &&
                    username && (
                        <button
                            className="Promote__button float-right button hollow tiny"
                            onClick={this.showPromotePost}
                        >
                            {tt('g.promote')}
                        </button>
                    )}
                {!isReply && <TagList post={post} />}
                <div className="PostFull__footer row">
                    <div className="columns medium-12 large-8">
                        <TimeAuthorCategory post={post} />
                        <Voting post={post} />
                    </div>
                    <div className="RightShare__Menu small-11 medium-12 large-4 columns">
                        {canReblog && (
                            <Reblog author={author} permlink={permlink} />
                        )}
                        <span className="PostFull__reply">
                            {/* all */}
                            {canReply && (
                                <a onClick={onShowReply}>{tt('g.reply')}</a>
                            )}{' '}
                            {/* mods */}
                            {canPin && (
                                <a onClick={() => this.onTogglePin(isPinned)}>
                                    {isPinned ? tt('g.unpin') : tt('g.pin')}
                                </a>
                            )}{' '}
                            {canMute && <MuteButton post={post} />}{' '}
                            {/* owner */}
                            {canEdit && (
                                <a onClick={onShowEdit}>{tt('g.edit')}</a>
                            )}{' '}
                            {canDelete && (
                                <a onClick={onDeletePost}>{tt('g.delete')}</a>
                            )}
                        </span>
                        <span className="PostFull__responses">
                            <Link
                                to={link}
                                title={tt('g.responses', {
                                    count: post.get('children'),
                                })}
                            >
                                <Icon
                                    name="chatboxes"
                                    className="space-right"
                                />
                                {post.get('children')}
                            </Link>
                        </span>
                        <ShareMenu menu={share_menu} />
                        <button
                            className="explore-post"
                            title={tt('g.share_this_post')}
                            onClick={this.showExplorePost}
                        >
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
        );
    }
}

export default connect(
    (state, ownProps) => {
        const postref = ownProps.post;
        const post = ownProps.cont.get(postref);

        const category = post.get('category');
        const community = state.global.getIn(['community', category, 'name']);
        const trackingId = state.app.get('trackingId');

        return {
            post,
            postref,
            community,
            username: state.user.getIn(['current', 'username']),
            viewer_role: state.global.getIn(
                ['community', community, 'context', 'role'],
                'guest'
            ),
            trackingId,
        };
    },
    dispatch => ({
        deletePost: (author, permlink) => {
            userActionRecord('delete_comment', {
                username: author,
                comment_type: 'post',
                permlink,
            });
            dispatch(
                transactionActions.broadcastOperation({
                    type: 'delete_comment',
                    operation: { author, permlink },
                    confirm: tt('g.are_you_sure'),
                })
            );
        },
        stateSet: (key, value) => {
            dispatch(globalActions.set({ key, value }));
        },
        showPromotePost: (author, permlink) => {
            dispatch(
                globalActions.showDialog({
                    name: 'promotePost',
                    params: { author, permlink },
                })
            );
        },
        showExplorePost: (permlink, title) => {
            dispatch(
                globalActions.showDialog({
                    name: 'explorePost',
                    params: { permlink, title },
                })
            );
        },
        togglePinnedPost: (
            pinPost,
            username,
            community,
            account,
            permlink,
            successCallback,
            errorCallback
        ) => {
            let action = 'unpinPost';
            if (pinPost) action = 'pinPost';

            const payload = [
                action,
                {
                    community,
                    account,
                    permlink,
                },
            ];

            return dispatch(
                transactionActions.broadcastOperation({
                    type: 'custom_json',
                    operation: {
                        id: 'community',
                        required_posting_auths: [username],
                        json: JSON.stringify(payload),
                    },
                    successCallback,
                    errorCallback,
                })
            );
        },
    })
)(PostFull);

const saveOnShow = (formId, type) => {
    if (process.env.BROWSER) {
        if (type)
            localStorage.setItem(
                'showEditor-' + formId,
                JSON.stringify({ type }, null, 0)
            );
        else {
            localStorage.removeItem('showEditor-' + formId);
            localStorage.removeItem('replyEditorData-' + formId + '-reply');
            localStorage.removeItem('replyEditorData-' + formId + '-edit');
        }
    }
};
