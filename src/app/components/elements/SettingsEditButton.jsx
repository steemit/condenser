import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import * as globalActions from 'app/redux/GlobalReducer';
import * as transactionActions from 'app/redux/TransactionReducer';

import Reveal from 'app/components/elements/Reveal';
import CloseButton from 'app/components/elements/CloseButton';
import CommunitySettings from 'app/components/modules/CommunitySettings';

class SettingsEditButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showDialog: false,
            loading: false,
            settings: this.props.settings,
        };
    }

    onToggleDialog = e => {
        if (e) e.preventDefault();
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
            },
            () => {
                this.setState({ loading: false });
            }
        );

        //-- Simulate a "receiveState" action to feed new title into post state
        let newstate = { community: {}, simulation: true };
        newstate['community'][community] = newSettings;
        this.props.pushState(newstate);
    };

    render() {
        const { showDialog, loading, settings } = this.state;

        if (loading) {
            return <span>Saving...</span>;
        }

        return (
            <span>
                <a href="#" onClick={this.onToggleDialog}>
                    {this.props.children}
                </a>
                {showDialog && (
                    <Reveal onHide={() => null} show>
                        <CloseButton onClick={() => this.onToggleDialog()} />
                        <CommunitySettings
                            {...settings}
                            onSubmit={newSettings => {
                                this.onToggleDialog();
                                this.onSave(newSettings);
                            }}
                        />
                    </Reveal>
                )}
            </span>
        );
    }
}

SettingsEditButton.propTypes = {
    username: PropTypes.string,
    community: PropTypes.object.isRequired, //TODO: Define this shape
    settings: PropTypes.object.isRequired, //TODO: Define this shape
};

SettingsEditButton.defaultProps = {
    username: undefined,
};

export default connect(
    (state, ownProps) => {
        const community = state.global.getIn(
            ['community', ownProps.community],
            {}
        );
        const communityImages = {
            avatar_url: community.getIn(['settings', 'avatar_url']),
            cover_url: community.getIn(['settings', 'cover_url']),
        };
        const settings = {
            title: community.get('title'),
            about: community.get('about'),
            settings: communityImages,
            is_nsfw: community.get('is_nsfw'),
            lang: community.get('lang'),
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
        pushState: state => {
            dispatch(globalActions.receiveState(state));
        },
    })
)(SettingsEditButton);
