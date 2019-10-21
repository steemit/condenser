import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import tt from 'counterpart';
import { Map, List } from 'immutable';
import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';
import SubscribeButton from 'app/components/elements/SubscribeButton';
import { Link } from 'react-router';

export default class CommunitiesIndex extends React.Component {
    componentWillMount = () => {
        this.props.listCommunities(this.props.username);
    };

    render() {
        const { communities, communities_idx } = this.props;
        const ordered = communities_idx.map(name => communities.get(name));

        if (communities_idx.length == 0) {
            return (
                <center>
                    <h5>Loading...</h5>
                </center>
            );
        }

        const row = comm => (
            <tr key={comm.name}>
                <th>
                    <Link to={`/trending/${comm.name}`}>{comm.title}</Link>
                    <br />
                    {comm.about}
                </th>
                <td>
                    <SubscribeButton community={comm.name} />
                    <small>{comm.subscribers} subscribers</small>
                </td>
            </tr>
        );

        return (
            <div className="CommunitiesIndex row">
                <h4>{tt('g.community_list_header')}</h4>
                <table>
                    <tbody>{ordered.map(comm => row(comm.toJS()))}</tbody>
                </table>
            </div>
        );
    }
}

module.exports = {
    path: 'communities(/:username)',
    component: connect(
        state => ({
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
