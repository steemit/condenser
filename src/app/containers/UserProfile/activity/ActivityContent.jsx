import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { activityContentSelector } from 'src/app/redux/selectors/userProfile/activity';
import { notifyGetHistory } from 'src/app/redux/actions/gate';
import { ActivityShow } from 'src/app/components/userProfile';

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            notifyGetHistory,
        },
        dispatch
    );
}

@connect(
    activityContentSelector,
    mapDispatchToProps
)
export default class ActivityContent extends Component {
    componentDidMount() {
        this.props.notifyGetHistory({
            types: 'all',
            skip: 0,
            limit: 15,
        });
    }

    render() {
        const { notifies, accounts } = this.props;

        return <ActivityShow notifies={notifies} accounts={accounts} />;
    }
}
