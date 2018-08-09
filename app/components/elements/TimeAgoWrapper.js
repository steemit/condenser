import React, { Component } from 'react';
import { FormattedRelative } from 'react-intl';

export default class TimeAgoWrapper extends Component {
    render() {
        let { date, className } = this.props;

        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(date)) {
            date += 'Z';
        }

        return (
            <span title={new Date(date).toLocaleString()} className={className}>
                <FormattedRelative {...this.props} value={date} />
            </span>
        );
    }
}
