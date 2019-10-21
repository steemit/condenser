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
            <div className="communities__row">
                <div className="communities__names">
                    <Link to={`/trending/${comm.get(name)}`}>
                        {comm.get('title')}
                    </Link>
                </div>
                <div className="communities__description">
                    {comm.get('about')}
                    <br />
                    {comm.get('subscribers')} subscribers
                </div>
                <div className="communities__subscription">
                    <SubscribeButton community={comm.get('name')} />
                </div>
            </div>
        );

        const list = (
            <div className="CommunitiesList">
                <div className="communities__header">
                    <div className="communities__names">Community Name</div>
                    <div className="communities__description">Description</div>
                    <div className="communities__subscription">Subscribe</div>
                </div>
                {communities_idx.map(name => comm(communities.get(name)))}
            </div>
        );

        return (
            <div className="CommunitiesIndex row">
                <div className="column">
                    <br />
                    <h4>{tt('g.community_list_header')}</h4>
                    {list}
                </div>
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
