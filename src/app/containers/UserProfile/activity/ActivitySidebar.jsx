import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import RightColumnStub from 'src/app/components/userProfile/common/RightColumnStub';

class ActivitySidebar extends Component {
    render() {
        return <RightColumnStub />;
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => {
    },
    // mapDispatchToProps
    dispatch => ({})
)(ActivitySidebar);
