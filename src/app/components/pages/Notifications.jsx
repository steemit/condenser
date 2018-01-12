import React from 'react';
import YotificationList, {
    LAYOUT_PAGE,
    FILTER_ALL,
} from 'app/components/modules/YotificationList';
import { urlNotifications, urlSignup } from 'app/utils/Url';
import { Link } from 'react-router';

export const SUBSECTION_DEFAULT = FILTER_ALL;

class NotificationPage extends React.Component {
    render() {
        if (!this.props.isMyAccount) {
            return (
                <div>
                    <h3>
                        This is {this.props.account_name}'s notifications page.
                    </h3>
                    {this.props.username ? (
                        <Link to={urlNotifications(this.props.username)}>
                            View my own notifications
                        </Link>
                    ) : (
                        <Link to={urlSignup()}>
                            Create an account to get notifications
                        </Link>
                    )}
                </div>
            );
        }
        return (
            <YotificationList
                layout={LAYOUT_PAGE}
                filter={this.props.subsection}
            />
        );
    }
}

export default NotificationPage;
