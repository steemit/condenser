import React from 'react';
import {default as YotificationModule, LAYOUT_PAGE} from 'app/components/modules/Yotification'; //eslint-disable-line import/no-named-default


class NotificationPage extends React.Component {

    render() {
        return ( <YotificationModule layout={ LAYOUT_PAGE } /> );
    }
}

export default NotificationPage;
