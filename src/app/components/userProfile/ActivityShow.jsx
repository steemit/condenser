import React, { Fragment, PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Card, { CardContent } from 'golos-ui/Card';
import { TabContainer, Tabs } from 'golos-ui/Tabs';

import ActivityList from './activity/ActivityList';

export default class ActivityShow extends PureComponent {

    render() {
        const { notifies, accounts } = this.props;

        return (
            <Card auto>
                <Tabs activeTab={{ id: 'tab1' }}>
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
