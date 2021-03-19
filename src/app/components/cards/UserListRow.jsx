import React from 'react';
import { Link } from 'react-router';
import Follow from 'app/components/elements/Follow';

class UserListRow extends React.Component {
    render() {
        const { user, loggedIn } = this.props;
        return (
            <tr>
                <td>
                    <Link to={'/@' + user.follower}>
                        <strong>{user.follower}</strong>
                        {user.reputation && `(${Math.floor(user.reputation)})`}
                    </Link>
                </td>
                {loggedIn && (
                    <td width="250">
                        <Follow following={user.follower} />
                    </td>
                )}
            </tr>
        );
    }
}

import { connect } from 'react-redux';

export default connect((state, ownProps) => {
    const loggedIn = state.user.hasIn(['current', 'username']);
    return {
        ...ownProps,
        loggedIn,
    };
})(UserListRow);
