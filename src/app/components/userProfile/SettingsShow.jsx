import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';

import tt from 'counterpart';

import Card from 'golos-ui/Card';
import { TabContainer, Tabs } from 'golos-ui/Tabs';

import Common from './settings/Common';
import Account from './settings/Account';
import Notifications from './settings/Notifications';

export default class SettingsShow extends PureComponent {
    static propTypes = {
        profile: PropTypes.object,
        account: PropTypes.object,

        options: PropTypes.instanceOf(Map),
        isChanging: PropTypes.bool,

        onSubmitBlockchain: PropTypes.func,
        onSubmitGate: PropTypes.func,
    };

    render() {
        const {
            profile,
            account,

            options,
            isChanging,

            onSubmitBlockchain,
            onSubmitGate,
        } = this.props;

        return (
            <Card style={{ width: '566px' }}>
                <Tabs activeTab={{ id: 'commonTab' }}>
                    <TabContainer id="commonTab" title="Общие">
                        <Common
                            profile={profile}
                            options={options}
                            isChanging={isChanging}
                            onSubmitGate={onSubmitGate}
                        />
                    </TabContainer>
                    <TabContainer id="accountTab" title="Учетная запись">
                        <Account
                            profile={profile}
                            account={account}
                            options={options}
                            isChanging={isChanging}
                            onSubmitBlockchain={onSubmitBlockchain}
                        />
                    </TabContainer>
                    <TabContainer id="notificationsTab" title="Уведомления">
                        <Notifications
                            profile={profile}
                            options={options}
                            isChanging={isChanging}
                            onSubmitGate={onSubmitGate}
                        />
                    </TabContainer>
                </Tabs>
            </Card>
        );
    }
}
