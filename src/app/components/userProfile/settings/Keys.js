import React from 'react';

import { TabContainer, Tabs } from 'golos-ui/Tabs';

import Current from './keys/Current';
import New from './keys/New';

const Keys = ({ account, options, isChanging, onSubmitBlockchain }) => {
    return (
        <Tabs activeTab={{ id: 'currentKeysTab' }}>
            <TabContainer id="currentKeysTab" title="Ключи">
                <Current
                    account={account}
                    options={options}
                    isChanging={isChanging}
                    onSubmitBlockchain={onSubmitBlockchain}
                />
            </TabContainer>
            <TabContainer id="newKeyTab" title="Новый ключ">
                <New
                    account={account}
                    options={options}
                    isChanging={isChanging}
                    onSubmitBlockchain={onSubmitBlockchain}
                />
            </TabContainer>
        </Tabs>
    );
};

export default Keys;
