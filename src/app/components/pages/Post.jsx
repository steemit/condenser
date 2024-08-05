import React from 'react';
import PropTypes from 'prop-types';
import Comment, { sortComments } from 'app/components/cards/Comment';
import PostFull from 'app/components/cards/PostFull';
import { connect } from 'react-redux';
import { List, Set } from 'immutable';
import { parseJsonTags } from 'app/utils/StateFunctions';
import DropdownMenu from 'app/components/elements/DropdownMenu';
import tt from 'counterpart';
import { serverApiRecordEvent } from 'app/utils/ServerApiClient';
import { SIGNUP_URL } from 'shared/constants';
import { isLoggedIn } from 'app/utils/UserUtil';
import SteemMarket from 'app/components/elements/SteemMarket';
import SidebarLinks from 'app/components/elements/SidebarLinks';
import SidebarNewUsers from 'app/components/elements/SidebarNewUsers';
import Icon from 'app/components/elements/Icon';
import AdSwipe from 'app/components/elements/AdSwipe';
import TronAd from 'app/components/elements/TronAd';
import PrimaryNavigation from 'app/components/cards/PrimaryNavigation';
import * as appActions from 'app/redux/AppReducer';
import Announcement from './Announcement';

function isEmptyPost(post) {
    // check if the post doesn't exist
    // !dis may be enough but keep 'created' & 'body' test for potential compat
    return (
        !post ||
        (post.get('created') === '1970-01-01T00:00:00' &&
            post.get('body') === '')
    );
}

class Post extends React.Component {
    static propTypes = {
        post: PropTypes.string,
        content: PropTypes.object.isRequired,
        dis: PropTypes.object,
        sortOrder: PropTypes.string,
    };
    constructor() {
        super();
        this.state = {
            showNegativeComments: false,
            timeOut: false,
            showPostComments: true,
        };
        this.showSignUp = () => {
            serverApiRecordEvent('SignUp', 'Post Promo');
            window.location = SIGNUP_URL;
        };
    }

    componentWillMount() {
        const { dis } = this.props;
        this.props.setRouteTag(dis.get('url'));
        this.setState({
            showPostComments: true,
        });
    }

    componentDidMount() {
        const _this = this;
        setTimeout(() => {
            if (_this.props.dis === undefined) {
                _this.setState({
                    timeOut: true,
                    showPostComments: true,
                });
            }
        }, 2000);
    }

    componentWillUpdate(nextProps) {
        const { dis } = nextProps;
        if (dis.get('url') !== this.props.dis.get('url')) {
            this.props.setRouteTag(dis.get('url'));
        }
    }

