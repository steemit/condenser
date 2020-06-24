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
import GptAd from 'app/components/elements/GptAd';
import Topics from './Topics';
import CommunityPane from 'app/components/elements/CommunityPane';
import CommunityPaneMobile from 'app/components/elements/CommunityPaneMobile';
import { recordAdsView } from 'app/utils/ServerApiClient';
import { APP_DOMAIN } from 'app/client_config';

class PostsIndexLayout extends React.Component {
    static propTypes = {
        username: PropTypes.string,
        blogmode: PropTypes.bool,
        topics: PropTypes.object,
    };

    constructor() {
        super();
        this.setRecordAdsView = this.setRecordAdsView.bind(this);
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

    setRecordAdsView() {
        recordAdsView({
            trackingId: this.props.trackingId,
            adTag: 'SteemitDlivebanner240*240',
        });
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
        } = this.props;

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
                    {!community && <SteemMarket />}
                    {enableAds && (
                        <div className="sidebar-ad">
                            <GptAd
                                type="Freestar"
                                id="bsa-zone_1566495004689-0_123456"
                            />
                        </div>
                    )}
                </aside>

                <aside className="c-sidebar c-sidebar--left">
                    <Topics
                        compact={false}
                        username={username}
                        subscriptions={subscriptions}
                        topics={topics}
                    />
                    <div className="c-sidebr-ads">
                        <a
                            href="https://dlive.tv/"
                            target="_blank"
                            onClick={this.setRecordAdsView}
                        >
                            <img
                                src={`https://${APP_DOMAIN}/images/dlive.png`}
                                alt=""
                                width="240"
                                height="240"
                            />
                        </a>
                    </div>
                    {enableAds && (
                        <div>
                            <div className="sidebar-ad">
                                <GptAd
                                    type="Freestar"
                                    slotName="bsa-zone_1566494461953-7_123456"
                                />
                            </div>
                            <div
                                className="sidebar-ad"
                                style={{ marginTop: 20 }}
                            >
                                <GptAd
                                    type="Freestar"
                                    slotName="bsa-zone_1566494856923-9_123456"
                                />
                            </div>
                        </div>
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
        const trackingId = state.user.get('trackingId');
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
            trackingId,
        };
    },
    dispatch => ({
        getSubscriptions: account =>
            dispatch(fetchDataSagaActions.getSubscriptions(account)),
    })
)(PostsIndexLayout);
