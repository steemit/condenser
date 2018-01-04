import { connect } from 'react-redux';
import React from 'react';
import { selectors } from 'app/redux/AppReducer';

import Flag from 'app/components/modules/Flag';

export const mapStateToProps = state => ({
    flags: selectors.getFeatureFlags(state),
});

const connectFlag = (flagName, component) => {
    const FlagComponent = Flag(component);

    const wrapped = flags => <FlagComponent flag={flags[flagName] === true} />;

    return connect(mapStateToProps, null)(wrapped);
};

export default connectFlag;
