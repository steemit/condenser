import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';

class Rewards extends Component {
    componentDidMount() {
        this.props.fetchRewardsData();
    }
    render() {
        const { fetchRewardsData, rewards, loading } = this.props;
        return (
            <div>
                hello
                {loading && 'loading...'}
            </div>
        );
    }
}
module.exports = {
    path: 'rewards',
    component: connect(
        // mapStateToProps
        (state, ownProps) => {
            let rewards = Map({});
            if (state.global.hasIn(['rewards'])) {
                rewards = state.global.getIn(['rewards'], null);
            }
            return {
                rewards: rewards.toJS(),
                loading: state.app.get('loading'),
            };
        },
        // mapDispatchToProps
        dispatch => ({
            fetchRewardsData: payload =>
                dispatch(fetchDataSagaActions.getRewardsData()),
        })
    )(Rewards),
};