    componentWillUnmount() {
        this.setState({
            timeOut: false,
        });
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

    showPostCommentClick = () => {
        this.setState({ showPostComments: false });
    };

    render() {
        const { showSignUp } = this;
        const {
            content,
            sortOrder,
            post,
            dis,
            steemMarketData,
            isBrowser,
            uname,
            topics,
            trackingId,
            postLeftSideAdList,
            bottomAdList,
            adSwipeConf,
            tronAdsConf,
            locale,
        } = this.props;
        const {
            showNegativeComments,
            commentHidden,
            showPostComments,
            showAnyway,
            timeOut,
        } = this.state;

        const adSwipeEnabled = adSwipeConf.getIn(['enabled']);
        const tronAdsEnabled = tronAdsConf.getIn(['enabled']);
        const tronAdSidebyPid = tronAdsConf.getIn(['sidebar_ad_pid']);
        const tronAdPcPid = tronAdsConf.getIn(['content_pc_ad_pid']);
        const tronAdMobilePid = tronAdsConf.getIn(['content_mobile_ad_pid']);
        const tronAdsEnv = tronAdsConf.getIn(['env']);
        const tronAdsMock = tronAdsConf.getIn(['is_mock']);

        if (dis === undefined && !timeOut) {
            return null;
        }

        if (isEmptyPost(dis) || timeOut)
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
                            </a>
                            , or check out some great posts.
                        </p>
                        <ul className="NotFound__menu">
                            <li>
                                <a href="/trending">trending posts</a>
                            </li>
                            <li>
                                <a href="/hot">hot posts</a>
                            </li>
                        </ul>
                    </div>
                </div>
            );

        const gptTags = parseJsonTags(dis);

        // A post should be hidden if it is not special, is not told to "show
        // anyway", and is designated "gray".
        let postBody;
        const special = dis.get('special');
        if (!special && !showAnyway && dis.getIn(['stats', 'gray'], false)) {
            postBody = (
                <div className="Post">
                    <div className="row">
                        <div className="column">
                            <div className="PostFull">
                                <p onClick={this.showAnywayClick}>
                                    {tt(
                                        'promote_post_jsx.this_post_was_hidden_due_to_low_ratings'
                                    )}
                                    .{' '}
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
        } else {
            postBody = <PostFull post={post} cont={content} />;
        }

        let replies = dis.get('replies').toJS();

        sortComments(content, replies, sortOrder);

        // Don't render too many comments on server-side
        const commentLimit = 100;
        const commentDefault = 10;

        // if (global.process !== undefined && replies.length > commentLimit) {
        //     replies = replies.slice(0, commentLimit);
        // }

        if (replies.length > 0 && showPostComments) {
            replies = replies.slice(0, commentDefault);
        }

        let commentCount = 0;
        const positiveComments = replies.map(reply => {
            commentCount++;

            const showAd =
                commentCount % 5 === 0 &&
                commentCount !== replies.length &&
                commentCount !== commentLimit;
            const author = reply && reply.split('/')[0];
            return (
                <div key={post + reply}>
                    <Comment
                        postref={reply}
                        cont={content}
                        sort_order={sortOrder}
                        showNegativeComments={showNegativeComments}
                        onHide={this.onHideComment}
                    />
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
                          )}
                    .{' '}
                    <button
                        className="button hollow tiny float-right"
                        onClick={e => this.toggleNegativeReplies(e)}
                    >
                        {showNegativeComments ? tt('g.hide') : tt('g.show')}
                    </button>
                </p>
            </div>
        );

        const sort_orders = ['trending', 'votes', 'new'];
        const sort_labels = [
            tt('post_jsx.comment_sort_order.trending'),
            tt('post_jsx.comment_sort_order.votes'),
            tt('post_jsx.comment_sort_order.age'),
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
                <div className="post-content">
                    <div className="c-sidebr-ads">
                        <PrimaryNavigation
                            routeTag="post"
                            category={selflink}
                        />
                    </div>
                    <div className="post-main">
                        <div className="row">
                            <div className="column">{postBody}</div>
                        </div>
                        <div className="row">
                            {adSwipeEnabled && (
                                <div className="column">
                                    <div
                                        style={{
                                            margin: '0.5rem auto 0',
                                            maxWidth: '54rem',
                                        }}
                                    >
                                        <AdSwipe
                                            adList={bottomAdList}
                                            trackingId={trackingId}
                                            timer={5000}
                                            direction="vertical"
                                        />
                                    </div>
                                </div>
                            )}
                            {tronAdsEnabled && (
                                <div className="column">
                                    <div
                                        style={{
                                            margin: '0.5rem auto 0',
                                            maxWidth: '54rem',
                                        }}
                                    >
                                        <TronAd
                                            env={tronAdsEnv}
                                            trackingId={trackingId}
                                            wrapperName={'tron_ad_pc'}
                                            pid={tronAdPcPid}
                                            isMock={tronAdsMock}
                                            lang={locale}
                                            adTag={'tron_ad_pc'}
                                            ratioClass={'ratio-10-1'}
                                        />
                                        <TronAd
                                            env={tronAdsEnv}
                                            trackingId={trackingId}
                                            wrapperName={'tron_ad_mobile'}
                                            pid={tronAdMobilePid}
                                            isMock={tronAdsMock}
                                            lang={locale}
                                            adTag={'tron_ad_mobile'}
                                            ratioClass={'ratio-375-80'}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        {false &&
                            !isLoggedIn() && (
                                <div className="row">
                                    <div className="column">
                                        <div className="Post__promo">
                                            {tt(
                                                'g.next_7_strings_single_block.authors_get_paid_when_people_like_you_upvote_their_post'
                                            )}
                                            .
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
                                                {tt(
                                                    'loginform_jsx.sign_up_get_steem'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        <div id="#comments" className="Post_comments row hfeed">
                            <div className="column large-12">
                                <div className="Post_comments__content">
                                    {positiveComments.length > 0 ? (
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
                                    {positiveComments.length > 0
                                        ? positiveComments
                                        : null}
                                    {positiveComments.length > 0 &&
                                    positiveComments.length ===
                                        commentDefault &&
                                    commentDefault < dis.get('children') &&
                                    showPostComments ? (
                                        <div className="hentry Comment root Post_comments__count">
                                            <button
                                                className="comment-button"
                                                onClick={
                                                    this.showPostCommentClick
                                                }
                                            >
                                                LOAD MORE COMMENTS
                                            </button>
                                        </div>
                                    ) : null}
                                    {negativeGroup}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="c-sidebr-market">
                        {isBrowser && !uname && <SidebarNewUsers />}
                        {isBrowser && <Announcement />}
                        {isBrowser &&
                            uname && (
                                <SidebarLinks
                                    username={uname}
                                    topics={topics}
                                />
                            )}
                        {!steemMarketData.isEmpty() && (
                            <SteemMarket page="CoinMarketPlacePost" />
                        )}
                        {adSwipeEnabled && (
                            <AdSwipe
                                adList={postLeftSideAdList}
                                trackingId={trackingId}
                                timer={5000}
                                direction="horizontal"
                            />
                        )}
                        {tronAdsEnabled && (
                            <TronAd
                                env={tronAdsEnv}
                                trackingId={trackingId}
                                wrapperName={'tron_ad_sideby'}
                                pid={tronAdSidebyPid}
                                isMock={tronAdsMock}
                                lang={locale}
                                adTag={'tron_ad_sideby'}
                                ratioClass={'ratio-1-1'}
                            />
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

const emptySet = Set();
export default connect(
    (state, ownProps) => {
        const currLocation = ownProps.router.getCurrentLocation();
        const { username, slug } = ownProps.routeParams;
        const post = username + '/' + slug;
        const content = state.global.get('content');
        const dis = content.get(post);
        const adSwipeConf = state.app.getIn(['adSwipe']);
        const tronAdsConf = state.app.getIn(['tronAds']);
        const locale = state.app.getIn(['user_preferences', 'locale']);
        const trackingId = state.app.getIn(['trackingId'], null);
        const steemMarketData = state.app.get('steemMarket');
        const uname =
            state.user.getIn(['current', 'username']) ||
            state.offchain.get('account');
        const postLeftSideAdList = state.ad.getIn(
            ['postLeftSideAdList'],
            List()
        );
        const bottomAdList = state.ad.getIn(['bottomAdList'], List());
        return {
            post,
            content,
            dis,
            sortOrder: currLocation.query.sort || 'trending',
            gptEnabled: false, //state.app.getIn(['googleAds', 'gptEnabled']),
            adSwipeConf,
            tronAdsConf,
            locale,
            trackingId,
            steemMarketData,
            isBrowser: process.env.BROWSER,
            uname,
            topics: state.global.getIn(['topics'], List()),
            postLeftSideAdList,
            bottomAdList,
        };
    },
    dispatch => ({
        setRouteTag: permlink =>
            dispatch(
                appActions.setRouteTag({
                    routeTag: 'post',
                    params: { permlink },
                })
            ),
    })
)(Post);
