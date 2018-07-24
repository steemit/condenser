import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ActivityCardSettings from 'src/app/components/userProfile/activity/ActivityCardSettings';
import RightColumnStub from 'src/app/components/userProfile/common/RightColumnStub';

class ActivitySidebar extends Component {
    render() {
        return (
            <Fragment>
                <ActivityCardSettings />
            </Fragment>
        );
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => {},
    // mapDispatchToProps
    dispatch => ({})
)(ActivitySidebar);
