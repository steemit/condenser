import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { List } from 'immutable';

import throttle from 'lodash/throttle';

import { NOTIFIES_FILTER_TYPES } from 'src/app/redux/constants/common';
import { activityContentSelector } from 'src/app/redux/selectors/userProfile/activity';
import { getNotifyHistory } from 'src/app/redux/actions/gate';
import { changeProfileActivityTab } from 'src/app/redux/actions/ui';

import Card, { CardContent } from 'golos-ui/Card';
import { TabContainer, Tabs } from 'golos-ui/Tabs';

// import { ActivityShow } from 'src/app/components/userProfile';
import ActivityList from 'src/app/components/userProfile/activity/ActivityList';

@connect(
    activityContentSelector,
    {
        getNotifyHistory,
        changeProfileActivityTab,
    }
)
export default class ActivityContent extends Component {
    static propTypes = {
        notifies: PropTypes.instanceOf(List),
        currentTabId: PropTypes.string,
        changeProfileActivityTab: PropTypes.func,
        getNotifyHistory: PropTypes.func,
    };

    state = {
        page: 0,
    }

    rootRef = null;

    componentDidMount() {
        this.loadMore();
        window.addEventListener('scroll', this.handeScroll);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handeScroll);
        this.handeScroll.cancel();
    }

    componentDidUpdate(prevProps) {
        if (this.props.currentTabId !== prevProps.currentTabId) {
            this.loadMore();
        }
    }

    setRootRef = el => this.rootRef = el;

    handeScroll = throttle(
        () => {
            // const rect = this.rootRef.getBoundingClientRect();

            // if (rect.top + rect.height < window.innerHeight * 1.5) {
            //     this.loadMore();
            // }
        },
        100,
        { leading: false, tailing: true }
    );

    handleChangeTab = tab => this.props.changeProfileActivityTab(tab.id);

    loadMore = () => {
        const { page } = this.state;

        this.props.getNotifyHistory({
            types: NOTIFIES_FILTER_TYPES[this.props.currentTabId],
            skip: page * 5,
            limit: page * 5 + 15,
        });
    };

    render() {
        const { notifies, accounts, currentTabId } = this.props;

        return (
            <Card auto innerRef={this.setRootRef}>
                <Tabs activeTab={{ id: currentTabId }} onChange={this.handleChangeTab}>
                    <CardContent>
                        <TabContainer id="all" title="Все">
                            <ActivityList notifies={notifies} accounts={accounts} />
                        </TabContainer>
                        <TabContainer id="awards" title="Награды">
                            <ActivityList notifies={notifies} accounts={accounts} />
                        </TabContainer>
                        <TabContainer id="answers" title="Ответы">
                            <ActivityList notifies={notifies} accounts={accounts} />
                        </TabContainer>
                        <TabContainer id="social" title="Социальные">
                            <ActivityList notifies={notifies} accounts={accounts} />
                        </TabContainer>
                        <TabContainer id="mentions" title="Упоминания">
                            <ActivityList notifies={notifies} accounts={accounts} />
                        </TabContainer>
                    </CardContent>
                </Tabs>
            </Card>
        );
    }
}
