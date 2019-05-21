import React from 'react';
import tt from 'counterpart';
import { FormattedDate } from 'react-intl';

export default class DateJoinWrapper extends React.Component {
    render() {
        let date = new Date(this.props.date);
        if (date[date.length - 1] != 'Z') date += 'Z'; // Firefox needs 'Z' suffix

        return (
            <span>
                {tt('g.joined')}{' '}
                <FormattedDate value={date} year="numeric" month="long" />
            </span>
        );
    }
}
