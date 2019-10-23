import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import Icon from 'app/components/elements/Icon';
import { connect } from 'react-redux';
import * as userActions from 'app/redux/UserReducer';
import Reblog from 'app/components/elements/Reblog';
import Voting from 'app/components/elements/Voting';
import { immutableAccessor } from 'app/utils/Accessors';
import { extractBodySummary, extractImageLink } from 'app/utils/ExtractContent';
import VotesAndComments from 'app/components/elements/VotesAndComments';
import { List, Map } from 'immutable';
import Author from 'app/components/elements/Author';
import TagList from 'app/components/elements/TagList';
import UserNames from 'app/components/elements/UserNames';
import tt from 'counterpart';
import ImageUserBlockList from 'app/utils/ImageUserBlockList';
import { proxifyImageUrl } from 'app/utils/ProxifyUrl';
import Userpic, { SIZE_SMALL } from 'app/components/elements/Userpic';
import { SIGNUP_URL } from 'shared/constants';
import { hasNsfwTag } from 'app/utils/StateFunctions';

// TODO: document why ` ` => `%20` is needed, and/or move to base fucntion
const proxify = (url, size) => proxifyImageUrl(url, size).replace(/ /g, '%20');

class PostSummary extends React.Component {
    static propTypes = {
        post: PropTypes.string.isRequired,
        content: PropTypes.object.isRequired,
        featured: PropTypes.bool,
        promoted: PropTypes.bool,
        onClose: PropTypes.func,
        nsfwPref: PropTypes.string,
    };

    constructor() {
        super();
        this.state = { revealNsfw: false };
        this.onRevealNsfw = this.onRevealNsfw.bind(this);
    }

    shouldComponentUpdate(props, state) {
        return (
            props.username !== this.props.username ||
            props.nsfwPref !== this.props.nsfwPref ||
            props.blogmode !== this.props.blogmode ||
            state.revealNsfw !== this.state.revealNsfw
        );
    }

    onRevealNsfw(e) {
        e.preventDefault();
        this.setState({ revealNsfw: true });
    }

