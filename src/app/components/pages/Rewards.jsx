import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';

class Rewards extends Component {
    componentDidMount() {
        this.props.fetchRewardsData();
    }
    render() {
        const { fetchRewardsData } = this.props;
        return <div>Hello World</div>;
    }
}
module.exports = {
    path: 'rewards',
    component: connect(
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
    )(Rewards),
};
