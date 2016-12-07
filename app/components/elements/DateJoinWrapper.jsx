import React from 'react';
import { translate } from 'app/Translator';
import { FormattedRelative } from 'react-intl';

export default class DateJoinWrapper extends React.Component {
    render() {
        let date = new Date(this.props.date);
        return (
                <span><p>{translate('joined')} <FormattedRelative value={date} /></p></span>
            )
    }
}