    render() {
        const { ignore, hideCategory } = this.props;
        const { post, content, featured, promoted, onClose } = this.props;
        const { account } = this.props;
        if (!content) return null;

        let reblogged_by;
        if (content.get('reblogged_by', List()).size > 0) {
            reblogged_by = content.get('reblogged_by').toJS();
        }

        if (reblogged_by) {
            reblogged_by = (
                <div className="articles__resteem">
                    <p className="articles__resteem-text">
                        <span className="articles__resteem-icon">
                            <Icon name="reblog" />
                        </span>
                        <UserNames names={reblogged_by} />{' '}
                        {tt('postsummary_jsx.resteemed')}
                    </p>
                </div>
            );
        }

        // 'account' is the current blog being viewed, if applicable.
        if (account && account != content.get('author')) {
            reblogged_by = (
                <div className="articles__resteem">
                    <p className="articles__resteem-text">
                        <span className="articles__resteem-icon">
                            <Icon name="reblog" />
                        </span>
                        {tt('postsummary_jsx.resteemed')}
                    </p>
                </div>
            );
        }

        const gray = content.getIn(['stats', 'gray']);
        const isNsfw = hasNsfwTag(content);
        const isReply = content.get('depth') > 0;
        const showReblog = !content.get('is_paidout') && !isReply;
        const full_power = content.get('percent_steem_dollars') === 0;

        const author = content.get('author');
        const permlink = content.get('permlink');
        const category = content.get('category');
        const post_url = `/${category}/@${author}/${permlink}`;

        const summary = extractBodySummary(content.get('body'), isReply);
        const content_body = (
            <div className="PostSummary__body entry-content">
                <Link to={post_url}>{summary}</Link>
            </div>
        );

        const content_title = (
            <h2 className="articles__h2 entry-title">
                <Link to={post_url}>
                    {isNsfw && <span className="nsfw-flag">nsfw</span>}
                    {content.get('title')}
                </Link>
                {content.getIn(['stats', 'is_pinned'], false) && (
                    <span className="FeaturedTag">Pinned</span>
                )}
                {featured && <span className="FeaturedTag">Featured</span>}
                {promoted && <span className="PromotedTag">Sponsored</span>}
            </h2>
        );

        // New Post Summary heading
        const summary_header = (
            <div className="articles__summary-header">
                <div className="user">
                    {!isNsfw ? (
                        <div className="user__col user__col--left">
                            <a className="user__link" href={'/@' + author}>
                                <Userpic account={author} size={SIZE_SMALL} />
                            </a>
                        </div>
                    ) : null}
                    <div className="user__col user__col--right">
                        <span className="user__name">
                            <Author post={content} follow={false} />
                        </span>

                        {hideCategory || (
                            <span className="articles__tag-link">
                                {tt('g.in')}&nbsp;
                                <TagList post={content} single />
                                &nbsp;•&nbsp;
                            </span>
                        )}
                        <Link className="timestamp__link" to={post_url}>
                            <span className="timestamp__time">
                                <TimeAgoWrapper
                                    date={content.get('created')}
                                    className="updated"
                                />
                            </span>

                            {full_power && (
                                <span
                                    className="articles__icon-100"
                                    title={tt('g.powered_up_100')}
                                >
                                    <Icon name="steempower" />
                                </span>
                            )}
                        </Link>
                    </div>

                    {(featured || promoted) && (
                        <a
                            onClick={onClose}
                            className="PostDismiss"
                            title="Dismiss Post"
                        >
                            <Icon name="close" />
                        </a>
                    )}
                </div>
            </div>
        );

        const summary_footer = (
            <div className="articles__summary-footer">
                <Voting post={post} showList={false} />
                <VotesAndComments
                    post={post}
                    commentsLink={post_url + '#comments'}
                />
                <span className="PostSummary__time_author_category">
                    {showReblog && (
                        <Reblog
                            author={content.get('author')}
                            permlink={content.get('permlink')}
                        />
                    )}
                </span>
            </div>
        );

        const { nsfwPref, username } = this.props;
        const { revealNsfw } = this.state;

        if (isNsfw) {
            if (nsfwPref === 'hide') {
                // user wishes to hide these posts entirely
                return null;
            } else if (nsfwPref === 'warn' && !revealNsfw) {
                // user wishes to be warned, and has not revealed this post
                return (
                    <article
                        className={'PostSummary hentry'}
                        itemScope
                        itemType="http://schema.org/blogPost"
                    >
                        <div className="PostSummary__nsfw-warning">
                            {summary_header}
                            <span className="nsfw-flag">
                                nsfw
                            </span>&nbsp;&nbsp;<span
                                role="button"
                                onClick={this.onRevealNsfw}
                            >
                                <a>{tt('postsummary_jsx.reveal_it')}</a>
                            </span>{' '}
                            {tt('g.or') + ' '}
                            {username ? (
                                <span>
                                    {tt('postsummary_jsx.adjust_your')}{' '}
                                    <Link to={`/@${username}/settings`}>
                                        {tt(
                                            'postsummary_jsx.display_preferences'
                                        )}
                                    </Link>.
                                </span>
                            ) : (
                                <span>
                                    <a href={SIGNUP_URL}>
                                        {tt(
                                            'postsummary_jsx.create_an_account'
                                        )}
                                    </a>{' '}
                                    {tt(
                                        'postsummary_jsx.to_save_your_preferences'
                                    )}.
                                </span>
                            )}
                            {summary_footer}
                        </div>
                    </article>
                );
            }
        }

        const image_link = extractImageLink(
            content.get('json_metadata'),
            content.get('body')
        );
        let thumb = null;
        if (!gray && image_link && !ImageUserBlockList.includes(author)) {
            // on mobile, we always use blog layout style -- there's no toggler
            // on desktop, we offer a choice of either blog or list
            // if blogmode is false, output an image with a srcset
            // which has the 256x512 for whatever the large breakpoint is where the list layout is used
            // and the 640 for lower than that
            const blogImg = proxify(image_link, '640x480');

            if (this.props.blogmode) {
                thumb = <img className="articles__feature-img" src={blogImg} />;
            } else {
                const listImg = proxify(image_link, '256x512');
                thumb = (
                    <picture className="articles__feature-img">
                        <source srcSet={listImg} media="(min-width: 1000px)" />
                        <img srcSet={blogImg} />
                    </picture>
                );
            }
            thumb = (
                <span className="articles__feature-img-container">{thumb}</span>
            );
        }

        return (
            <div className="articles__summary">
                {reblogged_by}
                {summary_header}
                <div
                    className={
                        'articles__content hentry' +
                        (thumb ? ' with-image ' : ' ') +
                        (gray || ignore ? ' downvoted' : '')
                    }
                    itemScope
                    itemType="http://schema.org/blogPost"
                >
                    {thumb ? (
                        <div className="articles__content-block articles__content-block--img">
                            <Link className="articles__link" to={post_url}>
                                {thumb}
                            </Link>
                        </div>
                    ) : null}
                    <div className="articles__content-block articles__content-block--text">
                        {content_title}
                        {content_body}
                        {this.props.blogmode ? null : summary_footer}
                    </div>
                    {this.props.blogmode ? summary_footer : null}
                </div>
            </div>
        );
    }
}

export default connect(
    (state, props) => {
        const { post, hideCategory, nsfwPref, featured, promoted } = props;
        const content = state.global.get('content').get(post);
        return {
            post,
            content,
            hideCategory,
            featured,
            promoted,
            username:
                state.user.getIn(['current', 'username']) ||
                state.offchain.get('account'),
            blogmode: state.app.getIn(['user_preferences', 'blogmode']),
            nsfwPref,
        };
    },

    dispatch => ({
        dispatchSubmit: data => {
            dispatch(userActions.usernamePasswordLogin({ ...data }));
        },
        clearError: () => {
            dispatch(userActions.loginError({ error: null }));
        },
    })
)(PostSummary);
