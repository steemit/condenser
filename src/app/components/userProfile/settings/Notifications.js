import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import tt from 'counterpart';

import { TabContainer, Tabs } from 'golos-ui/Tabs';

import Online from './notifications/Online';
import Push from './notifications/Push';
import Email from './notifications/Email';

const Notifications = ({ profile, onSubmit }) => {
    return (
        <Tabs activeTab={{ id: 'onlineTab' }}>
            <TabContainer id="onlineTab" title="Онлайн">
                <Online profile={profile} onSubmit={onSubmit}/>
            </TabContainer>
            <TabContainer id="pushTab" title="Пуш">
                <Push profile={profile} onSubmit={onSubmit}/>
            </TabContainer>
            <TabContainer id="emailTab" title="E-mail">
                <Email profile={profile} onSubmit={onSubmit}/>
            </TabContainer>
        </Tabs>
    );
};

export default Notifications;
