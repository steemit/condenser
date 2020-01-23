import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';
import * as globalActions from 'app/redux/GlobalReducer';
import ClaimBox from 'app/components/elements/ClaimBox';
import Callout from 'app/components/elements/Callout';
import tt from 'counterpart';

class SubscriptionsList extends React.Component {
    static propTypes = {
        username: PropTypes.string.isRequired,
        subscriptions: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
        loading: PropTypes.bool,
    };

    static defaultProps = {
        subscriptions: [],
        loading: true,
    };

    constructor() {
        super();
    }

    componentWillMount() {
        const { username, getAccountSubscriptions } = this.props;
        if (username) {
            getAccountSubscriptions(username);
        }
    }

    componentDidUpdate(prevProps) {
        const { username, getAccountSubscriptions } = this.props;
        if (prevProps.username !== username) {
            getAccountSubscriptions(username);
        }
    }

    render() {
        const { subscriptions, loading } = this.props;

        const renderItem = tuple => {
            const [hive, name, role, title] = tuple;
            return (
                <li key={hive}>
                    <Link to={'/trending/' + hive}>{name || hive}</Link>
                    <span className="user_role">{role}</span>
                    {title && <span className="affiliation">{title}</span>}
                </li>
            );
        };

        return (
            <div className="">
                <h4>{tt('g.subscriptions')}</h4>
                {subscriptions &&
                    subscriptions.length > 0 && (
                        <ul>{subscriptions.map(item => renderItem(item))}</ul>
                    )}
                {subscriptions.length === 0 &&
                    !loading && (
                        <Callout>
                            Welcome! You don't have any subscriptions yet.
                        </Callout>
                    )}

                {loading && (
                    <center>
                        <LoadingIndicator
                            style={{ marginBottom: '2rem' }}
                            type="circle"
                        />
                    </center>
                )}
            </div>
        );
    }
}

export default connect(
    (state, props) => {
        const isOwnAccount =
            state.user.getIn(['current', 'username'], '') === props.username;
        const loading = state.global.getIn(['subscriptions', 'loading']);
        const subscriptions = state.global.getIn([
            'subscriptions',
            props.username,
        ]);
        return {
            ...props,
            subscriptions: subscriptions ? subscriptions.toJS() : [],
            isOwnAccount,
            loading,
        };
    },
    dispatch => ({
        getAccountSubscriptions: username => {
            const query = {
                account: username,
            };
            return dispatch(fetchDataSagaActions.getSubscriptions(query));
        },
    })
)(SubscriptionsList);
