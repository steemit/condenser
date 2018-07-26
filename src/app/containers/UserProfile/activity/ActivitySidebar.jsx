import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ActivityCardSettings from 'src/app/components/userProfile/activity/ActivityCardSettings';

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
