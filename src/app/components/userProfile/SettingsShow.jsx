import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import tt from 'counterpart';

import Card from 'golos-ui/Card';
import { TabContainer, Tabs } from 'golos-ui/Tabs';

import Common from './settings/Common';
import Account from './settings/Account';
import Publications from './settings/Publications';
import Notifications from './settings/Notifications';

export default class SettingsShow extends PureComponent {
    static propTypes = {
        profile: PropTypes.object,
        account: PropTypes.object,
        onSubmit: PropTypes.func,
    };

    render() {
        const { profile, account, onSubmit } = this.props;

        return (
            <Card style={{ flexBasis: '566px' }}>
                <Tabs activeTab={{ id: 'common' }}>
                    <TabContainer id="common" title="Общие">
                        <Common />
                    </TabContainer>
                    <TabContainer id="account" title="Учетная запись">
                        <Account profile={profile} account={account} onSubmit={onSubmit} />
                    </TabContainer>
                    <TabContainer id="publications" title="Публикации">
                        <Publications profile={profile} onSubmit={onSubmit} />
                    </TabContainer>
                    <TabContainer id="notifications" title="Уведомления">
                        <Notifications profile={profile} onSubmit={onSubmit} />
                    </TabContainer>
                </Tabs>
            </Card>
        );
    }
}
