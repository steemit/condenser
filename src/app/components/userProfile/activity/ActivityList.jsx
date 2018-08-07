import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import ActivityItem from './ActivityItem';

const Wrapper = styled.div`
    flex: 1;
`;

const Loader = styled(LoadingIndicator)`
    margin: 30px 0;
`

export default class ActivityList extends Component {
    static propTypes = {
        // notify: PropTypes.object,
    };

    render() {
        const { notifies, accounts } = this.props;

        return (
            <Wrapper>
                {!notifies.size && <Loader type="circle" center/>}
                {notifies
                    .sortBy(notify => notify.get('createdAt'))
                    .reverse()
                    .map(notify => <ActivityItem notify={notify} accounts={accounts} key={notify.get('_id')} />)}
            </Wrapper>
        );
    }
}
