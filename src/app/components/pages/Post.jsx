import React from 'react';
import PropTypes from 'prop-types';
import Comment from 'app/components/cards/Comment';
import PostFull from 'app/components/cards/PostFull';
import { immutableAccessor } from 'app/utils/Accessors';
import extractContent from 'app/utils/ExtractContent';
import { connect } from 'react-redux';

import { sortComments } from 'app/components/cards/Comment';
import DropdownMenu from 'app/components/elements/DropdownMenu';
import { Set } from 'immutable';
import tt from 'counterpart';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import { serverApiRecordEvent } from 'app/utils/ServerApiClient';
import { INVEST_TOKEN_UPPERCASE } from 'app/client_config';
import { SIGNUP_URL } from 'shared/constants';
import GptAd from 'app/components/elements/GptAd';
import { isLoggedIn } from 'app/utils/UserUtil';

import Icon from 'app/components/elements/Icon';

class Post extends React.Component {
    static propTypes = {
        content: PropTypes.object.isRequired,
        post: PropTypes.string,
        routeParams: PropTypes.object,
        sortOrder: PropTypes.string,
    };
    constructor() {
        super();
        this.state = {
            showNegativeComments: false,
        };
        this.showSignUp = () => {
            serverApiRecordEvent('SignUp', 'Post Promo');
            window.location = SIGNUP_URL;
        };
    }

    toggleNegativeReplies = e => {
        this.setState({
            showNegativeComments: !this.state.showNegativeComments,
        });
        e.preventDefault();
    };

    onHideComment = () => {
        this.setState({ commentHidden: true });
    };

    showAnywayClick = () => {
        this.setState({ showAnyway: true });
    };

