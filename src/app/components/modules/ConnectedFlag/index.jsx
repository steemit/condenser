import React, { Component } from 'react';
import { connect } from 'react-redux';
import { selectors as appSelectors } from 'app/redux/AppReducer';
import Flag from 'app/components/modules/Flag';

const mapStateToProps = (state, ownProps) => {
    return {
        flagged: appSelectors.getFeatureFlag(state.app, ownProps.flag),
        ...ownProps,
    };
};

const ConnectedFlag = connect(mapStateToProps)(Flag);

export default ConnectedFlag;
