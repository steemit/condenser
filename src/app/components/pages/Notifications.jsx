import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import NotificationList, {
    FILTER_ALL,
} from 'app/components/notifications/NotificationList';
import { showLogin } from 'app/redux/UserReducer';
import { urlLogin, urlNotifications, urlSignup } from 'app/utils/Url';

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
                        <span>
                            <Link
                                to={urlLogin()}
                                onClick={this.props.showLogin}
                            >
                                Log in
                            </Link>
                            {' or '}
                            <Link to={urlSignup()}>
                                sign up to get notifications
                            </Link>
                        </span>
                    )}
                </div>
            );
        }
        return <NotificationList filter={this.props.subsection} />;
    }
}

export default connect(
    (state, ownProps) => {
        return {
            ...ownProps,
        };
    },
    dispatch => ({
        showLogin: e => {
            if (e) e.preventDefault();
            dispatch(showLogin());
        },
    })
)(NotificationPage);
