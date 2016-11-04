import React from 'react';

export default class DateJoinWrapper extends React.Component {
    render() {
        let date = new Date(this.props.date);
        let monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        let joinMonth = monthNames[date.getMonth()];
        let joinYear = date.getFullYear();
        return (
            <span><p>Joined {joinMonth}, {joinYear}</p></span>
            )
    }
}
