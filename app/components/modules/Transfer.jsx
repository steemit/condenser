import React, { PropTypes, Component } from 'react';
import ReactDOM from 'react-dom';
import reactForm from 'app/utils/ReactForm';
import {Map} from 'immutable';
import transaction from 'app/redux/Transaction';
import user from 'app/redux/User';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import {transferTips} from 'app/utils/Tips'
import {powerTip, powerTip2, powerTip3} from 'app/utils/Tips'
import {browserTests} from 'shared/ecc/test/BrowserTests'
import {validate_account_name} from 'app/utils/ChainValidation';

/** Warning .. This is used for Power UP too. */
class TransferForm extends Component {

    static propTypes = {
        // redux
        currentUser: PropTypes.object.isRequired,
        toVesting: PropTypes.bool.isRequired,
        currentAccount: PropTypes.object.isRequired,
    }

    constructor(props) {
        super()
        const {transferToSelf} = props
        this.state = {advanced: !transferToSelf}
        this.initForm(props)
    }

    componentDidMount() {
        setTimeout(() => {
            const {advanced} = this.state
            if (advanced)
                ReactDOM.findDOMNode(this.refs.to).focus()
            else
                ReactDOM.findDOMNode(this.refs.amount).focus()
        }, 300)
    }

    onAdvanced = (e) => {
        e.preventDefault() // prevent form submission!!
        const username = this.props.currentUser.get('username')
        this.state.to.props.onChange(username)
        // setTimeout(() => {ReactDOM.findDOMNode(this.refs.amount).focus()}, 300)
        this.setState({advanced: !this.state.advanced})
    }

    initForm(props) {
        const insufficientFunds = (asset, amount) => {
            const balanceValue =
                !asset || asset === 'STEEM' ? props.currentAccount.get('balance') :
                asset === 'SBD' ? props.currentAccount.get('sbd_balance') :
                null
            if(!balanceValue) return false
            const balance = balanceValue.split(' ')[0]
            return parseFloat(amount) > parseFloat(balance)
        }
        const {toVesting} = props
        const fields = toVesting ? ['to', 'amount'] : ['to', 'amount', 'asset', 'memo']

        reactForm({
            name: 'transfer',
            instance: this, fields,
            initialValues: props.initialValues,
            validation: values => ({
                to:
                    ! values.to ? 'Required' : validate_account_name(values.to),
                amount:
                    ! values.amount ? 'Required' :
                    ! /^[0-9]*\.?[0-9]*/.test(values.amount) ? 'Amount is in the form 99999.999' :
                    insufficientFunds(values.asset, values.amount) ? 'Insufficient funds' :
                    null,
                asset:
                    props.toVesting ? null :
                    ! values.asset ? 'Required' : null,
                memo:
                    values.memo && (!browserTests.memo_encryption && /^#/.test(values.memo)) ?
                    'Encrypted memos are temporarily unavailable (issue #98)' :
                    null,
            })
        })
    }

    clearError = () => {this.setState({ trxError: undefined })}

    errorCallback = estr => { this.setState({ trxError: estr, loading: false }) }

    balanceValue() {
        const {transferType} = this.props.initialValues
        const {currentAccount} = this.props
        const {asset} = this.state
        const isWithdraw = transferType && transferType === 'Savings Withdraw'
        return !asset ||
            asset.value === 'STEEM' ?
                isWithdraw ? currentAccount.get('savings_balance') : currentAccount.get('balance') :
            asset.value === 'SBD' ?
                isWithdraw ? currentAccount.get('savings_sbd_balance') : currentAccount.get('sbd_balance') :
            null
    }

    assetBalanceClick = e => {
        e.preventDefault()
        // Convert '9.999 STEEM' to 9.999
        this.state.amount.props.onChange(this.balanceValue().split(' ')[0])
    }

    onChangeTo = (e) => {
        const {value} = e.target
        this.state.to.props.onChange(value.toLowerCase().trim())
    }

    render() {
        const {to, amount, asset, memo} = this.state
        const {loading, trxError, advanced} = this.state
        const {currentUser, toVesting, transferToSelf, dispatchSubmit} = this.props
        const {transferType} = this.props.initialValues
        const {submitting, valid, handleSubmit} = this.state.transfer
        const isMemoPrivate = memo && /^#/.test(memo.value)
        const form = (
            <form onSubmit={handleSubmit(data => {
                // bind redux-form to react-redux
                this.setState({loading: true})
                dispatchSubmit({...data, errorCallback: this.errorCallback, currentUser, toVesting, transferType})
            })}
                onChange={this.clearError}
            >
                {toVesting && <div className="row">
                    <div className="column small-12">
                        <p>{powerTip}</p>
                        <p>{powerTip2}</p>
                    </div>
                </div>}

                {!toVesting && <div>
                    <div className="row">
                        <div className="column small-12">
                            {transferTips[transferType]}
                        </div>
                    </div>
                    <br />
                </div>}

                <div className="row">
                    <div className="column small-2">From</div>
                    <div className="column small-10">
                        <b>{currentUser.get('username')}</b>
                    </div>
                </div>

                <br />

                {advanced && <div className="row">
                    <div className="column small-2">To</div>
                    <div className="column small-10">
                        <input type="text" placeholder="Send to account" {...to.props}
                            onChange={this.onChangeTo} ref="to" autoComplete="off" disabled={loading} />
                        {to.touched && to.blur && to.error ?
                            <div className="error">{to.error}&nbsp;</div> :
                            <p>{toVesting && powerTip3}</p>
                        }
                    </div>
                </div>}

                <div className="row">
                    <div className="column small-2">Amount</div>
                    <div className="column small-10">
                        {asset && <span>
                            <select {...asset.props} placeholder="Asset" disabled={loading}>
                                <option></option>
                                <option value="STEEM">STEEM</option>
                                <option value="SBD">SBD</option>
                            </select>
                        </span>}
                        <AssetBalance balanceValue={this.balanceValue()} onClick={this.assetBalanceClick} />
                        <div className="error">{asset && asset.touched && asset.error && asset.error}&nbsp;</div>
                        <input type="text" placeholder="Amount" {...amount.props} ref="amount" autoComplete="off" disabled={loading} />
                        <div className="error">{amount.touched && amount.error && amount.error}&nbsp;</div>
                    </div>
                </div>

                {memo && <div className="row">
                    <div className="column small-2">Memo</div>
                    <div className="column small-10">
                        <small>This Memo is {isMemoPrivate ? 'Private' : 'Public'}</small>
                        <input type="text" placeholder="Memo" {...memo.props}
                            ref="memo" autoComplete="on" disabled={loading} />
                        <div className="error">{memo.touched && memo.error && memo.error}&nbsp;</div>
                    </div>
                </div>}
                {loading && <span><LoadingIndicator type="circle" /><br /></span>}
                {!loading && <span>
                    {trxError && <div className="error">{trxError}</div>}
                    <button type="submit" disabled={submitting || !valid} className="button">
                        {toVesting ? 'Power Up' : 'Submit'}
                    </button>
                    {transferToSelf && <button className="button hollow no-border" disabled={submitting} onClick={this.onAdvanced}>{advanced ? 'Basic' : 'Advanced'}</button>}
                </span>}
            </form>
        )
        return (
           <div>
               <h3>{toVesting ? 'Convert to Steem Power' : transferType}</h3>
               <div className="row">
                   <div className="column small-12">
                       {form}
                   </div>
               </div>
           </div>
       )
    }
}

const AssetBalance = ({onClick, balanceValue}) =>
    <a onClick={onClick} style={{borderBottom: '#A09F9F 1px dotted', cursor: 'pointer'}}>Balance: {balanceValue}</a>

import {connect} from 'react-redux'

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const initialValues = state.user.get('transfer_defaults', Map()).toJS()
        const toVesting = initialValues.asset === 'VESTS'
        const currentUser = state.user.getIn(['current'])
        const currentAccount = state.global.getIn(['accounts', currentUser.get('username')])

