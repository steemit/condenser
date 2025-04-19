import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import Icon from 'app/components/elements/Icon';
import { connect } from 'react-redux';
import Reblog from 'app/components/elements/Reblog';
import Voting from 'app/components/elements/Voting';
import { immutableAccessor } from 'app/utils/Accessors';
import {
    extractBodySummary,
    extractImageLink,
    highlightKeyword,
} from 'app/utils/ExtractContent';
import VotesAndComments from 'app/components/elements/VotesAndComments';
import { List, Map } from 'immutable';
import Author from 'app/components/elements/Author';
import Tag from 'app/components/elements/Tag';
import UserNames from 'app/components/elements/UserNames';
import tt from 'counterpart';
import ImageUserBlockList from 'app/utils/ImageUserBlockList';
import { proxifyImageUrl } from 'app/utils/ProxifyUrl';
import Userpic, { SIZE_SMALL } from 'app/components/elements/Userpic';
import SearchUserList from 'app/components/cards/SearchUserList';
import { SIGNUP_URL } from 'shared/constants';
import { hasNsfwTag } from 'app/utils/StateFunctions';

const CURATOR_VESTS_THRESHOLD = 1.0 * 1000.0 * 1000.0;

// TODO: document why ` ` => `%20` is needed, and/or move to base fucntion
const proxify = (url, size) => proxifyImageUrl(url, size).replace(/ /g, '%20');

const vote_weights = post => {
    const rshares = post.get('net_rshares');
    const dn = post.getIn(['stats', 'flag_weight']);
    const up = Math.max(String(parseInt(rshares / 2, 10)).length - 10, 0);
    return { dn, up };
};

class PostSummary extends React.Component {
    static propTypes = {
        post: PropTypes.object.isRequired,
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
            state.revealNsfw !== this.state.revealNsfw ||
            props.post != this.props.post
        );
    }

    onRevealNsfw(e) {
        e.preventDefault();
        this.setState({ revealNsfw: true });
    }

    render() {
        const { ignore, hideCategory, net_vests, depth } = this.props;
        const { post, onClose } = this.props;
        if (!post) return null;
        let reblogged_by;
        if (post.get('reblogged_by', List()).size > 0) {
            reblogged_by = post.get('reblogged_by').toJS();
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

        const gray = post.getIn(['stats', 'gray']);
        const isNsfw = hasNsfwTag(post);
        const isReply = post.get('depth') > 0;
        const showReblog = !isReply;
        const full_power = post.get('percent_steem_dollars') === 0;

        const author = post.get('author');
        const permlink = post.get('permlink');
        const category = post.get('category');

        let tempCategory = category || '';
        const tags = post.getIn(['json_metadata', 'tags']) || [];

        // Leave Options 1 and 2 uncommented for a combination of both approaches
        // Option 1: Replace hive-xxxxxx in the URL with the community name.  This doesn't impact non-community posts
        const communityTitle =
            post.get('community_title', '#' + tempCategory) || '';
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
        if (tempCategory.startsWith('hive-') && tags && tags.size > 0) {
            const firstTag = tags.get(0).startsWith('#')
                ? tags.get(0).substring(1)
                : tags.get(0);
            tempCategory =
                firstTag.startsWith('hive-') && tags.size > 1
                    ? tags.get(1)
                    : firstTag; // Sometimes the first tag is still the community & need to check if there's a second tag
            tempCategory = tempCategory.startsWith('#')
                ? tempCategory.substring(1)
                : tempCategory;
        }

        const post_url = `/${tempCategory}/@${author}/${permlink}`;

        const summary = extractBodySummary(post.get('body'), isReply);
        const keyWord = process.env.BROWSER
            ? decodeURI(window.location.search).split('=')[1]
            : null;
        const highlightColor = '#00FFC8';
        const content_body = (
            <div className="PostSummary__body entry-content">
                <Link
                    to={post_url}
                    dangerouslySetInnerHTML={{
                        __html: highlightKeyword(
                            summary,
                            keyWord,
                            highlightColor
                        ),
                    }}
                />
            </div>
        );

        const content_title = (
            <h2 className="articles__h2 entry-title">
                <Link to={post_url}>
                    {isNsfw && <span className="nsfw-flag">nsfw</span>}
                    <span
                        dangerouslySetInnerHTML={{
                            __html: highlightKeyword(
                                post.get('title'),
                                keyWord,
                                highlightColor
                            ),
                        }}
                    />
                </Link>
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
                            <Author
                                post={post}
                                follow={false}
                                hideEditor={true}
                            />
                        </span>

                        {hideCategory || (
                            <span className="articles__tag-link">
                                {tt('g.in')}&nbsp;
                                <Tag post={post} />
                                &nbsp;•&nbsp;
                            </span>
                        )}
                        <Link className="timestamp__link" to={post_url}>
                            <span className="timestamp__time">
                                {this.props.order == 'payout' && (
                                    <span>payout </span>
                                )}
                                <TimeAgoWrapper
                                    date={
                                        this.props.order == 'payout'
                                            ? post.get('payout_at')
                                            : post.get('created')
                                    }
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
                            {post.getIn(['stats', 'is_pinned'], false) && (
                                <span className="FeaturedTag">
                                    {tt('g.pinned')}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </div>
        );

        let dots;
        if (net_vests >= CURATOR_VESTS_THRESHOLD) {
            const _dots = cnt => {
                return cnt > 0 ? '•'.repeat(cnt) : null;
            };
            const { up, dn } = vote_weights(post);
            dots =
                up || dn ? (
                    <span className="vote_weights">
                        {_dots(up)}
                        {<span>{_dots(dn)}</span>}
                    </span>
                ) : null;
        }

        const summary_footer = (
            <div className="articles__summary-footer">
                {dots}
                <Voting post={post} showList={false} />
                <VotesAndComments
                    post={post}
                    commentsLink={post_url + '#comments'}
                />
                <span className="PostSummary__time_author_category">
                    {showReblog && (
                        <Reblog
                            author={post.get('author')}
                            permlink={post.get('permlink')}
                        />
                    )}
                </span>
            </div>
        );

        const userList = (
            <div>
                <SearchUserList post={post} />
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
            post.get('json_metadata'),
            post.get('body')
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
                const listImg = proxify(image_link, '640x0');
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

        return depth === 2 ? (
            <div className="articles__summary">{userList}</div>
        ) : (
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
                        {this.props.blogmode ? null : (
                            <div className="articles__footer">
                                {summary_footer}
                            </div>
                        )}
                    </div>
                    {this.props.blogmode ? summary_footer : null}
                </div>
            </div>
        );
    }
}

export default connect((state, props) => {
    const { post, hideCategory, nsfwPref } = props;
    const net_vests = state.user.getIn(['current', 'effective_vests'], 0.0);
    return {
        post,
        hideCategory,
        username:
            state.user.getIn(['current', 'username']) ||
            state.offchain.get('account'),
        blogmode: state.app.getIn(['user_preferences', 'blogmode']),
        nsfwPref,
        net_vests,
    };
})(PostSummary);
