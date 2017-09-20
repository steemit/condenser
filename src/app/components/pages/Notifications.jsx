import React from 'react';
import YotificationList, { LAYOUT_PAGE, FILTER_ALL } from 'app/components/modules/YotificationList';

export const SUBSECTION_DEFAULT = FILTER_ALL;

class NotificationPage extends React.Component {

    render() {
        return ( <YotificationList layout={LAYOUT_PAGE} filter={this.props.subsection} /> );
    }
}

export default NotificationPage;
