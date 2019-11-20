/* eslint react/prop-types: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import tt from 'counterpart';
import { List, Map } from 'immutable';
import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';
import SidebarLinks from 'app/components/elements/SidebarLinks';
import SidebarNewUsers from 'app/components/elements/SidebarNewUsers';
import Notices from 'app/components/elements/Notices';
import SteemMarket from 'app/components/elements/SteemMarket';
import GptAd from 'app/components/elements/GptAd';
import Topics from './Topics';
import { ifHive } from 'app/utils/Community';
import CommunityPane from 'app/components/elements/CommunityPane';
import CommunityPaneMobile from 'app/components/elements/CommunityPaneMobile';

class PostsIndexLayout extends React.Component {
    static propTypes = {
        username: PropTypes.string,
        blogmode: PropTypes.bool,
        topics: PropTypes.object,
    };

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
        return {
            blogmode: props.blogmode,
            enableAds: props.enableAds,
            community: state.global.getIn(['community', props.category], null),
            subscriptions: state.global.get('subscriptions', null),
            topics: state.global.getIn(['topics'], List()),
            isBrowser: process.env.BROWSER,
            username:
                state.user.getIn(['current', 'username']) ||
                state.offchain.get('account'),
        };
    },
    dispatch => ({
        getSubscriptions: account =>
            dispatch(fetchDataSagaActions.getSubscriptions(account)),
    })
)(PostsIndexLayout);
