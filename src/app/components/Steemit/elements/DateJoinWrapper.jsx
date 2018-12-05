import React from 'react';
import tt from 'counterpart';
import { FormattedDate } from 'react-intl';

export default class DateJoinWrapper extends React.Component {
    render() {
        const date = new Date(this.props.date);
        return (
            <span>
                {tt('g.joined')}{' '}
                <FormattedDate value={date} year="numeric" month="long" />
            </span>
        );
    }
}
