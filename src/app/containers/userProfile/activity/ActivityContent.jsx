import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

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
        currentTabId: PropTypes.string,
        changeProfileActivityTab: PropTypes.func,
        getNotifyHistory: PropTypes.func
    }

    componentDidMount() {
        this.props.getNotifyHistory({
            types: 'all',
            skip: 0,
            limit: 15,
        });
    }

    render() {
        const { notifies, accounts, currentTabId } = this.props;

        return (
            <Card auto>
                <Tabs activeTab={{ id: currentTabId }} onChange={(tab) => console.log(tab)}>
                    <CardContent>
                        <TabContainer id="all" title="Все">
                            <ActivityList notifies={notifies} accounts={accounts} />
                        </TabContainer>
                        <TabContainer id="awards" title="Награды">
                            <ActivityList notifies={notifies}  accounts={accounts} />
                        </TabContainer>
                        <TabContainer id="answers" title="Ответы">
                            <ActivityList notifies={notifies}  accounts={accounts} />
                        </TabContainer>
                        <TabContainer id="social" title="Социальные">
                            <ActivityList notifies={notifies}  accounts={accounts} />
                        </TabContainer>
                        <TabContainer id="mentions" title="Упоминания">
                            <ActivityList notifies={notifies}  accounts={accounts} />
                        </TabContainer>
                    </CardContent>
                </Tabs>
            </Card>
        );
    }
}