    render() {
        const { showSignUp } = this;
        const { content, sortOrder } = this.props;
        const { showNegativeComments, commentHidden, showAnyway } = this.state;
        let post = this.props.post;
        if (!post) {
            const route_params = this.props.routeParams;
            post = route_params.username + '/' + route_params.slug;
        }
        const dis = content.get(post);

        // check if the post doesn't exist
        // !dis may be enough but keep 'created' & 'body' test for potential compatibility
        const emptyPost =
            !dis ||
            (dis.get('created') === '1970-01-01T00:00:00' &&
                dis.get('body') === '');

        if (emptyPost)
            return (
                <div className="NotFound float-center">
                    <div>
                        <Icon name="steem" size="4x" />
                        <h4 className="NotFound__header">
                            Sorry! This page doesnt exist.
                        </h4>
                        <p>
                            Not to worry. You can head back to{' '}
                            <a style={{ fontWeight: 800 }} href="/">
                                our homepage
                            </a>, or check out some great posts.
                        </p>
                        <ul className="NotFound__menu">
                            <li>
                                <a href="/created">new posts</a>
                            </li>
                            <li>
                                <a href="/hot">hot posts</a>
                            </li>
                            <li>
                                <a href="/trending">trending posts</a>
                            </li>
                            <li>
                                <a href="/promoted">promoted posts</a>
                            </li>
                            <li>
                                <a href="/active">active posts</a>
                            </li>
                        </ul>
                    </div>
                </div>
            );

        // TODO: This data model needs some help.
        const post_content = content.get(post);
        const p = extractContent(immutableAccessor, post_content);
        const tags = p.json_metadata.tags;

        // A post should be hidden if it is not special, is not told to "show
        // anyway", and is designated "gray".
        const special = dis.get('special');
        if (!special && !showAnyway) {
            const { gray } = dis.get('stats').toJS();
            if (gray) {
                return (
                    <div className="Post">
                        <div className="row">
                            <div className="column">
                                <div className="PostFull">
                                    <p onClick={this.showAnywayClick}>
                                        {tt(
                                            'promote_post_jsx.this_post_was_hidden_due_to_low_ratings'
                                        )}.{' '}
                                        <button
                                            style={{ marginBottom: 0 }}
                                            className="button hollow tiny float-right"
                                            onClick={this.showAnywayClick}
                                        >
                                            {tt('g.show')}
                                        </button>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
        }

        let replies = dis.get('replies').toJS();

        sortComments(content, replies, sortOrder);

        // Don't render too many comments on server-side
        const commentLimit = 100;
        if (global.process !== undefined && replies.length > commentLimit) {
            replies = replies.slice(0, commentLimit);
        }
        let commentCount = 0;
        const positiveComments = replies.map(reply => {
            commentCount++;
            const showAd =
                commentCount % 5 === 0 &&
                commentCount !== replies.length &&
                commentCount !== commentLimit;

            return (
                <div key={post + reply}>
                    <Comment
                        root
                        content={reply}
                        cont={content}
                        sort_order={sortOrder}
                        showNegativeComments={showNegativeComments}
                        onHide={this.onHideComment}
                    />

                    {this.props.gptEnabled && showAd ? (
                        <div className="Post_footer__ad">
                            <GptAd
                                tags={tags}
                                type="Freestar"
                                id="bsa-zone_1566494240874-7_123456"
                            />
                        </div>
                    ) : null}
                </div>
            );
        });

        const negativeGroup = commentHidden && (
            <div className="hentry Comment root Comment__negative_group">
                <p>
                    {showNegativeComments
                        ? tt('post_jsx.now_showing_comments_with_low_ratings')
                        : tt(
                              'post_jsx.comments_were_hidden_due_to_low_ratings'
                          )}.{' '}
                    <button
                        className="button hollow tiny float-right"
                        onClick={e => this.toggleNegativeReplies(e)}
                    >
                        {showNegativeComments ? tt('g.hide') : tt('g.show')}
                    </button>
                </p>
            </div>
        );

        const sort_orders = ['trending', 'votes', 'new', 'author_reputation'];
        const sort_labels = [
            tt('post_jsx.comment_sort_order.trending'),
            tt('post_jsx.comment_sort_order.votes'),
            tt('post_jsx.comment_sort_order.age'),
            tt('post_jsx.comment_sort_order.reputation'),
        ];
        const sort_menu = [];
        let sort_label;
        const selflink = `/${dis.get('category')}/@${post}`;
        for (let o = 0; o < sort_orders.length; ++o) {
            if (sort_orders[o] == sortOrder) sort_label = sort_labels[o];
            sort_menu.push({
                value: sort_orders[o],
                label: sort_labels[o],
                link: selflink + '?sort=' + sort_orders[o] + '#comments',
            });
        }

        return (
            <div className="Post">
                <div className="row">
                    <div className="column">
                        <PostFull post={post} cont={content} />
                    </div>
                </div>
                {!isLoggedIn() && (
                    <div className="row">
                        <div className="column">
                            <div className="Post__promo">
                                {tt(
                                    'g.next_7_strings_single_block.authors_get_paid_when_people_like_you_upvote_their_post'
                                )}.
                                <br />
                                {tt(
                                    'g.next_7_strings_single_block.if_you_enjoyed_what_you_read_earn_amount'
                                )}
                                <br />
                                <button
                                    type="button"
                                    className="button e-btn"
                                    onClick={showSignUp}
                                >
                                    {tt('loginform_jsx.sign_up_get_steem')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {this.props.gptEnabled ? (
                    <div className="Post_footer__ad">
                        <GptAd
                            tags={tags}
                            type="Freestar"
                            id="bsa-zone_1566494147292-7_123456"
                        />
                    </div>
                ) : null}
                <div id="#comments" className="Post_comments row hfeed">
                    <div className="column large-12">
                        <div className="Post_comments__content">
                            {positiveComments.length ? (
                                <div className="Post__comments_sort_order float-right">
                                    {tt('post_jsx.sort_order')}: &nbsp;
                                    <DropdownMenu
                                        items={sort_menu}
                                        el="li"
                                        selected={sort_label}
                                        position="left"
                                    />
                                </div>
                            ) : null}
                            {positiveComments}
                            {negativeGroup}
                        </div>
                    </div>
                </div>
                {this.props.gptEnabled && commentCount >= 5 ? (
                    <div className="Post_footer__ad">
                        <GptAd
                            tags={tags}
                            type="Freestar"
                            id="bsa-zone_1566494371533-0_123456"
                        />
                    </div>
                ) : null}
            </div>
        );
    }
}

const emptySet = Set();
export default connect((state, ownProps) => {
    return {
        content: state.global.get('content'),
        sortOrder:
            ownProps.router.getCurrentLocation().query.sort || 'trending',
        gptEnabled: state.app.getIn(['googleAds', 'gptEnabled']),
    };
})(Post);
