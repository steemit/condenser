import React, { PropTypes, Component } from 'react';
import {connect} from 'react-redux'
import transaction from 'app/redux/Transaction'
import {findParent} from 'app/utils/DomUtils';
import { translate } from 'app/Translator';

class ConfirmTransactionForm extends Component {

    static propTypes = {
        //Steemit
        onCancel: PropTypes.func,
        warning: PropTypes.string,
        // redux-form
        confirm: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        confirmBroadcastOperation: PropTypes.object,
        confirmErrorCallback: PropTypes.func,
        okClick: PropTypes.func,
    };
    componentDidMount() {
        document.body.addEventListener('click', this.closeOnOutsideClick);
    }
    componentWillUnmount() {
        document.body.removeEventListener('click', this.closeOnOutsideClick);
    }
    closeOnOutsideClick = (e) =>  {
        const inside_dialog = findParent(e.target, 'ConfirmTransactionForm');
        if (!inside_dialog) this.onCancel();
    }
    onCancel = () => {
        const {confirmErrorCallback, onCancel} = this.props;
        if(confirmErrorCallback) confirmErrorCallback();
        if(onCancel) onCancel()
    }
    okClick = () => {
        const {okClick, confirmBroadcastOperation} = this.props
        okClick(confirmBroadcastOperation)
    }
    render() {
        const {onCancel, okClick} = this
        const {confirm, confirmBroadcastOperation, warning} = this.props
        const conf = typeof confirm === 'function' ? confirm() : confirm
        return (
           <div className="ConfirmTransactionForm">
               <h4>{typeName(confirmBroadcastOperation)}</h4>
               <hr />
               <div>{conf}</div>
               {warning ? <div style={{paddingTop: 10}} className="error">{warning}</div> : null}
               <br />
               <button className="button" onClick={okClick}>{translate('ok')}</button>
               <button type="button hollow" className="button hollow" onClick={onCancel}>{translate('cancel')}</button>
           </div>
       )
    }
}
const typeName = confirmBroadcastOperation => {
    const title = confirmBroadcastOperation.getIn(['operation', '__config', 'title'])
    if(title) return title
    const type = confirmBroadcastOperation.get('type')
    // this part was too complicated to add i18n
    //  Plus i didn't know where and how exactly thi component is used
    //  so i added generic 'Confirm Action' title
    // return translate('confirm') + ' ' + translate((type.split('_').map(n => n.charAt(0).toLowerCase() + n.substring(1))).join(' '))
    return translate('confirm') + ' ' + translate('action')
}

export default connect(
    // mapStateToProps
    (state) => {
        const confirmBroadcastOperation = state.transaction.get('confirmBroadcastOperation')
        const confirmErrorCallback = state.transaction.get('confirmErrorCallback')
        const confirm = state.transaction.get('confirm')
        const warning = state.transaction.get('warning')
        return {
            confirmBroadcastOperation,
            confirmErrorCallback,
            confirm,
            warning
        }
    },
    // mapDispatchToProps
    dispatch => ({
        okClick: (confirmBroadcastOperation) => {
            dispatch(transaction.actions.hideConfirm())
            dispatch(transaction.actions.broadcastOperation({...(confirmBroadcastOperation.toJS())}))
        }
    })
)(ConfirmTransactionForm)
