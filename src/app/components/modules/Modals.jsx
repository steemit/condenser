import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import CloseButton from 'app/components/elements/CloseButton';
import Reveal from 'app/components/elements/Reveal';
import { NotificationStack } from 'react-notification';
import { OrderedSet } from 'immutable';
import tt from 'counterpart';
import * as userActions from 'app/redux/UserReducer';
import * as appActions from 'app/redux/AppReducer';
import * as transactionActions from 'app/redux/TransactionReducer';
import LoginForm from 'app/components/modules/LoginForm';
import ConfirmTransactionForm from 'app/components/modules/ConfirmTransactionForm';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import TermsAgree from 'app/components/modules/TermsAgree';
import PostAdvancedSettings from 'app/components/modules/PostAdvancedSettings';

class Modals extends React.Component {
    static defaultProps = {
        username: '',
        notifications: undefined,
        removeNotification: () => {},
        show_terms_modal: false,
        show_promote_post_modal: false,
        show_bandwidth_error_modal: false,
        show_confirm_modal: false,
        show_login_modal: false,
        show_post_advanced_settings_modal: '',
    };
    static propTypes = {
        show_login_modal: PropTypes.bool,
        show_confirm_modal: PropTypes.bool,
        show_bandwidth_error_modal: PropTypes.bool,
        show_promote_post_modal: PropTypes.bool,
        show_post_advanced_settings_modal: PropTypes.string,
        hideLogin: PropTypes.func.isRequired,
        username: PropTypes.string,
        hideConfirm: PropTypes.func.isRequired,
        hidePromotePost: PropTypes.func.isRequired,
        hideBandwidthError: PropTypes.func.isRequired,
        hidePostAdvancedSettings: PropTypes.func.isRequired,
        notifications: PropTypes.object,
        show_terms_modal: PropTypes.bool,
        removeNotification: PropTypes.func,
    };

    constructor() {
        super();
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'Modals');
    }

    render() {
        const {
            show_login_modal,
            show_confirm_modal,
            show_bandwidth_error_modal,
            show_post_advanced_settings_modal,
            hideLogin,
            hideConfirm,
            show_terms_modal,
            notifications,
            removeNotification,
            hidePromotePost,
            show_promote_post_modal,
            hideBandwidthError,
            hidePostAdvancedSettings,
            username,
        } = this.props;

        const notifications_array = notifications
            ? notifications.toArray().map(n => {
                  n.onClick = () => removeNotification(n.key);
                  return n;
              })
            : [];

        const buySteemPower = e => {
            if (e && e.preventDefault) e.preventDefault();
            const new_window = window.open();
            new_window.opener = null;
            new_window.location =
                'https://blocktrades.us/?input_coin_type=eth&output_coin_type=steem_power&receive_address=' +
                username;
        };

        return (
            <div>
                {show_login_modal && (
                    <Reveal onHide={hideLogin} show={show_login_modal}>
                        <LoginForm onCancel={hideLogin} />
                    </Reveal>
                )}
                {show_confirm_modal && (
                    <Reveal onHide={hideConfirm} show={show_confirm_modal}>
                        <CloseButton onClick={hideConfirm} />
                        <ConfirmTransactionForm onCancel={hideConfirm} />
                    </Reveal>
                )}
                {show_terms_modal && (
                    <Reveal show={show_terms_modal}>
                        <TermsAgree onCancel={hideLogin} />
                    </Reveal>
                )}
                {show_bandwidth_error_modal && (
                    <Reveal
                        onHide={hideBandwidthError}
                        show={show_bandwidth_error_modal}
                    >
                        <div>
                            <CloseButton onClick={hideBandwidthError} />
                            <h4>{tt('modals_jsx.your_transaction_failed')}</h4>
                            <hr />
                            <h5>{tt('modals_jsx.out_of_bandwidth_title')}</h5>
                            <p>{tt('modals_jsx.out_of_bandwidth_reason')}</p>
                            <p>{tt('modals_jsx.out_of_bandwidth_reason_2')}</p>
                            <p>
                                {tt('modals_jsx.out_of_bandwidth_option_title')}
                            </p>
                            <ol>
                                <li>
                                    {tt('modals_jsx.out_of_bandwidth_option_1')}
                                </li>
                                <li>
                                    {tt('modals_jsx.out_of_bandwidth_option_2')}
                                </li>
                                <li>
                                    {tt('modals_jsx.out_of_bandwidth_option_3')}
                                </li>
                            </ol>
                            <button className="button" onClick={buySteemPower}>
                                {tt('g.buy_steem_power')}
                            </button>
                        </div>
                    </Reveal>
                )}
                {show_post_advanced_settings_modal && (
                    <Reveal
                        onHide={hidePostAdvancedSettings}
                        show={show_post_advanced_settings_modal ? true : false}
                    >
                        <CloseButton onClick={hidePostAdvancedSettings} />
                        <PostAdvancedSettings
                            formId={show_post_advanced_settings_modal}
                        />
                    </Reveal>
                )}
                <NotificationStack
                    style={false}
                    notifications={notifications_array}
                    onDismiss={n => removeNotification(n.key)}
                />
            </div>
        );
    }
}

export default connect(
    state => {
        return {
            username: state.user.getIn(['current', 'username']),
            show_login_modal: state.user.get('show_login_modal'),
            show_confirm_modal: state.transaction.get('show_confirm_modal'),
            show_promote_post_modal: state.user.get('show_promote_post_modal'),
            notifications: state.app.get('notifications'),
            show_terms_modal:
                state.user.get('show_terms_modal') &&
                state.routing.locationBeforeTransitions.pathname !==
                    '/tos.html' &&
                state.routing.locationBeforeTransitions.pathname !==
                    '/privacy.html',
            show_bandwidth_error_modal: state.transaction.getIn([
                'errors',
                'bandwidthError',
            ]),
            show_post_advanced_settings_modal: state.user.get(
                'show_post_advanced_settings_modal'
            ),
        };
    },
    dispatch => ({
        hideLogin: e => {
            if (e) e.preventDefault();
            dispatch(userActions.hideLogin());
        },
        hideConfirm: e => {
            if (e) e.preventDefault();
            dispatch(transactionActions.hideConfirm());
        },
        hidePromotePost: e => {
            if (e) e.preventDefault();
            dispatch(userActions.hidePromotePost());
        },
        hideBandwidthError: e => {
            if (e) e.preventDefault();
            dispatch(
                transactionActions.dismissError({ key: 'bandwidthError' })
            );
        },
        hidePostAdvancedSettings: e => {
            if (e) e.preventDefault();
            dispatch(userActions.hidePostAdvancedSettings());
        },
        // example: addNotification: ({key, message}) => dispatch({type: 'ADD_NOTIFICATION', payload: {key, message}}),
        removeNotification: key =>
            dispatch(appActions.removeNotification({ key })),
    })
)(Modals);
