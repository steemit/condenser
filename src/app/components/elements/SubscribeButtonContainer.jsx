import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import * as transactionActions from 'app/redux/TransactionReducer';

import SubscribeButton from './SubscribeButton';

class SubscribeButtonContainer extends React.Component {
    constructor(props) {
        super(props);
        const { subscribed } = this.props;
        this.state = {
            loading: false,
            subscribed,
        };
    }

    componentWillUpdate(nextProps) {
        if (nextProps && nextProps.subscribed != this.state.subscribed) {
            this.setState({ subscribed: nextProps.subscribed });
        }
    }

    onClick = () => {
        const { subscribed } = this.state;
        const community = this.props.community.get('name');

        this.setState({ loading: true });
        this.props.toggleSubscribe(
            !subscribed,
            community,
            this.props.username,
            () => {
                this.setState({ subscribed: !subscribed, loading: false });
            },
            () => {
                this.setState({ subscribed, loading: false });
            }
        );
    };

    render() {
        const { subscribed } = this.state;

        let label = `Subscribe`;
        if (subscribed) {
            label = `Unsubscribe`;
        }

        return (
            <SubscribeButton
                {...this.state}
                onClick={this.onClick}
                label={label}
            />
        );
    }
}

SubscribeButtonContainer.propTypes = {
    username: PropTypes.string.isRequired,
    subscribed: PropTypes.bool.isRequired,
    community: PropTypes.object.isRequired, //TODO: Define this shape
};

export default connect(
    (state, ownProps) => {
        return {
            ...ownProps,
            username: state.user.getIn(['current', 'username']),
            subscribed: state.global.getIn(
                ['community', ownProps.community, 'context', 'subscribed'],
                false
            ),
            community: state.global.getIn(
                ['community', ownProps.community],
                {}
            ),
        };
    },
    dispatch => ({
        toggleSubscribe: (
            subscribeToCommunity,
            community,
            account,
            successCallback,
            errorCallback
        ) => {
            let action = 'unsubscribe';
            if (subscribeToCommunity) action = 'subscribe';

            const payload = [
                action,
                {
                    community,
                },
            ];

            return dispatch(
                transactionActions.broadcastOperation({
                    type: 'custom_json',
                    operation: {
                        id: 'community',
                        required_posting_auths: [account],
                        json: JSON.stringify(payload),
                    },
                    successCallback,
                    errorCallback,
                })
            );
        },
    })
)(SubscribeButtonContainer);
