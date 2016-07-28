/* eslint react/prop-types: 0 */
import React from 'react';
import TimeAgo from 'react-timeago'

export default class TimeAgoWrapper extends React.Component {
    render() {
        let {date} = this.props
        if(date && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d$/.test(date)) {
            date = date + 'Z' // Firefox really wants this Z (Zulu)
        }
        return <TimeAgo {...this.props} date={date} />
    }
}
