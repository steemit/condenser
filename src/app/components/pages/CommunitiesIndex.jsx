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
        this.props.listCommunities(this.props.current_user);
    };

    render() {
        const { communities, communities_idx } = this.props;

        if (communities.length == 0) {
            return (
                <center>
                    <h5>
                        Loading<br />
                        <small>It's worth the wait. ;)</small>
                    </h5>
                </center>
            );
        }

        const comm = comm => (
            <tr key={comm.get('name')}>
                <th>
                    <Link to={`/trending/${comm.get(name)}`}>
                        {comm.get('title')}
                    </Link>
                    <br />
                    <small>{comm.get('subscribers')} subscribers</small>
                </th>
                <td>{comm.get('about')}</td>
                <td>
                    <SubscribeButton community={comm.get('name')} />
                </td>
            </tr>
        );

        const list = communities_idx.map(name => comm(communities.get(name)));

        return (
            <div className="CommunitiesIndex row">
                <h4>{tt('g.community_list_header')}</h4>
                <table>{list}</table>
            </div>
        );
    }
}

module.exports = {
    path: 'communities(/:username)',
    component: connect(
        state => ({
            current_user: state.user.getIn(['current', 'username']),
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
