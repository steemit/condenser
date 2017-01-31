import React, { PropTypes, Component } from 'react';
import ReactDOM from 'react-dom';
import reactForm from 'app/utils/ReactForm';
import {Map} from 'immutable';
import transaction from 'app/redux/Transaction';
import user from 'app/redux/User';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import {powerTip, powerTip2, powerTip3} from 'app/utils/Tips'
import {browserTests} from 'shared/ecc/test/BrowserTests'
import {validate_account_name} from 'app/utils/ChainValidation';
import { translate } from 'app/Translator';
import { formatCoins } from 'app/utils/FormatCoins';
import { APP_NAME, LIQUID_TOKEN, DEBT_TOKEN, DEBT_TOKEN_SHORT, CURRENCY_SIGN, VESTING_TOKEN,
LIQUID_TICKER, DEBT_TICKER, VEST_TICKER } from 'config/client_config';

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
        this.state = {advanced: !props.toVesting}
        this.initForm(props)
    }

    componentDidMount() {
        setTimeout(() => {
            const {to} = this.state
            if (!to.value || to.value === '')
                ReactDOM.findDOMNode(this.refs.to).focus()
            else
                ReactDOM.findDOMNode(this.refs.amount).focus()
        }, 300)
    }

    onAdvanced = (e) => {
        e.preventDefault() // prevent form submission!!
        if(!this.state.advance) {
            const username = this.props.currentUser.get('username')
            this.state.to.props.onChange(username)
        }
        this.setState({advanced: !this.state.advanced})
    }

    initForm(props) {
        const insufficientFunds = (asset, amount) => {
            const balanceValue =
                !asset || asset === LIQUID_TICKER ? props.currentAccount.get('balance') :
                asset === DEBT_TICKER ? props.currentAccount.get('sbd_balance') :
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
                    ! values.to ? translate('required') : validate_account_name(values.to),
                amount:
                    ! values.amount ? translate('required') :
                    ! /^[0-9]*\.?[0-9]*/.test(values.amount) ? translate('amount_is_in_form') :
                    insufficientFunds(values.asset, values.amount) ? translate('insufficent_funds') :
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
        const {currentAccount} = this.props
        const {asset} = this.state
        return formatCoins(!asset || asset.value === LIQUID_TICKER ? currentAccount.get('balance') :
            asset.value === DEBT_TICKER ? currentAccount.get('sbd_balance') :
            null)
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
        const {currentUser, toVesting, dispatchSubmit} = this.props
        const {submitting, valid, handleSubmit} = this.state.transfer

        const isMemoPrivate = memo && /^#/.test(memo.value)

        const form = (
            <form onSubmit={handleSubmit(data => {
                // bind redux-form to react-redux
                this.setState({loading: true})
                dispatchSubmit({...data, errorCallback: this.errorCallback, currentUser, toVesting})
            })}
                onChange={this.clearError}
            >
                {toVesting && <div className="row">
                    <div className="column small-12">
                        <p>{translate('influence_tokens_which_earn_more_power_by_holding_long_term_transfer') + ' ' + translate('the_more_you_hold_the_more_you_influence_post_rewards')}</p>
                        <p>{translate('VESTING_TOKEN_is_non_transferrable_and_will_require_2_years_and_104_payments_to_convert_back_to_LIQUID_TOKEN_transfer')}</p>
                    </div>
                </div>}

                <div className="row">
                    <div className="column small-2">{translate('from')}</div>
                    <div className="column small-10">
                        <b>{currentUser.get('username')}</b>
                    </div>
                </div>

                {(advanced || !toVesting) && <div className="row">
                    <div className="column small-2">{translate('to')}</div>
                    <div className="column small-10">
                        <input type="text" placeholder={translate('send_to_account')} {...to.props}
                            onChange={this.onChangeTo} ref="to" autoComplete="off" disabled={loading} />
                        {to.touched && to.blur && to.error ?
                            <div className="error">{to.error}&nbsp;</div> :
                            <p>{toVesting && powerTip3}</p>
                        }
                    </div>
                </div>}

                <div className="row">
                    <div className="column small-2">{translate('amount')}</div>
                    <div className="column small-10">
                        <input type="text" placeholder={translate('amount')} {...amount.props} ref="amount" autoComplete="off" disabled={loading} />
                        <div className="error">{amount.touched && amount.error && amount.error}&nbsp;</div>
                        {asset && <span>
                            <select {...asset.props} placeholder={translate('asset')} disabled={loading}>
                                <option></option>
                                <option value={LIQUID_TICKER}>{LIQUID_TOKEN}</option>
                                {/* TODO */}
                                <option value={DEBT_TICKER}>{DEBT_TOKEN_SHORT}</option>
                            </select>
                        </span>}
                        <AssetBalance balanceValue={this.balanceValue()} onClick={this.assetBalanceClick} />
                        <div className="error">{asset && asset.touched && asset.error && asset.error}&nbsp;</div>
                    </div>
                </div>
                {memo && <div className="row">
                    <div className="column small-2">{translate('memo')}</div>
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
                    {toVesting && <button className="button hollow no-border" disabled={submitting} onClick={this.onAdvanced}>{translate(advanced ? 'basic' : 'advanced')}</button>}
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
    <a onClick={onClick} style={{borderBottom: '#A09F9F 1px dotted', cursor: 'pointer'}}>{translate('balance') + ': ' + balanceValue}</a>

import {connect} from 'react-redux'

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const initialValues = state.user.get('transfer_defaults', Map()).toJS()
        const toVesting = initialValues.asset === VEST_TICKER
        const currentUser = state.user.getIn(['current'])
        const currentAccount = state.global.getIn(['accounts', currentUser.get('username')])

        if (toVesting && !initialValues.to)
            initialValues.to = currentUser.get('username')

        return {...ownProps, currentUser, currentAccount, toVesting, initialValues}
    },

    // mapDispatchToProps
    dispatch => ({
        dispatchSubmit: ({to, amount, asset, memo, toVesting, currentUser, errorCallback}) => {
            const username = currentUser.get('username')
            const successCallback = () => {
                dispatch({type: 'global/GET_STATE', payload: {url: `@${username}/transfers`}}) // refresh transfer history
                dispatch(user.actions.hideTransfer())
            }
            const asset2 = toVesting ? LIQUID_TICKER : asset
            const operation = {
                from: username,
                to, amount: parseFloat(amount, 10).toFixed(3) + ' ' + asset2,
                memo: toVesting ? undefined : (memo ? memo : '')
            }
            dispatch(transaction.actions.broadcastOperation({
                type: toVesting ? 'transfer_to_vesting' : 'transfer',
                operation,
                successCallback,
                errorCallback
            }))
        }
    })
)(TransferForm)
