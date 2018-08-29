import React from 'react';

import { TabContainer, Tabs } from 'golos-ui/Tabs';

import Current from './keys/Current';
import New from './keys/New';

const Keys = ({ account, privateKeys, onSubmitChangePassword, showLogin, showQRKey }) => {
    return (
        <Tabs activeTab={{ id: 'currentKeysTab' }}>
            <TabContainer id="currentKeysTab" title="Ключи">
                <Current
                    account={account}
                    privateKeys={privateKeys}
                    showLogin={showLogin}
                    showQRKey={showQRKey}
                />
            </TabContainer>
            <TabContainer id="newKeyTab" title="Новый ключ">
                <New account={account} onSubmitChangePassword={onSubmitChangePassword} />
            </TabContainer>
        </Tabs>
    );
};

export default Keys;
