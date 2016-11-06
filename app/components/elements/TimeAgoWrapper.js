/* eslint react/prop-types: 0 */
import React from 'react';
import { FormattedRelative } from 'react-intl';

export default class TimeAgoWrapper extends React.Component {
    render() {
        let {date} = this.props
        if(date && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d$/.test(date)) {
            date = date + 'Z' // Firefox really wants this Z (Zulu)
        }
        return <FormattedRelative {...this.props} value={date} />
    }
}
