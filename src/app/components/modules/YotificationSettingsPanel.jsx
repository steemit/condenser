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

class YotificatonSettingsPanel extends React.Component {

    onToggleGrouping = (grouping, enabled) => { //eslint-disable-line no-undef
        //todo: determine how to cross/map groupings
        console.log('onToggleGrouping', grouping, enabled); //Todo: for dev only! Do not merge if present!
        this.props.toggleGrouping(grouping, enabled);
    }

    render() {
        const toggles = [];
        Object.entries(settingsUIGroupings).forEach( entry => {
            //entry[1] is the list of notification types.
            toggles.push(<li key={entry[0]}>{tt('settings_jsx.notifications.meta_types.' + entry[0])} <IOSToggle
                className="yotification-toggle"
                onChange={(enabled) => this.onToggleGrouping(entry[0], enabled)}
                options={
                    {
                        color: '#474F79',
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
    null,
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
