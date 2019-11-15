import { connect } from 'react-redux';
import React from 'react';
import { Link } from 'react-router';
import * as transactionActions from 'app/redux/TransactionReducer';

class MuteList extends React.Component {
    constructor(props) {
        super();
        this.state = {};
        this.unmute = this.unmute.bind(this);
    }

    unmute(e, target) {
        e.preventDefault();

        if (this.state.busy) return;
        this.setState({ busy: target });
        const done = () => {
            this.setState({ busy: null });
        };

        const { account } = this.props;
        this.props.updateFollow(account, target, null, done);
    }

    render() {
        const { users } = this.props;
        const { busy } = this.state;
        const { unmute } = this;

        const items = users.map(user => (
            <li key={user}>
                <Link to={'/@' + user}>
                    <strong>@{user}</strong>
                </Link>
                &nbsp;&nbsp;&nbsp;&nbsp;
                {busy == user ? (
                    <span>saving....</span>
                ) : (
                    <a href="#" onClick={e => unmute(e, user)}>
                        [unmute]
                    </a>
                )}
            </li>
        ));

        return <ol>{items}</ol>;
    }
}

module.exports = connect(
    (state, props) => ({}),
    dispatch => ({
        updateFollow: (follower, following, type, done) => {
            const what = type ? [type] : [];
            const json = ['follow', { follower, following, what }];
            dispatch(
                transactionActions.broadcastOperation({
                    type: 'custom_json',
                    operation: {
                        id: 'follow',
                        required_posting_auths: [follower],
                        json: JSON.stringify(json),
                    },
                    successCallback: done,
                    errorCallback: done,
                })
            );
        },
    })
)(MuteList);
