import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';

class Rewards extends Component {
    static propTypes = {
        fetchRewardsData: PropTypes.func.isRequired,
    };
    render() {
        const { fetchRewardsData } = this.props;

        return <div>HelloWORLD</div>;
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        let rewards = {};
        if (state.global.hasIn(['rewards'])) {
            rewards = state.global.getIn(['rewards'], null);
        }
        return {
            rewards,
        };
    },
    // mapDispatchToProps
    dispatch => ({
        fetchRewardsData: payload =>
            dispatch(fetchDataSagaActions.getRewardsData()),
    })
)(Rewards);
