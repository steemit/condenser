import { connect } from 'react-redux';
import React from 'react';
import {
    selectors,
} from 'app/redux/AppReducer';

import Flag from 'app/components/modules/Flag';

const connectFlag = (flagName, component) => {
    const FlagComponent = Flag(component);
    // If flags is a Map
    const wrapped = flags => <FlagComponent flag={flags.find(flag => flag.get(flagName) === true )} />
    // If flags is an object
    //const wrapped = flags => <FlagComponent flag={Object.keys(flags).find(flag => flags[flag] === true)}
    return connect(mapStateToProps, null)(wrapped);
}

export default connectFlag;
