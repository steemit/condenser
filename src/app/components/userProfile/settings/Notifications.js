import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import tt from 'counterpart';

import { TabContainer, Tabs } from 'golos-ui/Tabs';

const Notifications = ({ profile, onSubmit }) => {
    return (
        <Tabs activeTab={{ id: 'tab1' }}>
            <TabContainer id="online" title="Онлайн" />
            <TabContainer id="push" title="Пуш" />
            <TabContainer id="email" title="E-mail" />
        </Tabs>
    );
};

export default Notifications;
