/**
 * Renders the Yotifications settings panel.
 */

import React from 'react';
import {connect} from 'react-redux'
import tt from 'counterpart';
import { settingsUIGroupings } from 'app/components/elements/notification/type';
import IOSToggle from 'app/components/elements/IOSToggle';

class YotificatonSettingsPanel extends React.Component {

    onToggleGrouping = (grouping, enabled) => { //eslint-disable-line no-undef
        //todo: determine how to cross/map groupings
        console.log('onToggleGrouping', grouping, enabled); //Todo: for dev only! Do not merge if present!
    }

    render() {
        const toggles = [];
        Object.entries(settingsUIGroupings).forEach( entry => {
            //entry[1] is the list of notification types.
            toggles.push(<li key={entry[0]}>{tt('settings_jsx.notifications.meta_types.' + entry[0])} <IOSToggle
                className="switch-class"
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
            <div className={this.props.className}>
                <h4>{tt('settings_jsx.notifications.title')}</h4>
                {toggles}
            </div>
        );
    }
}

export default connect(null, null
)(YotificatonSettingsPanel);
