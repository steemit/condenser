import React from 'react';
import { Link } from 'react-router';
import Follow from 'app/components/elements/Follow';

class UserListRow extends React.Component {
    render() {
        const { user, loggedIn, title } = this.props;
        const username = title === 'Followers' ? user.follower : user.following;
        return (
            <tr>
                <td>
                    <Link to={`/@${username}`}>
                        <strong>{username}</strong>
                        {user.reputation && `(${Math.floor(user.reputation)})`}
                    </Link>
                </td>
                {loggedIn && (
                    <td width="250">
                        <Follow following={username} whatIf={user.what} />
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
