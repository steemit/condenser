import React from 'react';
import {default as YotificationModule, LAYOUT_PAGE, FILTER_ALL} from 'app/components/modules/Yotification'; //eslint-disable-line import/no-named-default

export const SUBSECTION_DEFAULT = FILTER_ALL;

class NotificationPage extends React.Component {

    render() {
        return ( <YotificationModule layout={LAYOUT_PAGE} filter={this.props.subsection} /> );
    }
}

export default NotificationPage;
