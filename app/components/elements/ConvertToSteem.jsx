/* eslint react/prop-types: 0 */
import React from 'react'
import ReactDOM from 'react-dom';
import {reduxForm} from 'redux-form';
import transaction from 'app/redux/Transaction'
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate'
import TransactionError from 'app/components/elements/TransactionError'
import LoadingIndicator from 'app/components/elements/LoadingIndicator'
import {cleanReduxInput} from 'app/utils/ReduxForms'

class ConvertToSteem extends React.Component {
    constructor() {
        super()
        this.state = {}
    }
    componentDidMount() {
        ReactDOM.findDOMNode(this.refs.amt).focus()
    }
    shouldComponentUpdate = shouldComponentUpdate(this, 'ConvertToSteem')
    dispatchSubmit = () => {
        const {convert, owner, onClose} = this.props
        const {amount} = this.props.fields
        const success = () => {
            if(onClose) onClose()
            this.setState({loading: false})
        }
        const error = () => {
            this.setState({loading: false})
        }
        convert(owner, amount.value, success, error)
        this.setState({loading: true})
    }
    render() {
        const {dispatchSubmit} = this
        const {onClose, handleSubmit, submitting} = this.props
        const {amount} = this.props.fields
        const {loading} = this.state
        return (
            <form onSubmit={handleSubmit(data => {dispatchSubmit(data)})}>
                <div className="row">
                    <div className="small-12 columns">
                        <h1>Convert to Steem</h1>
                        <p>This action will take place one week from now and can not be canceled. These Steem Dollars will immediatly become unavailable.</p>
                        <p>Your existing Steem Dollars are liquid and transferable.  Instead you may wish to trade Steem Dollars directly in this site under <i>Buy or Sell</i> or transfer to an external market.</p>
                        <p>This is a price feed conversion. The one week day delay is necessary to prevent abuse from gaming the price feed average.</p>
                    </div>
                </div>
                <div className="row">
                    <div className="small-12 columns">
                        <label>Amount</label>
                        <input type="amount" ref="amt" {...cleanReduxInput(amount)} autoComplete="off" disabled={loading} />
                        &nbsp;
                        STEEM DOLLARS
                        <br />
                        <div className="error">{amount.touched && amount.error && amount.error}&nbsp;</div>
                    </div>
                </div>
                <div className="row">
                    <div className="small-12 columns">
                        <TransactionError opType="convert" />
                        {loading && <span><LoadingIndicator type="circle" /></span>}
                        <br />
                        <div>
                            <button type="submit" className="button" disabled={loading}>
                                Convert
                            </button>
                            <button type="button" disabled={submitting} className="button hollow float-right" onClick={onClose}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        )
    }
}
export default reduxForm(
    { form: 'convertToSteem', fields: ['amount'] },
    // mapStateToProps
    (state, ownProps) => {
        const current = state.user.get('current')
        const username = current.get('username')
        const account = state.global.getIn(['accounts', username])
        const sbd_balance = account.get('sbd_balance')
        const max = sbd_balance.split(' ')[0]
        const validate = values => ({
            amount: ! values.amount ? 'Required' :
                isNaN(values.amount) || parseFloat(values.amount) <= 0 ? 'Invalid amount' :
                parseFloat(values.amount) > parseFloat(max) ? 'Insufficient balance' :
                null,
        })
        return {
            ...ownProps,
            validate,
            owner: username,
        }
    },
    // mapDispatchToProps
    dispatch => ({
        convert: (owner, amt, success, error) => {
            const amount = String(parseFloat(amt).toFixed(3)) + ' SBD'
            const requestid = Math.floor(Date.now() / 1000)
            const conf = `In one week, convert ${amount.split(' ')[0]} STEEM DOLLARS into STEEM`
            dispatch(transaction.actions.broadcastOperation({
                type: 'convert',
                operation: {owner, requestid, amount},
                confirm: conf + '?',
                successCallback: () => {
                    success()
                    dispatch({type: 'ADD_NOTIFICATION', payload:
                        {key: "convert_sd_to_steem_" + Date.now(),
                         message: `Order placed: ${conf}`,
                         dismissAfter: 5000}
                    })
                },
                errorCallback: () => {error()}
            }))
        },
    })
)(ConvertToSteem)
