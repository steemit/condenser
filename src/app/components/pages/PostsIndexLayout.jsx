/* eslint react/prop-types: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { List } from 'immutable';
import SidebarLinks from 'app/components/elements/SidebarLinks';
import SidebarNewUsers from 'app/components/elements/SidebarNewUsers';
import Notices from 'app/components/elements/Notices';
import SteemMarket from 'app/components/elements/SteemMarket';
import CommunityPane from 'app/components/elements/CommunityPane';
import AdSwipe from 'app/components/elements/AdSwipe';
import TronAd from 'app/components/elements/TronAd';
import PrimaryNavigation from 'app/components/cards/PrimaryNavigation';
import Announcement from './Announcement';

class PostsIndexLayout extends React.Component {
    static propTypes = {
        username: PropTypes.string,
        blogmode: PropTypes.bool,
        topics: PropTypes.object,
    };

    render() {
        const {
            topics,
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
            routeTag,
        } = this.props;
        const adSwipeEnabled = adSwipeConf.getIn(['enabled']);
        const tronAdsEnabled = tronAdsConf.getIn(['enabled']);
        const tronAdSidebyPid = tronAdsConf.getIn(['sidebar_ad_pid']);
        const tronAdsEnv = tronAdsConf.getIn(['env']);
        const tronAdsMock = tronAdsConf.getIn(['is_mock']);

        return (
            <div>
                <div
                    className={
                        'PostsIndex row ' +
                        (blogmode ? 'layout-block' : 'layout-list')
                    }
                >
                    <article className="articles">{children}</article>

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
                            username && <Announcement />}
                        {isBrowser &&
                            !community &&
                            username && (
                                <SidebarLinks
                                    username={username}
                                    topics={topics}
                                />
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

                    <aside className="c-sidebar c-sidebar--left">
                        <PrimaryNavigation
                            routeTag={routeTag.routeTag}
                            category={category}
                        />
                    </aside>
                </div>
            </div>
        );
    }
}

export default connect((state, props) => {
    const username =
        state.user.getIn(['current', 'username']) ||
        state.offchain.get('account');
    const adSwipeConf = state.app.getIn(['adSwipe']);
    const tronAdsConf = state.app.getIn(['tronAds']);
    const locale = state.app.getIn(['user_preferences', 'locale']);
    const trackingId = state.app.getIn(['trackingId'], null);
    const indexLeftSideAdList = state.ad.getIn(['indexLeftSideAdList'], List());
    const routeTag = state.app.has('routeTag')
        ? state.app.get('routeTag')
        : null;
    return {
        blogmode: props.blogmode,
        enableAds: props.enableAds,
        community: state.global.getIn(['community', props.category], null),
        topics: state.global.getIn(['topics'], List()),
        isBrowser: process.env.BROWSER,
        username,
        adSwipeConf,
        tronAdsConf,
        locale,
        trackingId,
        indexLeftSideAdList,
        routeTag,
    };
})(PostsIndexLayout);
