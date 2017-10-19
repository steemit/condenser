/**
 * Renders the Yotifications settings panel.
 */

import React from 'react';
import {connect} from 'react-redux'
import tt from 'counterpart';
import { toggleNotificationGroupNames } from 'app/components/elements/notification/type';
import IOSToggle from 'app/components/elements/IOSToggle';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';

const TRANSPORT_WEBSITE = 'wwwpoll';

class YotificatonSettingsPanel extends React.Component {

    componentWillMount = () => {
        this.props.loadSettings();
    }

    onToggleGroup = (transport, groupName) => { //eslint-disable-line no-undef
        console.log('onToggleGroup', groupName); //Todo: for dev only! Do not merge if present!
        this.props.toggleGroup(transport, groupName);
    }

    render() {
        const { isFetching, settings } = this.props;

        /*if (isFetching || settings.size < 1) {
            return <LoadingIndicator type="circle" inline />
        } */

        // todo: handle all channels, not just TRANSPORT_WEBSITE
        const toggles = [];
        toggleNotificationGroupNames.forEach( groupName => {
            toggles.push(<li key={groupName}>{tt('settings_jsx.notifications.meta_types.' + groupName)} <IOSToggle
                className="yotification-toggle"
                onChange={() => this.onToggleGroup(this.props.transport, groupName)}
                checked={this.props.groupSettings[groupName]}
                options={
                    {
                        size: 'small'
                    }
                }
            /></li>);
        })

        return (
            <div className={'YotificationSettingsPanel ' + this.props.className}>
                <h4>{tt('settings_jsx.notifications.title')} {(this.props.isSaving)? <LoadingIndicator type="circle" inline /> : null}</h4>
                <ul>{toggles}</ul>
            </div>
        );
    }
}

export default connect(
    (state, ownProps) => {
        return {
            ...ownProps,
            isFetching: state.notificationsettings.isFetching,
            transport: TRANSPORT_WEBSITE,
            groupSettings: state.notificationsettings.settings,
        }
    },
    dispatch => ({
        loadSettings: () => {
            dispatch({
                type: 'notificationsettings/FETCH',
            });
        },
        toggleGroup: (transport, group) => {
            dispatch({
                type: 'notificationsettings/TOGGLE_GROUP',
                transport,
                group
            });
        }
    })
)(YotificatonSettingsPanel);
