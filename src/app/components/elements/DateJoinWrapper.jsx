import React from 'react';
import tt from 'counterpart';

export default class DateJoinWrapper extends React.Component {
    render() {
        const date = new Date(this.props.date);
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const joinMonth = monthNames[date.getMonth()];
        const joinYear = date.getFullYear();
        return (
                <span>{tt('g.joined', {month: joinMonth, year: joinYear})}</span>
            )
    }
}
