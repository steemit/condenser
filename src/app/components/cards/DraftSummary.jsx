import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import {
    extractBodySummary,
    extractImageLink,
    highlightKeyword,
} from 'app/utils/ExtractContent';
import { proxifyImageUrl } from 'app/utils/ProxifyUrl';
import * as userActions from 'app/redux/UserReducer';
import Userpic, { SIZE_SMALL } from 'app/components/elements/Userpic';

// TODO: document why ` ` => `%20` is needed, and/or move to base fucntion
const proxify = (url, size) => proxifyImageUrl(url, size).replace(/ /g, '%20');

class DraftSummary extends React.Component {
    static propTypes = {
        post: PropTypes.object.isRequired,
        onDraftsClose: PropTypes.func,
        onDeleteDraft: PropTypes.func,
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

    clickContent() {
        this.props.hidePostDrafts();
    }

    render() {
        const { idx, post, onDraftsClose, onDeleteDraft } = this.props;
        if (!post) return null;

        const onClickContent = e => {
            e.preventDefault();
            this.clickContent();
            onDraftsClose(post);
        };

        const clickDeleteDraft = () => {
            onDeleteDraft(post);
        };

        const summary = extractBodySummary(post.body, false);
        const keyWord = process.env.BROWSER
            ? decodeURI(window.location.search).split('=')[1]
            : null;
        const highlightColor = '#00FFC8';
        const content_body = (
            <div className="DraftSummary__body entry-content">
                <span
                    onClick={onClickContent}
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
                <span
                    onClick={onClickContent}
                    dangerouslySetInnerHTML={{
                        __html: highlightKeyword(
                            post.title,
                            keyWord,
                            highlightColor
                        ),
                    }}
                />
            </h2>
        );

        // New Post Summary heading
        const summary_header = (
            <div className="articles__summary-header">
                <div className="user">
                    <span>
                        {idx} . {post.timestamp}
                    </span>
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
                            {thumb}
                        </div>
                    ) : null}
                    <div className="articles__content-block articles__content-block--text">
                        {content_title}
                        {content_body}
                    </div>
                    <a onClick={clickDeleteDraft}>삭제</a>
                </div>
            </div>
        );
    }
}

export default connect(
    (state, props) => {
        const { post } = props;
        return {
            post,
            username:
                state.user.getIn(['current', 'username']) ||
                state.offchain.get('account'),
        };
    },
    dispatch => ({
        hidePostDrafts: () => dispatch(userActions.hidePostDrafts()),
    })
)(DraftSummary);
