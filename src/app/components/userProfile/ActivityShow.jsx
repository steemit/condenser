import React, { Fragment, PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Card, { CardContent } from 'golos-ui/Card';
import { TabContainer, Tabs } from 'golos-ui/Tabs';

import ActivityItem from './activity/ActivityItem';

const Tab2 = () => {
    return <div>This is tab 2</div>;
};

export default class ActivityShow extends PureComponent {

    static propTypes = {
        account: PropTypes.object,
    }

    render() {
        const { account } = this.props;

        return (
            <Card auto>
                <Tabs activeTab={{ id: 'tab1' }}>
                    <CardContent>
                        <TabContainer id="tab1" title="Все">
                            <ActivityItem account={account} />
                        </TabContainer>
                        <TabContainer id="tab2" title="Награды">
                            <Tab2 />
                        </TabContainer>
                        <TabContainer id="tab3" title="Ответы">
                            <Tab2 />
                        </TabContainer>
                        <TabContainer id="tab4" title="Социальные">
                            <Tab2 />
                        </TabContainer>
                        <TabContainer id="tab5" title="Упоминания">
                            <Tab2 />
                        </TabContainer>
                    </CardContent>
                </Tabs>
            </Card>
        );
    }
}
