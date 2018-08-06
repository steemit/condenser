import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import ActivityItem from './ActivityItem';

const Wrapper = styled.div`
    flex: 1;
`;

export default class ActivityList extends Component {
    static propTypes = {
        // notify: PropTypes.object,
    };

    render() {
        const { notifies } = this.props;

        return (
            <Wrapper>
                {notifies
                    .sortBy(notify => notify.get('createdAt'))
                    .reverse()
                    .map(notify => <ActivityItem notify={notify} key={notify.get('_id')} />)}
            </Wrapper>
        );
    }
}
