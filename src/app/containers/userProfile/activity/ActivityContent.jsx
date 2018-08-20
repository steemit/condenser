import React, { Fragment, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { List } from 'immutable';
import styled from 'styled-components';

import throttle from 'lodash/throttle';

import { NOTIFICATIONS_FILTER_TYPES } from 'src/app/redux/constants/common';
import { activityContentSelector } from 'src/app/redux/selectors/userProfile/activity';
import { getNotificationsHistory } from 'src/app/redux/actions/notifications';
import { changeProfileActivityTab } from 'src/app/redux/actions/ui';

import Card, { CardContent } from 'golos-ui/Card';
import { TabContainer, Tabs } from 'golos-ui/Tabs';

import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import ActivityList from 'src/app/components/userProfile/activity/ActivityList';

const WrapperLoader = styled.div`
    display: flex;
    justify-content: center;
    height: 80px;
    padding-top: 20px;
`;
@connect(
    activityContentSelector,
    {
        getNotificationsHistory,
        changeProfileActivityTab,
    }
)
export default class ActivityContent extends PureComponent {
    static propTypes = {
        isFetching: PropTypes.bool,
        currentTabId: PropTypes.string,
        notifications: PropTypes.instanceOf(List),

        changeProfileActivityTab: PropTypes.func,
        getNotificationsHistory: PropTypes.func,
    };

    rootRef = null;

    lastNotificationId = null;

    componentDidMount() {
        this.loadMore();
        window.addEventListener('scroll', this.handleScroll);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
        this.handleScroll.cancel();
    }

    componentDidUpdate(prevProps) {
        if (this.props.currentTabId !== prevProps.currentTabId) {
            this.loadMore();
        }
    }

    setRootRef = el => (this.rootRef = el);

    handleChangeTab = tab => this.props.changeProfileActivityTab(tab.id);

    handleScroll = throttle(() => {
        const { isFetching } = this.props;

        if (!isFetching) {
            const rect = this.rootRef.getBoundingClientRect();
            if (rect.top + rect.height < window.innerHeight * 1.5) {
                this.loadMore();
            }
        }
    }, 1000);

    loadMore = () => {
        const { notifications } = this.props;

        const lastNotification = notifications && notifications.get(-1);
        const fromId = (lastNotification && lastNotification.get('_id')) || null;

        if (!this.lastNotificationId || this.lastNotificationId !== fromId) {
            this.props.getNotificationsHistory({
                types: NOTIFICATIONS_FILTER_TYPES[this.props.currentTabId],
                fromId,
                limit: 5,
            });
        }

        this.lastNotificationId = fromId;
    };

    renderTabs = () => {
        const { isFetching, notifications, accounts } = this.props;
        const tabs = [
            { id: 'all', title: 'Все' },
            { id: 'awards', title: 'Награды' },
            { id: 'answers', title: 'Ответы' },
            { id: 'social', title: 'Социальные' },
            { id: 'mentions', title: 'Упоминания' },
        ];

        return tabs.map(({ id, title }, key) => (
            <TabContainer id={id} title={title} key={key}>
                <ActivityList
                    isFetching={isFetching}
                    notifications={notifications}
                    accounts={accounts}
                />
            </TabContainer>
        ));
    };

    render() {
        const { isFetching, currentTabId } = this.props;

        return (
            <Fragment>
                <Card auto innerRef={this.setRootRef}>
                    <Tabs activeTab={{ id: currentTabId }} onChange={this.handleChangeTab}>
                        <CardContent column auto>
                            {this.renderTabs()}
                        </CardContent>
                    </Tabs>
                </Card>
                <WrapperLoader>{isFetching && <LoadingIndicator type="circle" center />}</WrapperLoader>
            </Fragment>
        );
    }
}
