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

class DraftSummary extends React.Component {
    static propTypes = {
        post: PropTypes.object.isRequired,
        onClose: PropTypes.func,
    };

    constructor() {
        super();
    }

    shouldComponentUpdate(props, state) {
        return (
            props.username !== this.props.username ||
            props.post != this.props.post
        );
    }

    onRevealNsfw(e) {
        e.preventDefault();
    }

    render() {
        const { post, onClose } = this.props;
        if (!post) return null;

        const author = post.author;
        const permlink = post.permlink;
        const post_url = `/draft/@${author}/${permlink}`;

        const summary = extractBodySummary(post.body, false);
        const keyWord = process.env.BROWSER
            ? decodeURI(window.location.search).split('=')[1]
            : null;
        const highlightColor = '#00FFC8';
        const content_body = (
            <div className="DraftSummary__body entry-content">
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
                    <span
                        dangerouslySetInnerHTML={{
                            __html: highlightKeyword(
                                post.title,
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
                    <div className="user__col user__col--right">
                        <span className="user__name">{post.author}</span>
                    </div>
                </div>
            </div>
        );

        const image_link = extractImageLink(post.json_metadata, post.body);
        let thumb = null;
        if (image_link) {
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
                {summary_header}
                <div
                    className={
                        'articles__content hentry' +
                        (thumb ? ' with-image ' : ' ')
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
                    </div>
                </div>
            </div>
        );
    }
}

export default connect((state, props) => {
    const { post } = props;
    const net_vests = state.user.getIn(['current', 'effective_vests'], 0.0);
    return {
        post,
        username:
            state.user.getIn(['current', 'username']) ||
            state.offchain.get('account'),
    };
})(DraftSummary);
