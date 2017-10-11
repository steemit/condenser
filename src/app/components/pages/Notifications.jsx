import React from 'react';
import YotificationModule, { LAYOUT_PAGE, FILTER_ALL } from 'app/components/modules/Yotification';

export const SUBSECTION_DEFAULT = FILTER_ALL;

class NotificationPage extends React.Component {

    render() {
        return ( <YotificationModule layout={LAYOUT_PAGE} filter={this.props.subsection} /> );
    }
}

export default NotificationPage;
