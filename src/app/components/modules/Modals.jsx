/* eslint-disable react/style-prop-object */
/* eslint-disable arrow-parens */
/* eslint-disable no-undef */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable no-unused-vars */
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
import PostDrafts from './PostDrafts';
import PostTemplates from './PostTemplates';

class Modals extends React.Component {
    static propTypes = {
        show_login_modal: PropTypes.bool,
        show_confirm_modal: PropTypes.bool,
        show_bandwidth_error_modal: PropTypes.bool,
        show_promote_post_modal: PropTypes.bool,
        show_post_advanced_settings_modal: PropTypes.string,
        show_post_drafts_modal: PropTypes.string,
        on_post_drafts_close_modal: PropTypes.func,
        clear_draft_modal: PropTypes.func,
        show_post_templates_modal: PropTypes.string,
        on_post_templates_close_modal: PropTypes.func,
        hideLogin: PropTypes.func.isRequired,
        username: PropTypes.string,
        hideConfirm: PropTypes.func.isRequired,
        hidePromotePost: PropTypes.func.isRequired,
        hideBandwidthError: PropTypes.func.isRequired,
        hidePostAdvancedSettings: PropTypes.func.isRequired,
        hidePostDrafts: PropTypes.func.isRequired,
        hidePostTemplates: PropTypes.func.isRequired,
        notifications: PropTypes.object,
        show_terms_modal: PropTypes.bool,
        removeNotification: PropTypes.func,
        loginBroadcastOperation: PropTypes.shape({
            type: PropTypes.string,
            username: PropTypes.string,
            successCallback: PropTypes.func,
            errorCallback: PropTypes.func,
        }),
        loading: PropTypes.bool,
    };

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
        show_post_drafts_modal: '',
        on_post_drafts_close_modal: () => {},
        clear_draft_modal: () => {},
        show_post_templates_modal: '',
        on_post_templates_close_modal: () => {},
        loginBroadcastOperation: undefined,
        loading: false,
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
            show_post_drafts_modal,
            on_post_drafts_close_modal,
            clear_draft_modal,
            show_post_templates_modal,
            on_post_templates_close_modal,
            hideLogin,
            hideConfirm,
            show_terms_modal,
            notifications,
            removeNotification,
            hidePromotePost,
            show_promote_post_modal,
            hideBandwidthError,
            hidePostAdvancedSettings,
            hidePostDrafts,
            hidePostTemplates,
            username,
            loginBroadcastOperation,
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
            new_window.location = 'https://poloniex.com/exchange#trx_steem';
        };
        return (
            <div>
                {show_login_modal && (
                    <Reveal
                        onHide={() => {
                            hideLogin();
                        }}
                        show={show_login_modal}
                    >
                        <CloseButton onClick={() => hideLogin()} />
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
                                    {tt('modals_jsx.out_of_bandwidth_option_4')}
                                </li>
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
                {show_post_drafts_modal && (
                    <Reveal
                        onHide={hidePostDrafts}
                        show={show_post_drafts_modal ? true : false}
                    >
                        <CloseButton onClick={hidePostDrafts} />
                        <PostDrafts
                            formId={show_post_drafts_modal}
                            onDraftsClose={on_post_drafts_close_modal}
                            clearDraft={clear_draft_modal}
                        />
                    </Reveal>
                )}
                {show_post_templates_modal && (
                    <Reveal
                        onHide={hidePostTemplates}
                        show={show_post_templates_modal ? true : false}
                    >
                        <CloseButton onClick={hidePostTemplates} />
                        <PostTemplates
                            formId={show_post_templates_modal}
                            onTemplatesClose={on_post_templates_close_modal}
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
        const rcErr = state.transaction.getIn(['errors', 'bandwidthError']);
        // get the onErrorCB and call it on cancel
        const show_login_modal = state.user.get('show_login_modal');
        let loginBroadcastOperation = {};
        if (
            show_login_modal &&
            state.user &&
            state.user.getIn(['loginBroadcastOperation'])
        ) {
            loginBroadcastOperation = state.user
                .getIn(['loginBroadcastOperation'])
                .toJS();
        }

        return {
            username: state.user.getIn(['current', 'username']),
            show_login_modal,
            show_confirm_modal: state.transaction.get('show_confirm_modal'),
            show_promote_post_modal: state.user.get('show_promote_post_modal'),
            notifications: state.app.get('notifications'),
            show_terms_modal:
                state.user.get('show_terms_modal') &&
                state.routing.locationBeforeTransitions.pathname !==
                    '/tos.html' &&
                state.routing.locationBeforeTransitions.pathname !==
                    '/privacy.html',
            show_bandwidth_error_modal: rcErr,
            show_post_advanced_settings_modal: state.user.get(
                'show_post_advanced_settings_modal'
            ),
            show_post_drafts_modal: state.user.get('show_post_drafts_modal'),
            on_post_drafts_close_modal: state.user.get(
                'on_post_drafts_close_modal'
            ),
            clear_draft_modal: state.user.get('clear_draft_modal'),
            show_post_templates_modal: state.user.get(
                'show_post_templates_modal'
            ),
            on_post_templates_close_modal: state.user.get(
                'on_post_templates_close_modal'
            ),
            loginBroadcastOperation,
            loading: state.app.get('modalLoading'),
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
        hidePostDrafts: e => {
            if (e) e.preventDefault();
            dispatch(userActions.hidePostDrafts());
        },
        hidePostTemplates: e => {
            if (e) e.preventDefault();
            dispatch(userActions.hidePostTemplates());
        },
        // example: addNotification: ({key, message}) => dispatch({type: 'ADD_NOTIFICATION', payload: {key, message}}),
        removeNotification: key =>
            dispatch(appActions.removeNotification({ key })),
    })
)(Modals);
