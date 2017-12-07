import React from 'react';
import { Link } from 'react-router';
import Follow from 'app/components/elements/Follow';
import { connect } from 'react-redux';
import { pathTo } from 'app/Routes';

class UserListRow extends React.Component {
    render() {
        const { user, loggedIn } = this.props;
        return (
            <tr>
                {loggedIn && (
                    <td width="250">
                        <Follow following={user} />
                    </td>
                )}
                <td>
                    <Link to={pathTo.userProfile(user)}>
                        <strong>{user}</strong>
                    </Link>
                </td>
            </tr>
        );
    }
}

export default connect((state, ownProps) => {
    const loggedIn = state.user.hasIn(['current', 'username']);
    return {
        ...ownProps,
        loggedIn,
    };
})(UserListRow);
