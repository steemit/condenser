import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';

import user from 'app/redux/User';
import transaction from 'app/redux/Transaction';

import { FORM_ERROR } from 'final-form';
import { pick } from 'ramda';
import tt from 'counterpart';

import { settingsContentSelector } from 'src/app/redux/selectors/userProfile/settings';
import { getSettingsOptions, setSettingsOptions } from 'src/app/redux/actions/settings';

import { SettingsShow } from 'src/app/components/userProfile';

@connect(
    settingsContentSelector,
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
        getSettingsOptions: () => dispatch(getSettingsOptions()),
        setSettingsOptions: (values) => dispatch(setSettingsOptions(values)),
    })
)
export default class SettingsContent extends PureComponent {
    static propTypes = {
        account: PropTypes.object,
        profile: PropTypes.object,
        options: PropTypes.instanceOf(Map),
        updateAccount: PropTypes.func,

        getSettingsOptions: PropTypes.func,
    };

    componentDidMount() {
        this.props.getSettingsOptions();
    }

    onSubmitBlockchain = values => {
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

    onSubmitGate = values => this.props.setSettingsOptions(values);

    render() {
        const { profile, account, options, isChanging } = this.props;

        console.log(56, options.toJS());

        return (
            <SettingsShow
                profile={profile}
                account={account}

                options={options}
                isChanging={isChanging}
                
                onSubmitBlockchain={this.onSubmitBlockchain}
                onSubmitGate={this.onSubmitGate}
            />
        );
    }
}
