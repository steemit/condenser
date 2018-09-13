import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map } from 'immutable';

import { PrivateKey } from 'golos-js/lib/auth/ecc';

import user from 'app/redux/User';
import transaction from 'app/redux/Transaction';
import g from 'app/redux/GlobalReducer';

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
        changePassword: ({ accountName, password, newWif, successCallback, errorCallback }) => {
            const ph = role => PrivateKey.fromSeed(`${accountName}${role}${newWif}`).toWif();
            dispatch(
                transaction.actions.updateAuthorities({
                    accountName,
                    auths: [
                        { authType: 'owner', oldAuth: password, newAuth: ph('owner', newWif) },
                        { authType: 'active', oldAuth: password, newAuth: ph('active', newWif) },
                        { authType: 'posting', oldAuth: password, newAuth: ph('posting', newWif) },
                        { authType: 'memo', oldAuth: password, newAuth: ph('memo', newWif) },
                    ],
                    onSuccess: successCallback,
                    onError: errorCallback,
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
        setSettingsOptions: values => dispatch(setSettingsOptions(values)),
        showLogin: ({ username, authType }) => {
            dispatch(user.actions.showLogin({ loginDefault: { username, authType } }));
        },
        showQRKey: ({ type, isPrivate, text }) => {
            dispatch(g.actions.showDialog({ name: 'qr_key', params: { type, isPrivate, text } }));
        },
    })
)
export default class SettingsContent extends PureComponent {
    static propTypes = {
        account: PropTypes.object,
        profile: PropTypes.object,

        privateKeys: PropTypes.instanceOf(Map),
        options: PropTypes.instanceOf(Map),
        isFetching: PropTypes.bool,
        isChanging: PropTypes.bool,
        updateAccount: PropTypes.func,

        changePassword: PropTypes.func,

        getSettingsOptions: PropTypes.func,
        showLogin: PropTypes.func,
        showQRKey: PropTypes.func,
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
                account: account.get('name'),
                memo_key: account.get('memo_key'),
                successCallback: () => {
                    notify(tt('g.saved'));
                    resolve();
                },
                errorCallback: e => {
                    if (e === 'Canceled') {
                        resolve();
                    } else {
                        console.log('updateAccount ERROR:', e);
                        reject({
                            [FORM_ERROR]: e,
                        });
                    }
                },
            });
        });
    };

    onSubmitGate = values => {
        const { setSettingsOptions, notify } = this.props;
        return new Promise((resolve, reject) => {
            setSettingsOptions({
                ...values,
                successCallback: () => {
                    notify(tt('g.saved'));
                    resolve();
                },
                errorCallback: e => {
                    if (e === 'Canceled') {
                        resolve();
                    } else {
                        console.log('setSettingsOptions ERROR:', e);
                        reject({
                            [FORM_ERROR]: e,
                        });
                    }
                },
            });
        });
    };

    onSubmitChangePassword = values => {
        const { changePassword, notify } = this.props;

        return new Promise((resolve, reject) => {
            changePassword({
                accountName: values.username,
                password: values.password,
                newWif: values.newWif,
                successCallback: () => {
                    notify('Password Updated');
                    window.location = `/login.html#account=${values.username}&msg=passwordupdated`;
                    resolve();
                },
                errorCallback: e => {
                    if (e === 'Canceled') {
                        resolve();
                    } else {
                        console.log('changePassword ERROR:', e);
                        reject({
                            [FORM_ERROR]: e,
                        });
                    }
                },
            });
        });
    };

    render() {
        const {
            profile,
            account,
            options,
            privateKeys,
            isFetching,
            isChanging,
            showLogin,
            showQRKey,
        } = this.props;

        return (
            <SettingsShow
                profile={profile}
                account={account}
                privateKeys={privateKeys}
                options={options}
                isFetching={isFetching}
                isChanging={isChanging}
                onSubmitBlockchain={this.onSubmitBlockchain}
                onSubmitGate={this.onSubmitGate}
                onSubmitChangePassword={this.onSubmitChangePassword}
                showLogin={showLogin}
                showQRKey={showQRKey}
            />
        );
    }
}
