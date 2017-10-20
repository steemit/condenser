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

    componentWillMount = () => { //eslint-disable-line no-undef
        this.props.loadGroups();
    }

    onToggleGroup = (transport, groupName, checked) => { //eslint-disable-line no-undef
        this.props.toggleGroup(transport, groupName, checked);
    }

    render() {
        const {
            isFetching,
            isSaving,
            groups,
            transport
        } = this.props;

        const toggles = [];
        toggleNotificationGroupNames.forEach(groupName => {
            toggles.push(<li key={groupName}>{tt('settings_jsx.notifications.meta_types.' + groupName)} {
                (isFetching || isSaving || (undefined == groups.getIn([transport, 'notification_types', groupName]))) ?
                    <LoadingIndicator type="circle" inline />
                    : <IOSToggle
                        className="yotification-toggle"
                        onClick={(checked) => this.onToggleGroup(this.props.transport, groupName, checked)}
                        checked={groups.getIn([transport, 'notification_types', groupName])}
                        value={groupName}
                    />}
            </li>);
        })

        return (
            <div className={'YotificationSettingsPanel ' + this.props.className}>
                <h4>{tt('settings_jsx.notifications.title')} {(this.props.isSaving)? <LoadingIndicator type="circle" inline style={{float: 'right'}} /> : null}</h4>
                <ul>{toggles}</ul>
            </div>
        );
    }
}

export default connect(
    (state, ownProps) => {
        // todo: handle all channels, not just TRANSPORT_WEBSITE
        return {
            ...ownProps,
            isFetching: state.notificationsettings.isFetching,
            isSaving: state.notificationsettings.isSaving,
            transport: TRANSPORT_WEBSITE,
            groups: state.notificationsettings.groups
        }
    },
    dispatch => ({
        loadGroups: () => {
            dispatch({
                type: 'notificationsettings/FETCH',
            });
        },
        toggleGroup: (transport, group, checked) => { //eslint-disable-line no-unused-vars
            dispatch({
                type: 'notificationsettings/TOGGLE_GROUP',
                transport,
                group
            });
        }
    })
)(YotificatonSettingsPanel);
