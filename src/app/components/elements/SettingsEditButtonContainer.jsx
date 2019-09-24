import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import * as transactionActions from 'app/redux/TransactionReducer';
import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';

import SettingsEditButton from './SettingsEditButton';

class SettingsEditButtonContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showDialog: false,
            loading: false,
            settings: this.props.settings,
        };
    }

    onToggleDialog = () => {
        this.setState({ showDialog: !this.state.showDialog });
    };

    onSave = newSettings => {
        const community = this.props.community.get('name');
        this.setState({ loading: true });
        this.props.saveSettings(
            this.props.username,
            community,
            newSettings,
            () => {
                this.setState({ loading: false, settings: newSettings });
                this.props.getCommunity(community);
            },
            () => {
                this.setState({ loading: false });
                this.props.getCommunity(community);
            }
        );
    };

    render() {
        const label = `Settings`;

        return (
            <SettingsEditButton
                {...this.state}
                onSave={this.onSave}
                onToggleDialog={this.onToggleDialog}
                label={label}
            />
        );
    }
}

SettingsEditButtonContainer.propTypes = {
    username: PropTypes.string.isRequired,
    community: PropTypes.object.isRequired, //TODO: Define this shape
    settings: PropTypes.object.isRequired, //TODO: Define this shape
};

export default connect(
    (state, ownProps) => {
        const community = state.global.getIn(
            ['community', ownProps.community],
            {}
        );
        const settings = {
            title: community.get('title'),
            about: community.get('about'),
            is_nsfw: community.get('is_nsfw'),
            description: community.get('description'),
            flag_text: community.get('flag_text', ''),
        };

        return {
            ...ownProps,
            username: state.user.getIn(['current', 'username']),
            community,
            settings,
        };
    },
    dispatch => ({
        saveSettings: (
            account,
            community,
            settings,
            successCallback,
            errorCallback
        ) => {
            const action = 'updateProps';

            const payload = [
                action,
                {
                    community,
                    props: settings,
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
        getCommunity: communityName => {
            return dispatch(fetchDataSagaActions.getCommunity(communityName));
        },
    })
)(SettingsEditButtonContainer);
