/**
 * Renders the Yotifications settings panel.
 */

import React from 'react';
import {connect} from 'react-redux'
import tt from 'counterpart';
import { toggleNotificationGroups, toggleNotificationGroupNames } from 'app/components/elements/notification/type';
import IOSToggle from 'app/components/elements/IOSToggle';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';

const TRANSPORT_WEBSITE = 'website';

class YotificatonSettingsPanel extends React.Component {

    onToggleGroup = (groupName, enabled) => { //eslint-disable-line no-undef
        console.log('onToggleGroup', groupName, enabled); //Todo: for dev only! Do not merge if present!
        this.props.toggleGroup(groupName, enabled);
    }

    render() {
        const toggles = [];
        toggleNotificationGroupNames.forEach( groupName => {
            toggles.push(<li key={groupName}>{tt('settings_jsx.notifications.meta_types.' + groupName)} <IOSToggle
                className="yotification-toggle"
                onChange={(enabled) => this.onToggleGroup(groupName, enabled)}
                checked={this.props.groupSettings[groupName]}
                options={
                    {
                        color: '#474F79', //todo: this should not be here.
                        size: 'small'
                    }
                }
            /></li>);
        })
        return (
            <div className={'YotificationSettingsPanel ' + this.props.className}>
                <h4>{tt('settings_jsx.notifications.title')} <LoadingIndicator type="circle" inline /> </h4>
                <ul>{toggles}</ul>
            </div>
        );
    }
}

export default connect(
    (state, ownProps) => {
        //{ notificationSettings: [ { channelName: 'website', settings: { vote: false, security: true, }, }, { channelName: 'sms', settings: { etc: '...', } } ] }
        return {
            ...ownProps,
            transport: TRANSPORT_WEBSITE,
            groupSettings: toggleNotificationGroupNames.reduce(
                (obj, groupName) => {

                    obj[groupName] = (groupName !== 'wallet') ? true : false;
                    return obj;
                    }, {})
        }
    },
    dispatch => ({
        toggleGroup: (groupName, enabled) => {
            const action = {
                type: 'notifications/SET_NOTIFICATION_TYPES',
                channelName: TRANSPORT_WEBSITE, //this line or the next should be deleted. I suggest this on.
                transport: TRANSPORT_WEBSITE,
                types: toggleNotificationGroups[groupName],
                groupName,
                enabled
            };
            console.log('broadcasting notifications/SET_NOTIFICATION_TYPES', JSON.stringify(action, null, 4)); //Todo: for dev only! Do not merge if present - probably belongs in a different place
            dispatch(action);
        }
    })
)(YotificatonSettingsPanel);
