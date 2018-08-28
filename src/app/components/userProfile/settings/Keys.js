import React from 'react';

import { TabContainer, Tabs } from 'golos-ui/Tabs';

import Current from './keys/Current';
import New from './keys/New';

const Notifications = ({ account, options, isChanging, onSubmitGate }) => {
    return (
        <Tabs activeTab={{ id: 'currentKeysTab' }}>
            <TabContainer id="currentKeysTab" title="Ключи">
                <Current
                    account={account}
                    options={options}
                    isChanging={isChanging}
                    onSubmitGate={onSubmitGate}
                />
            </TabContainer>
            <TabContainer id="newKeyTab" title="Новый ключ">
                <New
                    options={options}
                    isChanging={isChanging}
                    onSubmitGate={onSubmitGate}
                />
            </TabContainer>
        </Tabs>
    );
};

export default Notifications;
