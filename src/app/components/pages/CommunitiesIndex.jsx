import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import tt from 'counterpart';
import { Map, List } from 'immutable';
import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';
import CommunityList from 'app/components/modules/CommunityList/CommunityList';

export default class CommunitiesIndex extends React.Component {
    componentWillMount = () => {
        this.props.listCommunities(this.props.current_user);
    };

    render() {
        const { communities, communities_idx } = this.props;

        return (
            <div className="CommunitiesIndex row">
                <div className="column">
                    <br />
                    <h4>{tt('g.community_list_header')}</h4>
                    <CommunityList
                        communities={communities}
                        communities_idx={communities_idx}
                    />
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
