import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import tt from 'counterpart';
import { Map, List } from 'immutable';
import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';
import SubscribeButton from 'app/components/elements/SubscribeButton';
import { Link } from 'react-router';
import PostsIndexLayout from 'app/components/pages/PostsIndexLayout';

export default class CommunitiesIndex extends React.Component {
    componentWillMount = () => {
        this.props.listCommunities(this.props.username);
    };

    render() {
        const {
            communities,
            communities_idx,
            username,
            walletUrl,
        } = this.props;
        const ordered = communities_idx.map(name => communities.get(name));

        if (communities_idx.length == 0) {
            return (
                <center>
                    <h5>Loading...</h5>
                </center>
            );
        }

        const role = comm =>
            comm.context &&
            comm.context.role != 'guest' && (
                <span className="user_role">{comm.context.role}</span>
            );

        const row = comm => (
            <tr key={comm.name}>
                <th width="600">
                    <Link to={`/trending/${comm.name}`}>{comm.title}</Link>
                    {role(comm)}
                    <br />
                    {comm.about}
                    <small>
                        {comm.subscribers} subscribers &bull; {comm.num_authors}{' '}
                        posters &bull; {comm.num_pending} posts
                    </small>
                </th>
                <td width="40">
                    <SubscribeButton community={comm.name} />
                </td>
            </tr>
        );

        return (
            <PostsIndexLayout
                category={null}
                enableAds={false}
                blogmode={false}
            >
                <div className="CommunitiesIndex c-sidebar__module">
                    {username && (
                        <div style={{ float: 'right' }}>
                            <a href={`${walletUrl}/@${username}/communities`}>
                                Create a Community
                            </a>
                        </div>
                    )}
                    <h4>
                        {/* {<Link to={`/`}>Home</Link>} &gt;{' '} */}
                        {tt('g.community_list_header')}
                    </h4>
                    <hr />
                    <table>
                        <tbody>{ordered.map(comm => row(comm.toJS()))}</tbody>
                    </table>
                </div>
            </PostsIndexLayout>
        );
    }
}

module.exports = {
    path: 'communities(/:username)',
    component: connect(
        state => ({
            walletUrl: state.app.get('walletUrl'),
            username: state.user.getIn(['current', 'username']),
            communities: state.global.get('community', Map()),
            communities_idx: state.global.get('community_idx', List()),
        }),
        dispatch => {
            return {
                listCommunities: observer =>
                    dispatch(
                        fetchDataSagaActions.listCommunities({ observer })
                    ),
            };
        }
    )(CommunitiesIndex),
};
