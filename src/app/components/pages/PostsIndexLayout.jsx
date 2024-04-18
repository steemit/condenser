/* eslint react/prop-types: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { List } from 'immutable';
import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';
import SidebarLinks from 'app/components/elements/SidebarLinks';
import SidebarNewUsers from 'app/components/elements/SidebarNewUsers';
import Notices from 'app/components/elements/Notices';
import SteemMarket from 'app/components/elements/SteemMarket';
import Topics from './Topics';
import Announcement from './Announcement';
import CommunityPane from 'app/components/elements/CommunityPane';
import CommunityPaneMobile from 'app/components/elements/CommunityPaneMobile';
import AdSwipe from 'app/components/elements/AdSwipe';
import TronAd from 'app/components/elements/TronAd';

class PostsIndexLayout extends React.Component {
    static propTypes = {
        username: PropTypes.string,
        blogmode: PropTypes.bool,
        topics: PropTypes.object,
    };

    constructor() {
        super();
    }

    componentWillMount() {
        const { subscriptions, getSubscriptions, username } = this.props;
        if (!subscriptions && username) getSubscriptions(username);
    }

    componentDidUpdate(prevProps) {
        const { subscriptions, getSubscriptions, username } = this.props;
        if (!subscriptions && username && username != prevProps.username)
            getSubscriptions(username);
    }

    render() {
        const {
            topics,
            subscriptions,
            enableAds,
            community,
            username,
            blogmode,
            isBrowser,
            children,
            category,
            indexLeftSideAdList,
            trackingId,
            adSwipeConf,
            tronAdsConf,
            locale,
        } = this.props;
        const adSwipeEnabled = adSwipeConf.getIn(['enabled']);
        const tronAdsEnabled = tronAdsConf.getIn(['enabled']);
        const tronAdSidebyPid = tronAdsConf.getIn(['sidebar_ad_pid']);
        const tronAdsEnv = tronAdsConf.getIn(['env']);
        const tronAdsMock = tronAdsConf.getIn(['is_mock']);

        return (
            <div
                className={
                    'PostsIndex row ' +
                    (blogmode ? 'layout-block' : 'layout-list')
                }
            >
                <article className="articles">
                    {community && (
                        <span className="hide-for-mq-large articles__header-select">
                            <CommunityPaneMobile
                                community={community}
                                username={username}
                            />
                        </span>
                    )}
                    {children}
                </article>

                <aside className="c-sidebar c-sidebar--right">
                    {community && (
                        <CommunityPane
                            community={community}
                            username={username}
                        />
                    )}
                    {isBrowser &&
                        !community &&
                        !username && <SidebarNewUsers />}
                    {isBrowser &&
                        !community &&
                        username && (
                            <SidebarLinks username={username} topics={topics} />
                        )}
                    {false && !community && <Notices />}
                    {/* {!community && <SteemMarket />} */}
                    <SteemMarket
                        page={`${
                            category
                                ? 'CoinMarketPlaceCommunity'
                                : 'CoinMarketPlaceIndex'
                        }`}
                    />
                </aside>

                <aside className="c-sidebar c-sidebar--left">
                    <Announcement />
                    <Topics
                        compact={false}
                        username={username}
                        subscriptions={subscriptions}
                        topics={topics}
                    />
                    {adSwipeEnabled && (
                        <AdSwipe
                            adList={indexLeftSideAdList}
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
                </aside>
            </div>
        );
    }
}

export default connect(
    (state, props) => {
        const username =
            state.user.getIn(['current', 'username']) ||
            state.offchain.get('account');
        const adSwipeConf = state.app.getIn(['adSwipe']);
        const tronAdsConf = state.app.getIn(['tronAds']);
        const locale = state.app.getIn(['user_preferences', 'locale']);
        const trackingId = state.app.getIn(['trackingId'], null);
        const indexLeftSideAdList = state.ad.getIn(
            ['indexLeftSideAdList'],
            List()
        );
        return {
            blogmode: props.blogmode,
            enableAds: props.enableAds,
            community: state.global.getIn(['community', props.category], null),
            subscriptions: state.global.getIn(
                ['subscriptions', username],
                null
            ),
            topics: state.global.getIn(['topics'], List()),
            isBrowser: process.env.BROWSER,
            username,
            adSwipeConf,
            tronAdsConf,
            locale,
            trackingId,
            indexLeftSideAdList,
        };
    },
    dispatch => ({
        getSubscriptions: account =>
            dispatch(fetchDataSagaActions.getSubscriptions(account)),
    })
)(PostsIndexLayout);
