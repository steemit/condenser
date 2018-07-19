import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { ActivityShow } from 'src/app/components/userProfile';

class ActivityContent extends Component {
    render() {
        const { account } = this.props;

        return <ActivityShow account={account}/>;
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const { accountName } = ownProps.params;
        const account = state.global.getIn(['accounts', accountName]).toJS();
        return { account, ...ownProps };
    },
    // mapDispatchToProps
    dispatch => ({})
)(ActivityContent);
