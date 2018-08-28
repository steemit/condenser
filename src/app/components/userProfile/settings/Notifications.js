import React from 'react';

import { TabContainer, Tabs } from 'golos-ui/Tabs';

import Online from './notifications/Online';
import Push from './notifications/Push';
import Email from './notifications/Email';

const Notifications = ({ options, isChanging, onSubmitGate }) => {
    return (
        <Tabs activeTab={{ id: 'onlineTab' }}>
            <TabContainer id="onlineTab" title="Онлайн">
                <Online
                    options={options}
                    isChanging={isChanging}
                    onSubmitGate={onSubmitGate}
                />
            </TabContainer>
            <TabContainer id="pushTab" title="Пуш">
                <Push
                    options={options}
                    isChanging={isChanging}
                    onSubmitGate={onSubmitGate}
                />
            </TabContainer>
            <TabContainer id="emailTab" title="E-mail">
                <Email
                    options={options}
                    isChanging={isChanging}
                    onSubmitGate={onSubmitGate}
                />
            </TabContainer>
        </Tabs>
    );
};

export default Notifications;
