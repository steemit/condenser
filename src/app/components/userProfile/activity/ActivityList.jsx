import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import ActivityItem from './ActivityItem';

const Wrapper = styled.div`
    flex: 1;
`;

const Loader = styled(LoadingIndicator)`
    margin: 30px 0;
`;

export default class ActivityList extends Component {
    static propTypes = {
        isFetching: PropTypes.bool,
        // notify: PropTypes.object,
    };

    render() {
        const { isFetching, notifies, accounts } = this.props;

        if (isFetching) {
            return <Loader type="circle" center />;
        }
        if (!notifies.size) {
            return <div>Пусто</div>;
        }

        return (
            <Fragment>
                {notifies
                    .sortBy(notify => notify.get('createdAt'))
                    .reverse()
                    .map(notify => (
                        <ActivityItem notify={notify} accounts={accounts} key={notify.get('_id')} />
                    ))}
            </Fragment>
        );
    }
}
