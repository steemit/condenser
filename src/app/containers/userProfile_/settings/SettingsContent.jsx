import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import user from 'app/redux/User';
import transaction from 'app/redux/Transaction';

import { FORM_ERROR } from 'final-form';
import { pick } from 'ramda';
import tt from 'counterpart';
import o2j from 'shared/clash/object2json';

import { SettingsShow } from 'src/app/components/userProfile';

class SettingsContent extends Component {
    static propTypes = {
        account: PropTypes.object,
        profile: PropTypes.object,
        updateAccount: PropTypes.func,
    };

    onSubmit = values => {
        const { account, metaData, updateAccount, notify } = this.props;

        metaData.profile = pick(
            [
                'profile_image',
                'cover_image',
                'name',
                'about',
                'gender',
                'location',
                'website',
                'social',
            ],
            values
        );

        return new Promise((resolve, reject) => {
            updateAccount({
                json_metadata: JSON.stringify(metaData),
                account: account.name,
                memo_key: account.memo_key,
                errorCallback: e => {
                    if (e === 'Canceled') {
                        resolve();
                    } else {
                        console.log('updateAccount ERROR', e);
                        reject({
                            [FORM_ERROR]: tt('g.server_returned_error'),
                        });
                    }
                },
                successCallback: () => {
                    notify(tt('g.saved'));
                    resolve();
                },
            });
        });
    };

    render() {
        const { profile, account } = this.props;

        return <SettingsShow profile={profile} account={account} onSubmit={this.onSubmit} />;
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const { accountName } = ownProps.params;

        const account = state.global.getIn(['accounts', accountName]).toJS();

        let metaData = account
            ? o2j.ifStringParseJSON(account.json_metadata)
            : {};
        if (typeof metaData === 'string')
            metaData = o2j.ifStringParseJSON(metaData); // issue #1237

        //fix https://github.com/GolosChain/tolstoy/issues/450
        if (
            typeof metaData === 'string' &&
            metaData.localeCompare("{created_at: 'GENESIS'}") == 0
        ) {
            metaData = {};
            metaData.created_at = 'GENESIS';
        }

        const profile = metaData && metaData.profile ? metaData.profile : {};

        return { account, metaData, profile, ...ownProps };
    },
    // mapDispatchToProps
    dispatch => ({
        updateAccount: ({ successCallback, errorCallback, ...operation }) => {
            dispatch(
                transaction.actions.broadcastOperation({
                    type: 'account_metadata',
                    operation,
                    successCallback: () => {
                        dispatch(user.actions.getAccount());
                        successCallback();
                    },
                    errorCallback,
                })
            );
        },
        notify: (message, dismiss = 3000) => {
            dispatch({
                type: 'ADD_NOTIFICATION',
                payload: {
                    key: 'settings_' + Date.now(),
                    message,
                    dismissAfter: dismiss,
                },
            });
        },
    })
)(SettingsContent);