        if(!toVesting && !initialValues.transferType)
            initialValues.transferType = 'Transfer to Account'

        let transferToSelf = toVesting || /Transfer to Savings|Savings Withdraw/.test(initialValues.transferType)
        if (transferToSelf && !initialValues.to)
            initialValues.to = currentUser.get('username')

        if(initialValues.to !== currentUser.get('username'))
            transferToSelf = false // don't hide the to field

        return {...ownProps, currentUser, currentAccount, toVesting, transferToSelf, initialValues}
    },

    // mapDispatchToProps
    dispatch => ({
        dispatchSubmit: ({
            to, amount, asset, memo, transferType,
            toVesting, currentUser, errorCallback
        }) => {
            if(!toVesting && !/Transfer to Account|Transfer to Savings|Savings Withdraw/.test(transferType))
                throw new Error(`Invalid transfer params: toVesting ${toVesting}, transferType ${transferType}`)

            const username = currentUser.get('username')
            const successCallback = () => {
                dispatch({type: 'global/GET_STATE', payload: {url: `@${username}/transfers`}}) // refresh transfer history
                dispatch(user.actions.hideTransfer())
            }
            const asset2 = toVesting ? 'STEEM' : asset
            const operation = {
                from: username,
                to, amount: parseFloat(amount, 10).toFixed(3) + ' ' + asset2,
                memo: toVesting ? undefined : (memo ? memo : '')
            }

            if(transferType === 'Savings Withdraw')
                operation.request_id = Math.floor((Date.now() / 1000) % 4294967295)

            dispatch(transaction.actions.broadcastOperation({
                type: toVesting ? 'transfer_to_vesting' : (
                    transferType === 'Transfer to Account' ? 'transfer' :
                    transferType === 'Transfer to Savings' ? 'transfer_to_savings' :
                    transferType === 'Savings Withdraw' ? 'transfer_from_savings' :
                    null
                ),
                operation,
                successCallback,
                errorCallback
            }))
        }
    })
)(TransferForm)
