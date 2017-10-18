/**
 * Renders the Yotifications settings panel.
 */

import React from 'react';
import {connect} from 'react-redux'
import tt from 'counterpart';
import { settingsUIGroupings } from 'app/components/elements/notification/type';
import IOSToggle from 'app/components/elements/IOSToggle';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';

const TRANSPORT_WEBSITE = 'website';
const groupingList = Object.entries(settingsUIGroupings).reduce( (list, entry) => {
        list.push(entry[0]);
        return list;
    }, []);

class YotificatonSettingsPanel extends React.Component {

    onToggleGrouping = (grouping, enabled) => { //eslint-disable-line no-undef
        //todo: determine how to cross/map groupings
        console.log('onToggleGrouping', grouping, enabled); //Todo: for dev only! Do not merge if present!
        this.props.toggleGrouping(grouping, enabled);
    }

    render() {
        const toggles = [];
        groupingList.forEach( grouping => {
            toggles.push(<li key={grouping}>{tt('settings_jsx.notifications.meta_types.' + grouping)} <IOSToggle
                className="yotification-toggle"
                onChange={(enabled) => this.onToggleGrouping(grouping, enabled)}
                checked={this.props.groupingSettings[grouping]}
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
            groupingSettings: groupingList.reduce(
                (obj, grouping) => {

                    obj[grouping] = (grouping !== 'wallet') ? true : false;
                    return obj;
                    }, {})
        }
    },
    dispatch => ({
        toggleGrouping: (grouping, enabled) => {
            const action = {
                type: 'notifications/SET_NOTIFICATION_TYPES',
                channelName: TRANSPORT_WEBSITE, //this line or the next should be deleted. I suggest this on.
                transport: TRANSPORT_WEBSITE,
                types: settingsUIGroupings[grouping],
                grouping,
                enabled
            };
            console.log('broadcasting notifications/SET_NOTIFICATION_TYPES', JSON.stringify(action, null, 4)); //Todo: for dev only! Do not merge if present - probably belongs in a different place
            dispatch(action);
        }
    })
)(YotificatonSettingsPanel);
