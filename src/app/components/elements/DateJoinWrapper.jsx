import React from 'react';
import tt from 'counterpart';
import { FormattedDate } from 'react-intl';

export default class DateJoinWrapper extends React.Component {
    render() {
        let date = this.props.date.replace(' ', 'T');
        if (date[date.length - 1] != 'Z') date += 'Z';

        return (
            <span>
                {tt('g.joined')}{' '}
                <FormattedDate
                    value={new Date(date)}
                    year="numeric"
                    month="long"
                />
            </span>
        );
    }
}
