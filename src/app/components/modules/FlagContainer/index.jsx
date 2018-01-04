import { connect } from 'react-redux';
import React from 'react';
import { selectors } from 'app/redux/AppReducer';

import Flag from 'app/components/modules/Flag';

export const mapStateToProps = state => ({
    flags: selectors.getFeatureFlags(state),
});

const connectFlag = (flagName, component, fallback = null) => {
    const FlagComponent = Flag(component, fallback);

    const wrapped = flags => <FlagComponent flag={flags.has(flagName) && flags.get(flagName) === true} />;

    return connect(mapStateToProps, null)(wrapped);
};

export default connectFlag;
