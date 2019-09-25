import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import tt from 'counterpart';
import { Map } from 'immutable';
import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';
import CommunityListContainer from 'app/components/modules/CommunityList/CommunityListContainer';

export default class CommunitiesIndex extends React.Component {
    constructor(props) {
        console.log('CommunitiesIndex.jsx::constructor()', props);
        super(props);
        this.state = { username: props.username || '' };
    }

    componentWillMount = () => {
        this.props.listCommunities();
    };

    render() {
        const { communities } = this.props;
        console.log('CommunitiesIndex::render()-communities', communities);

        return (
            <div className="CommunitiesIndex row">
                <div className="column">
                    <br />
                    <h4>{tt('g.community_list_header')}</h4>
                    <CommunityListContainer communities={communities} />
                </div>
            </div>
        );
    }
}

module.exports = {
    path: 'communities(/:username)',
    component: connect(
        state => ({
            user: state.user.getIn(['current']),
            communities: state.global.get('community', Map()),
        }),
        dispatch => {
            return {
                listCommunities: args =>
                    dispatch(fetchDataSagaActions.listCommunities(args)),
            };
        }
    )(CommunitiesIndex),
};
