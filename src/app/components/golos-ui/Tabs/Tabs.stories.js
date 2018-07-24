import React, { Fragment } from 'react';
import { storiesOf } from '@storybook/react';

import TabContainer from './TabContainer';
import Tabs from './Tabs';
import Card, { CardContent } from 'golos-ui/Card';

const Tab1 = () => {
    console.log(1);
    return <div>This is tab 1</div>;
};
const Tab2 = () => {
    console.log(2);
    return <div>This is tab 2</div>;
};

storiesOf('Golos UI/Tabs', module).add('default', () => (
    <Card>
        <Tabs
            activeTab={{
                id: 'tab1',
            }}
        >
            <CardContent>
                <TabContainer id="tab1" title="Tab 1">
                    <Tab1 />
                </TabContainer>
                <TabContainer id="tab2" title="Tab 2">
                    <Tab2 />
                </TabContainer>
            </CardContent>
        </Tabs>
    </Card>
));
