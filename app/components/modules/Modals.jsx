import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import CloseButton from 'react-foundation-components/lib/global/close-button';
import Reveal from 'react-foundation-components/lib/global/reveal';
import LoginForm from 'app/components/modules/LoginForm';
import ConfirmTransactionForm from 'app/components/modules/ConfirmTransactionForm';
import Transfer from 'app/components/modules/Transfer';
import user from 'app/redux/User';
import tr from 'app/redux/Transaction';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import Powerdown from 'app/components/modules/Powerdown';
import MessageBox from 'app/components/modules/Messages';

class Modals extends React.Component {
    static propTypes = {
        show_login_modal: PropTypes.bool,
        show_confirm_modal: PropTypes.bool,
        show_transfer_modal: PropTypes.bool,
        show_powerdown_modal: PropTypes.bool,
        show_promote_post_modal: PropTypes.bool,
        hideLogin: PropTypes.func.isRequired,
        hideConfirm: PropTypes.func.isRequired,
        hideTransfer: PropTypes.func.isRequired,
        hidePowerdown: PropTypes.func.isRequired,
        hidePromotePost: PropTypes.func.isRequired,
        show_messages_modal: PropTypes.bool,
        hideMessages: PropTypes.func.isRequired,
    };

    constructor() {
        super();
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'Modals');
    }

    render() {
        const {
            show_login_modal,
            show_confirm_modal,
            show_transfer_modal,
            show_powerdown_modal,
            hideLogin,
            hideTransfer,
            hidePowerdown,
            hideConfirm,
            show_messages_modal,
            hideMessages,
        } = this.props;

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
                {show_transfer_modal && (
                    <Reveal onHide={hideTransfer} show={show_transfer_modal}>
                        <CloseButton onClick={hideTransfer} />
                        <Transfer />
                    </Reveal>
                )}
                {show_powerdown_modal && (
                    <Reveal onHide={hidePowerdown} show={show_powerdown_modal}>
                        <CloseButton onClick={hidePowerdown} />
                        <Powerdown />
                    </Reveal>
                )}
                {show_messages_modal && (
                    <Reveal
                        onHide={hideMessages}
                        show={show_messages_modal}
                        size="large"
                        revealClassName="MessagesBox"
                    >
                        <CloseButton onClick={hideMessages} />
                        <MessageBox />
                    </Reveal>
                )}
            </div>
        );
    }
}

export default connect(
    state => {
        return {
            show_login_modal: state.user.get('show_login_modal'),
            show_confirm_modal: state.transaction.get('show_confirm_modal'),
            show_transfer_modal: state.user.get('show_transfer_modal'),
            show_promote_post_modal: state.user.get('show_promote_post_modal'),
            show_powerdown_modal: state.user.get('show_powerdown_modal'),
            show_messages_modal: state.user.get('show_messages_modal'),
        };
    },
    dispatch => ({
        hideLogin: e => {
            if (e) e.preventDefault();
            dispatch(user.actions.hideLogin());
        },
        hideConfirm: e => {
            if (e) e.preventDefault();
            dispatch(tr.actions.hideConfirm());
        },
        hideTransfer: e => {
            if (e) e.preventDefault();
            dispatch(user.actions.hideTransfer());
        },
        hidePowerdown: e => {
            if (e) e.preventDefault();
            dispatch(user.actions.hidePowerdown());
        },
        hidePromotePost: e => {
            if (e) e.preventDefault();
            dispatch(user.actions.hidePromotePost());
        },
        hideMessages: e => {
            if (e) e.preventDefault();
            dispatch(user.actions.hideMessages());
        },
    })
)(Modals);
