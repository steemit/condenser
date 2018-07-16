import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';


import { ActivityShow } from 'src/app/components/userProfile';

class ActivityContent extends Component {
    render() {
        const { profile } = this.props;

      return <ActivityShow profile={profile} onSubmit={this.onSubmit} />;
    }
}

export default connect(
  // mapStateToProps
  (state, ownProps) => {
    
  },
  // mapDispatchToProps
  dispatch => ({

  })
)(ActivityContent);
