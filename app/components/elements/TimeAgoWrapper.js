import React, { Component } from 'react';
import { FormattedRelative } from 'react-intl';

export default class TimeAgoWrapper extends Component {
    render() {
        const { date, className } = this.props;

        return (
            <span title={new Date(date).toLocaleString()} className={className}>
                <FormattedRelative {...this.props} value={date} />
            </span>
        );
    }
}
