import React from 'react';
import {connect} from 'react-redux';
import CloseButton from 'react-foundation-components/lib/global/close-button';
import Reveal from 'react-foundation-components/lib/global/reveal';
import LoginForm from 'app/components/modules/LoginForm';
import ConfirmTransactionForm from 'app/components/modules/ConfirmTransactionForm';
import Transfer from 'app/components/modules/Transfer';
import SignUp from 'app/components/modules/SignUp';
import Powerdown from 'app/components/modules/Powerdown';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import {NotificationStack} from 'react-notification';
import TermsAgree from 'app/components/modules/TermsAgree';

class Modals extends React.Component {
    static propTypes = {
        show_login_modal: React.PropTypes.bool,
        show_confirm_modal: React.PropTypes.bool,
        show_transfer_modal: React.PropTypes.bool,
        show_powerdown_modal: React.PropTypes.bool,
        show_signup_modal: React.PropTypes.bool,
        show_promote_post_modal: React.PropTypes.bool,
        hideLogin: React.PropTypes.func.isRequired,
        hideConfirm: React.PropTypes.func.isRequired,
        hideSignUp: React.PropTypes.func.isRequired,
        hideTransfer: React.PropTypes.func.isRequired,
        hidePowerdown: React.PropTypes.func.isRequired,
        hidePromotePost: React.PropTypes.func.isRequired,
        notifications: React.PropTypes.object,
        show_terms_modal: React.PropTypes.bool,
        removeNotification: React.PropTypes.func,
    };

    constructor() {
        super();
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'Modals');
    }

    render() {
        const {
            show_login_modal, show_confirm_modal, show_transfer_modal, show_powerdown_modal, show_signup_modal,
            hideLogin, hideTransfer, hidePowerdown, hideConfirm, hideSignUp, show_terms_modal,
            notifications, removeNotification, hidePromotePost, show_promote_post_modal
        } = this.props;

        const notifications_array = notifications ? notifications.toArray().map(n => {
            n.onClick = () => removeNotification(n.key);
            return n;
        }) : [];

        return (
            <div>
                {show_login_modal && <Reveal onHide={hideLogin} show={show_login_modal}>
                    <LoginForm onCancel={hideLogin} />
                </Reveal>}
                {show_confirm_modal && <Reveal onHide={hideConfirm} show={show_confirm_modal}>
                    <CloseButton onClick={hideConfirm} />
                    <ConfirmTransactionForm onCancel={hideConfirm} />
                </Reveal>}
                {show_transfer_modal && <Reveal onHide={hideTransfer} show={show_transfer_modal}>
                    <CloseButton onClick={hideTransfer} />
                    <Transfer />
                </Reveal>}
                {show_powerdown_modal && <Reveal onHide={hidePowerdown} show={show_powerdown_modal}>
                    <CloseButton onClick={hidePowerdown} />
                    <Powerdown />
                </Reveal>}
                {show_signup_modal && <Reveal onHide={hideSignUp} show={show_signup_modal}>
                    <CloseButton onClick={hideSignUp} />
                    <SignUp />
                </Reveal>}
                {show_terms_modal && <Reveal show={show_terms_modal}>
                    <TermsAgree onCancel={hideLogin} />
                </Reveal>}
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
            show_login_modal: state.getIn(['user', 'show_login_modal']),
            show_confirm_modal: state.getIn(['transaction', 'show_confirm_modal']),
            show_transfer_modal: state.getIn(['user', 'show_transfer_modal']),
            show_powerdown_modal: state.getIn(['user', 'show_powerdown_modal']),
            show_promote_post_modal: state.getIn(['user', 'show_promote_post_modal']),
            show_signup_modal: state.getIn(['user', 'show_signup_modal']),
            notifications: state.getIn(['app', 'notifications']),
            show_terms_modal: state.getIn(['user', 'show_terms_modal'])
        }
    },
    dispatch => ({
        hideLogin: e => {
            if (e) e.preventDefault();
            dispatch({type: 'user/HIDE_LOGIN'})
        },
        hideConfirm: e => {
            if (e) e.preventDefault();
            dispatch({type: 'transaction/HIDE_CONFIRM'})
        },
        hideTransfer: e => {
            if (e) e.preventDefault();
            dispatch({type: 'user/HIDE_TRANSFER'})
        },
        hidePowerdown: e => {
            if (e) e.preventDefault();
            dispatch({type: 'user/HIDE_POWERDOWN'})
        },
        hidePromotePost: e => {
            if (e) e.preventDefault();
            dispatch({type: 'user/HIDE_PROMOTE_POST'})
        },
        hideSignUp: e => {
            if (e) e.preventDefault();
            dispatch({type: 'user/HIDE_SIGN_UP'})
        },
        // example: addNotification: ({key, message}) => dispatch({type: 'ADD_NOTIFICATION', payload: {key, message}}),
        removeNotification: (key) => dispatch({type: 'REMOVE_NOTIFICATION', payload: {key}})
    })
)(Modals)
