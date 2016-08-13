import React, { PropTypes, Component } from 'react';
import {connect} from 'react-redux'
import transaction from 'app/redux/Transaction'

class ConfirmTransactionForm extends Component {

    static propTypes = {
        //Steemit
        onCancel: PropTypes.func,

        // redux-form
        confirm: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        confirmBroadcastOperation: PropTypes.object,
        confirmErrorCallback: PropTypes.func,
        okClick: PropTypes.func,
    };
    onCancel = () => {
        const {confirmErrorCallback, onCancel} = this.props
        if(confirmErrorCallback) confirmErrorCallback()
        if(onCancel) onCancel()
    }
    okClick = () => {
        const {okClick, confirmBroadcastOperation} = this.props
        okClick(confirmBroadcastOperation)
    }
    render() {
        const {onCancel, okClick} = this
        const {confirm, confirmBroadcastOperation} = this.props
        const conf = typeof confirm === 'function' ? confirm() : confirm
        return (
           <div className="ConfirmTransactionForm">
               <h4>{typeName(confirmBroadcastOperation)}</h4>
               <hr />
               <p>{conf}</p>
               <button className="button" onClick={okClick}>Ok</button>
               <button type="button hollow" className="button hollow" onClick={onCancel}>Cancel</button>
           </div>
       )
    }
}
const typeName = confirmBroadcastOperation => {
    const title = confirmBroadcastOperation.getIn(['operation', '__config', 'title'])
    if(title) return title
    const type = confirmBroadcastOperation.get('type')
    return 'Confirm ' + (type.split('_').map(n => n.charAt(0).toUpperCase() + n.substring(1))).join(' ')
}

export default connect(
    // mapStateToProps
    (state) => {
        const confirmBroadcastOperation = state.transaction.get('confirmBroadcastOperation')
        const confirmErrorCallback = state.transaction.get('confirmErrorCallback')
        const confirm = state.transaction.get('confirm')
        return {
            confirmBroadcastOperation,
            confirmErrorCallback,
            confirm,
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
