import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { activityContentSelector } from 'src/app/redux/selectors/userProfile/activity';
import { notifyGetHistory } from 'src/app/redux/actions/gate';

import Card, { CardContent } from 'golos-ui/Card';
import { TabContainer, Tabs } from 'golos-ui/Tabs';

// import { ActivityShow } from 'src/app/components/userProfile';
import ActivityList from 'src/app/components/userProfile/activity/ActivityList';

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            notifyGetHistory,
        },
        dispatch
    );
}

@connect(
    activityContentSelector,
    mapDispatchToProps
)
export default class ActivityContent extends Component {
    componentDidMount() {
        this.props.notifyGetHistory({
            types: 'all',
            skip: 0,
            limit: 15,
        });
    }

    render() {
        const { notifies, accounts } = this.props;

        return (
            <Card auto>
                <Tabs activeTab={{ id: 'tab1' }} onChange={(tab) => console.log(tab)}>
                    <CardContent>
                        <TabContainer id="tab1" title="Все">
                            <ActivityList notifies={notifies} accounts={accounts} />
                        </TabContainer>
                        <TabContainer id="tab2" title="Награды">
                            <ActivityList notifies={notifies}  accounts={accounts} />
                        </TabContainer>
                        <TabContainer id="tab3" title="Ответы">
                            <ActivityList notifies={notifies}  accounts={accounts} />
                        </TabContainer>
                        <TabContainer id="tab4" title="Социальные">
                            <ActivityList notifies={notifies}  accounts={accounts} />
                        </TabContainer>
                        <TabContainer id="tab5" title="Упоминания">
                            <ActivityList notifies={notifies}  accounts={accounts} />
                        </TabContainer>
                    </CardContent>
                </Tabs>
            </Card>
        );
    }
}
