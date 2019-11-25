import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';

class Rewards extends Component {
    static propTypes = {
        loading: PropTypes.bool.isRequired,
        fetchRewardsData: PropTypes.func.isRequired,
        rewards: PropTypes.shape({
            total: PropTypes.number,
            blogs: PropTypes.number,
            items: PropTypes.arrayOf(PropTypes.array),
        }).isRequired,
    };
    static defaultProps = {
        loading: true,
    };
    componentDidMount() {
        this.props.fetchRewardsData();
    }
    render() {
        const { rewards, loading } = this.props;
        return (
            <div>
                Rewards:
                <br />
                {loading && 'loading...'}
                {!loading && JSON.stringify(rewards)}
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
