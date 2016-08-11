import React from 'react';
import { Link } from 'react-router';
import Follow from 'app/components/elements/Follow';

class UserListRow extends React.Component {
    render() {
        const {user, account} = this.props
        return(
            <tr>
                <td width="250">
                    <Follow follower={account.name} following={user} what="blog" />
                </td>
                <td>
                    <Link to={'/@' + user}><strong>{user}</strong></Link>
                </td>
            </tr>
        );
    }
}

export default UserListRow
