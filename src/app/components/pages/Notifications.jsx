import React from 'react';
import YotificationList, {
    LAYOUT_PAGE,
    FILTER_ALL,
} from 'app/components/modules/YotificationList';

export const SUBSECTION_DEFAULT = FILTER_ALL;

class NotificationPage extends React.Component {
    render() {
        console.log(
            'This should render an error message if the url does not match the current user.'
        );
        return (
            <YotificationList
                layout={LAYOUT_PAGE}
                filter={this.props.subsection}
            />
        );
    }
}

export default NotificationPage;
