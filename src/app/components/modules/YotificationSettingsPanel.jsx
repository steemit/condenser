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

    onToggleSetting = (channel, setting) => {
        this.props.toggleSetting(channel, setting);
    }

    render() {
        const { isFetching, settings } = this.props;

        // todo: handle all channels, not just TRANSPORT_WEBSITE
        const toggles = [];
        const channel = TRANSPORT_WEBSITE;
        const types = settings.get(TRANSPORT_WEBSITE).types;
        for (let key in types) {
            toggles.push(<li key={key}>{tt('settings_jsx.notifications.meta_types.' + key)} <IOSToggle
                className="yotification-toggle"
                onChange={enabled => this.onToggleSetting(channel, key)}
                checked={types[key]}
                options={
                    {
                        color: '#474F79', //todo: this should not be here.
                        size: 'small'
                    }
                }
            /></li>);
        };

        return (
            <div className={'YotificationSettingsPanel ' + this.props.className}>
                <h4>{tt('settings_jsx.notifications.title')} {isFetching ? <LoadingIndicator type="circle" inline /> : ''}</h4>
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
            isFetching: state.notificationsettings.isFetching,
            transport: TRANSPORT_WEBSITE,
            settings: state.notificationsettings.settings,
        }
    },
    dispatch => ({
        toggleSetting: (channel, setting) => {
            dispatch({
                type: 'notificationsettings/TOGGLE_SETTING',
                channel,
                setting,
            });
        }
    })
)(YotificatonSettingsPanel);
