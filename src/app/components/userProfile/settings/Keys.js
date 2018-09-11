import React from 'react';

import tt from 'counterpart';

import { TabContainer, Tabs } from 'golos-ui/Tabs';

import Current from './keys/Current';
import New from './keys/New';

const Keys = ({ account, privateKeys, onSubmitChangePassword, showLogin, showQRKey }) => {
    return (
        <Tabs activeTab={{ id: 'currentKeysTab' }}>
            <TabContainer id="currentKeysTab" title={tt('settings_jsx.tabs-keys.keys')}>
                <Current
                    account={account}
                    privateKeys={privateKeys}
                    showLogin={showLogin}
                    showQRKey={showQRKey}
                />
            </TabContainer>
            <TabContainer id="newKeyTab" title={tt('settings_jsx.tabs-keys.new')}>
                <New account={account} onSubmitChangePassword={onSubmitChangePassword} />
            </TabContainer>
        </Tabs>
    );
};

export default Keys;
