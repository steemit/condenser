import React, { Component } from 'react';
import { connect } from 'react-redux';
import { selectors as appSelectors } from 'app/redux/AppReducer';
import Flag from 'app/components/modules/Flag';

const FlagContainer = (flagName, component, fallback = null) => {
    class FlaggedComponent extends Component {
        render() {
            const FlagComponent = Flag(component, fallback);
            return <FlagComponent flag={this.props.flagged} />;
        }
    }

    function mapStateToProps(state) {
        return { flagged: appSelectors.getFeatureFlag(state.app, flagName) };
    }

    return connect(mapStateToProps)(FlaggedComponent);
};

export default FlagContainer;
