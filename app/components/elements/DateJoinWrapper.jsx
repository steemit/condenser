import React from 'react';
import { translate } from 'app/Translator';

export default class DateJoinWrapper extends React.Component {
    render() {
        let date = new Date(this.props.date);
        let monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
            "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
        ];
        let joinMonth = monthNames[date.getMonth()];
        let joinYear = date.getFullYear();
        return (
                <span>{translate('joined')} {joinMonth} {joinYear}</span>
            )
    }
}
