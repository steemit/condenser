import React, { Component } from 'react';
import { connect } from 'react-redux';

import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';

import { Home } from './Components';

module.exports = {
  path: ':order(/:category)',
  component: connect(
    (state, ownProps) => {
      return {
        discussions: state.global.get('discussion_idx'),
        status: state.global.get('status'),
        loading: state.app.get('loading'),
        accounts: state.global.get('accounts'),
        username:
          state.user.getIn(['current', 'username']) ||
          state.offchain.get('account'),
        blogmode: state.app.getIn(['user_preferences', 'blogmode']),
        sortOrder: ownProps.params.order,
        topic: ownProps.params.category,
        categories: state.global.getIn(['tag_idx', 'trending']).take(50),
        maybeLoggedIn: state.user.get('maybeLoggedIn'),
        isBrowser: process.env.BROWSER,
      };
    },
    dispatch => {
      return {
        requestData: args => dispatch(fetchDataSagaActions.requestData(args)),
      };
    }
  )(Home),
};
