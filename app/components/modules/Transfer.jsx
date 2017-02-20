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
import {countDecimals} from 'app/utils/ParsersAndFormatters'
import {translate} from 'app/Translator';
import { LIQUID_TOKEN, DEBT_TOKEN, VESTING_TOKEN, DEBT_TOKEN_SHORT, LIQUID_TICKER, VEST_TICKER, DEBT_TICKER } from 'config/client_config';
import {prettyDigit} from 'app/utils/ParsersAndFormatters';

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
        const {transferType} = props.initialValues
        const insufficientFunds = (asset, amount) => {
            const {currentAccount} = props
            const isWithdraw = transferType && transferType === 'Savings Withdraw'
            const balanceValue =
                !asset || asset === 'GOLOS' ?
                    isWithdraw ? currentAccount.get('savings_balance') : currentAccount.get('balance') :
                asset === 'GBG' ?
                    isWithdraw ? currentAccount.get('savings_sbd_balance') : currentAccount.get('sbd_balance') :
                null
            if(!balanceValue) return false
            const balance = balanceValue.split(' ')[0]
            return parseFloat(amount) > parseFloat(balance)
        }
        const {toVesting} = props
        const fields = toVesting ? ['to', 'amount'] : ['to', 'amount', 'asset']
        if(!toVesting && transferType !== 'Transfer to Savings' && transferType !== 'Savings Withdraw')
            fields.push('memo')

        reactForm({
            name: 'transfer',
            instance: this, fields,
            initialValues: props.initialValues,
            validation: values => ({
                to:
                    ! values.to ? translate('required') : validate_account_name(values.to),
                amount:
                    ! values.amount ? translate('required') :
                    ! /^[0-9]*\.?[0-9]*/.test(values.amount) ? translate('amount_is_in_form') :
                    insufficientFunds(values.asset, values.amount) ? translate('insufficent_funds') :
                    countDecimals(values.amount) > 2 ? translate('use_only_2_digits_of_precison') :
                    null,
                asset:
                    props.toVesting ? null :
                    ! values.asset ? translate('required') : null,
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
            asset.value === 'GOLOS' ?
                isWithdraw ? currentAccount.get('savings_balance') : currentAccount.get('balance') :
            asset.value === 'GBG' ?
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
            <form onSubmit={handleSubmit(({data}) => {
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
                    <div className="column small-2" style={{paddingTop: 5}}>{translate('from')}</div>
                    <div className="column small-10">
                        <div className="input-group" style={{marginBottom: "1.25rem"}}>
                            <span className="input-group-label">@</span>
                            <input
                                className="input-group-field bold"
                                type="text"
                                disabled
                                value={currentUser.get('username')}
                            />
                        </div>
                    </div>
                </div>

                {advanced && <div className="row">
                    <div className="column small-2" style={{paddingTop: 5}}>{translate('to')}</div>
                    <div className="column small-10">
                        <div className="input-group" style={{marginBottom: "1.25rem"}}>
                            <span className="input-group-label">@</span>
                            <input
                                className="input-group-field"
                                ref="to"
                                type="text"
                                placeholder={translate('send_to_account')}
                                onChange={this.onChangeTo}
                                autoComplete="off"
                                disabled={loading}
                                {...to.props}
                            />
                        </div>
                        {to.touched && to.blur && to.error ?
                            <div className="error">{to.error}&nbsp;</div> :
                            <p>{toVesting && powerTip3}</p>
                        }
                    </div>
                </div>}

                <div className="row">
                    <div className="column small-2" style={{paddingTop: 5}}>{translate('amount')}</div>
                    <div className="column small-10">
                        <div className="input-group" style={{marginBottom: 5}}>
                            <input type="text" placeholder={translate('amount')} {...amount.props} ref="amount" autoComplete="off" disabled={loading} />
                            {asset && <span className="input-group-label" style={{paddingLeft: 0, paddingRight: 0}}>
                                <select {...asset.props} placeholder={translate('asset')} disabled={loading} style={{minWidth: "5rem", height: "inherit", backgroundColor: "transparent", border: "none"}}>
                                    <option value={LIQUID_TICKER}>{LIQUID_TOKEN}</option>
                                    {/* TODO */}
                                    <option value={DEBT_TICKER}>{DEBT_TOKEN_SHORT}</option>
                                </select>
                            </span>}
                        </div>
                        <div style={{marginBottom: "0.6rem"}}>
                            <AssetBalance balanceValue={this.balanceValue()} onClick={this.assetBalanceClick} />
                        </div>
                        {(asset && asset.touched && asset.error ) || (amount.touched && amount.error) ?
                        <div className="error">
                            {asset && asset.touched && asset.error && asset.error}&nbsp;
                            {amount.touched && amount.error && amount.error}&nbsp;
                        </div> : null}
                    </div>
                </div>

                {memo && <div className="row">
                    <div className="column small-2" style={{paddingTop: 33}}>{translate('memo')}</div>
                    <div className="column small-10">
                        <small>{translate(isMemoPrivate ? 'this_memo_is_private' : 'this_memo_is_public')}</small>
                        <input type="text" placeholder={translate('memo')} {...memo.props}
                            ref="memo" autoComplete="on" disabled={loading} />
                        <div className="error">{memo.touched && memo.error && memo.error}&nbsp;</div>
                    </div>
                </div>}
                {loading && <span><LoadingIndicator type="circle" /><br /></span>}
                {!loading && <span>
                    {trxError && <div className="error">{trxError}</div>}
                    <button type="submit" disabled={submitting || !valid} className="button">
                        {translate(toVesting ? 'power_up' : 'transfer')}
                    </button>
                    {transferToSelf && <button className="button hollow no-border" disabled={submitting} onClick={this.onAdvanced}>{translate(advanced ? 'basic' : 'advanced')}</button>}
                </span>}
            </form>
        )
        return (
           <div>
               <h3>{translate(toVesting ? 'convert_to_VESTING_TOKEN' : 'transfer_to_account')}</h3>
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
    <a onClick={onClick} style={{borderBottom: '#A09F9F 1px dotted', cursor: 'pointer'}}>{translate('balance') + ': ' + prettyDigit(balanceValue)}</a>

import {connect} from 'react-redux'

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const initialValues = state.user.get('transfer_defaults', Map()).toJS()
        const toVesting = initialValues.asset === 'GESTS'
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
                // refresh transfer history
                dispatch({type: 'global/GET_STATE', payload: {url: `@${username}/transfers`}})
                if(/Savings Withdraw/.test(transferType)) {
                    dispatch({type: 'user/LOAD_SAVINGS_WITHDRAW', payload: {}})
                }
                dispatch(user.actions.hideTransfer())
            }
            const asset2 = toVesting ? 'GOLOS' : asset
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
