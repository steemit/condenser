import React, { PropTypes, Component } from 'react';
import ReactDOM from 'react-dom';
import reactForm from 'app/utils/ReactForm';
import {Map} from 'immutable';
import transaction from 'app/redux/Transaction';
import user from 'app/redux/User';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import runTests, {browserTests} from 'app/utils/BrowserTests';
import {validate_account_name} from 'app/utils/ChainValidation';
import {countDecimals, formatAmount, checkMemo} from 'app/utils/ParsersAndFormatters';
import tt from 'counterpart';
import { LIQUID_TICKER, DEBT_TICKER , VESTING_TOKEN2 } from 'app/client_config';

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
        // only `donate` flag defined for now
        const flag = props.initialValues && props.initialValues.flag;
        if (flag) {
          this.flag = flag
        }
        const {transferToSelf} = props
        this.state = {advanced: !transferToSelf}
        this.initForm(props)
    }

    componentDidMount() {
        const { props: {onChange}, value} = this.state.amount;
        //force validation programmatically
        //done by the second argument - not working otherwise for now
        const {initialValues: {disableTo}} = this.props
        onChange(value, true)
        setTimeout(() => {
            const {advanced} = this.state
            if (advanced && !disableTo)
                ReactDOM.findDOMNode(this.refs.to).focus()
            else
                ReactDOM.findDOMNode(this.refs.amount).focus()
        }, 300)
        runTests()
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
                    ! values.to ? tt('g.required') : validate_account_name(values.to),
                amount:
                    ! values.amount ? tt('g.required') :
                    insufficientFunds(values.asset, values.amount) ? tt('transfer_jsx.insufficient_funds') :
                    countDecimals(values.amount) > 3 ? tt('transfer_jsx.use_only_3_digits_of_precison') :
                    null,
                asset:
                    props.toVesting ? null :
                    ! values.asset ? tt('g.required') : null,
                memo:
                    values.memo && (!browserTests.memo_encryption && /^#/.test(values.memo)) ?
                    'Encrypted memos are temporarily unavailable (issue #98)' :
                    checkMemo(values.memo) ? tt('transfer_jsx.private_key_in_memo') :
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

    onChangeAmount = (e) => {
        const {value} = e.target
        this.state.amount.props.onChange(formatAmount(value))
    }

    render() {
        const LIQUID_TOKEN = tt('token_names.LIQUID_TOKEN')
        const VESTING_TOKEN =  tt('token_names.VESTING_TOKEN')
        const VESTING_TOKENS = tt('token_names.VESTING_TOKENS')
        const VESTING_TOKEN2 = tt('token_names.VESTING_TOKEN2')

		const transferTips = {
			'Transfer to Account': tt('transfer_jsx.move_funds_to_another_account'),
			'Transfer to Savings': tt('transfer_jsx.protect_funds_by_requiring_a_3_day_withdraw_waiting_period'),
			'Savings Withdraw':    tt('transfer_jsx.withdraw_funds_after_the_required_3_day_waiting_period'),
		}
		const powerTip = tt('tips_js.influence_tokens_which_give_you_more_control_over', {VESTING_TOKEN, VESTING_TOKENS})
		const powerTip2 = tt('tips_js.VESTING_TOKEN_is_non_transferrable_and_requires_convert_back_to_LIQUID_TOKEN', {LIQUID_TOKEN: LIQUID_TICKER, VESTING_TOKEN2})
		const powerTip3 = tt('tips_js.converted_VESTING_TOKEN_can_be_sent_to_yourself_but_can_not_transfer_again', {LIQUID_TOKEN, VESTING_TOKEN})
        const {to, amount, asset, memo} = this.state
        const {loading, trxError, advanced} = this.state
        const {currentUser, toVesting, transferToSelf, dispatchSubmit} = this.props
        const { transferType,
                disableMemo = false,
                disableTo = false,
                disableAmount = false} = this.props.initialValues
        const {submitting, valid, handleSubmit} = this.state.transfer
        const isMemoPrivate = memo && /^#/.test(memo.value)
        const form = (
            <form onSubmit={handleSubmit(({data}) => {
                this.setState({loading: true})
                dispatchSubmit({...data, flag: this.flag, errorCallback: this.errorCallback, currentUser, toVesting, transferType})
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
                    <div className="column small-2" style={{paddingTop: 5}}>{tt('g.from')}</div>
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
                    <div className="column small-2" style={{paddingTop: 5}}>{tt('g.to')}</div>
                    <div className="column small-10">
                        <div className="input-group" style={{marginBottom: "1.25rem"}}>
                            <span className="input-group-label">@</span>
                            <input
                                className="input-group-field"
                                ref="to"
                                type="text"
                                placeholder={tt('transfer_jsx.send_to_account')}
                                onChange={this.onChangeTo}
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                                disabled={disableTo || loading}
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
                    <div className="column small-2" style={{paddingTop: 5}}>{tt('g.amount')}</div>
                    <div className="column small-10">
                        <div className="input-group" style={{marginBottom: 5}}>
                            <input type="text" placeholder={tt('g.amount')} {...amount.props} ref="amount" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" disabled={disableAmount || loading} onChange={(e) => this.onChangeAmount(e)}/>
                            {asset && <span className="input-group-label" style={{paddingLeft: 0, paddingRight: 0}}>
                                <select {...asset.props} placeholder={tt('transfer_jsx.asset')} disabled={disableAmount || loading} style={{minWidth: "5rem", height: "inherit", backgroundColor: "transparent", border: "none"}}>
                                    <option value={LIQUID_TICKER}>{LIQUID_TOKEN}</option>
                                    <option value={DEBT_TICKER}>{DEBT_TICKER}</option>
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

                {(memo && !disableMemo) && <div className="row">
                    <div className="column small-2" style={{paddingTop: 33}}>{tt('transfer_jsx.memo')}</div>
                    <div className="column small-10">
                        <small>{tt('transfer_jsx.this_memo_is') + isMemoPrivate ? tt('transfer_jsx.public') : tt('transfer_jsx.private')}</small>
                        <input type="text" placeholder={tt('transfer_jsx.memo_placeholder')} {...memo.props}
                            ref="memo" autoComplete="on" autoCorrect="off" autoCapitalize="off" spellCheck="false" disabled={disableMemo || loading} />
                        <div className="error">{memo.touched && memo.error && memo.error}&nbsp;</div>
                    </div>
                </div>}
                {loading && <span><LoadingIndicator type="circle" /><br /></span>}
                {!loading && <span>
                    {trxError && <div className="error">{trxError}</div>}
                    <button type="submit" disabled={submitting || !valid} className="button">
                        {tt(toVesting ? 'transfer_jsx.power_up' : 'transfer_jsx.submit')}
                    </button>
                    {transferToSelf && <button className="button hollow no-border" disabled={submitting} onClick={this.onAdvanced}>{tt(advanced ? 'g.basic' : 'g.advanced')}</button>}
                </span>}
            </form>
        )
        return (
           <div>
               <div className="row">
                   <h3>{toVesting ? tt('transfer_jsx.convert_to_VESTING_TOKEN', {VESTING_TOKEN2}) : tt('transfer_jsx.form_title')}</h3>
               </div>
               {form}
           </div>
       )
    }
}

const AssetBalance = ({onClick, balanceValue}) =>
    <a onClick={onClick} style={{borderBottom: '#A09F9F 1px dotted', cursor: 'pointer'}}>{tt('transfer_jsx.balance') + ": " + balanceValue}</a>

import {connect} from 'react-redux'

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const initialValues = state.user.get('transfer_defaults', Map()).toJS()
        const toVesting = initialValues.asset === 'GESTS'
        const {locationBeforeTransitions: {pathname}} = state.routing;
        const currentUserNameFromRoute = pathname.split(`/`)[1].substring(1);
        const currentUserFromRoute = Map({username: currentUserNameFromRoute});
        const currentUser = state.user.getIn(['current']) || currentUserFromRoute;
        const currentAccount = currentUser && state.global.getIn(['accounts', currentUser.get('username')])

        if(!toVesting && !initialValues.transferType)
            initialValues.transferType = 'Transfer to Account'

        let transferToSelf = toVesting || /Transfer to Savings|Savings Withdraw/.test(initialValues.transferType)
        if (currentUser && transferToSelf && !initialValues.to)
            initialValues.to = currentUser.get('username')

        if(currentUser && initialValues.to !== currentUser.get('username'))
            transferToSelf = false // don't hide the to field

        return {...ownProps, currentUser, currentAccount, toVesting, transferToSelf, initialValues}
    },

    // mapDispatchToProps
    dispatch => ({
        dispatchSubmit: ({
            flag,
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


            // handle donate
            // todo redesign transfer types globally
            if (flag) {
              // get transfer type and default memo composer
              // now 'donate' only
              const { fMemo } = flag;
              if (typeof operation.memo === `string`) {
                // donation with an empty memo
                // compose memo default for this case
                if (operation.memo.trim().length === 0) {
                  operation.memo = typeof fMemo === `function` ? fMemo() : operation.memo;
                }
              }
            }



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
