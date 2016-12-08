import React from 'react';
import {Map} from 'immutable'
import {reduxForm} from 'redux-form' // @deprecated, instead use: app/utils/ReactForm.js
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper'
import Icon from 'app/components/elements/Icon'
import DropdownMenu from 'app/components/elements/DropdownMenu'
import g from 'app/redux/GlobalReducer'
import QRCode from 'react-qr'
import {steemTip, powerTip, powerTip2} from 'app/utils/Tips'
import {cleanReduxInput} from 'app/utils/ReduxForms'
import { translate } from 'app/Translator.js';
import { formatCoins } from 'app/utils/FormatCoins';
import { APP_NAME, APP_ICON, DEBT_TOKEN, DEBT_TOKEN_SHORT, LIQUID_TOKEN, CURRENCY_SIGN, VESTING_TOKEN, VEST_TICKER, LIQUID_TICKER } from 'config/client_config';

const coinNames = {
    [LIQUID_TICKER]: LIQUID_TOKEN,
    [VEST_TICKER]: VESTING_TOKEN,
    BTC: 'Bitcoin',
    BTS: 'Bitshares',
    ETH: 'Ether',
}

const coinToTypes = [
    [LIQUID_TICKER, 'steem'],
    [VEST_TICKER, 'steem_power'],
    ['BTC', 'btc'],
    ['BTS', 'bts'],
    ['ETH', 'eth'],
]

class BlocktradesDeposit extends React.Component {
    static propTypes = {
        // html
        inputCoinType: React.PropTypes.string,
        outputCoinType: React.PropTypes.string,
        onClose: React.PropTypes.func,
        // redux
        fetchLimit: React.PropTypes.func.isRequired,
        fetchInputAddress: React.PropTypes.func.isRequired,
        fetchEstimate: React.PropTypes.func.isRequired,
        fetchTransactions: React.PropTypes.func.isRequired,
        depositLimit: React.PropTypes.string,
        username: React.PropTypes.string,
        inputAddress: React.PropTypes.string,
        inputAddressMemo: React.PropTypes.string,
        estimate: React.PropTypes.object,
        userTradeError: React.PropTypes.object,
        defaults: React.PropTypes.object, // static defaultProps work-around
        transactions: React.PropTypes.object,
        // redux form
        fields: React.PropTypes.object.isRequired,
        handleSubmit: React.PropTypes.func.isRequired,
        submitting: React.PropTypes.bool.isRequired,
    }
    constructor() {
        super()
        this.state = {flip: false}
        this.fetchInputAddress = () => {
            const {fetchInputAddress, username} = this.props
            const {fields: {inputCoin, outputCoin}} = this.props
            fetchInputAddress(inputCoin.value, outputCoin.value, username)
        }
        this.fetchEstimate = () => {
            const {fetchEstimate} = this.props
            const {fields: {inputCoin, outputCoin, amount}} = this.props
            fetchEstimate(inputCoin.value, outputCoin.value, amount.value, this.state.flip)
        }
        this.onFlip = () => {
            const flip = !this.state.flip
            this.setState({flip})
            this.focus()
        }
    }
    componentWillMount() {
        const {fetchLimit, defaults: {inputCoin, outputCoin}} = this.props
        fetchLimit(inputCoin, outputCoin)
        this.setState(getPaymentLink(this.props, false))
        if(this.props.inputAddress) {
            const {fetchTransactions, inputAddress} = this.props
            fetchTransactions(inputAddress)
        } else {
            const {fetchInputAddress, username} = this.props
            fetchInputAddress(inputCoin, outputCoin, username)
        }
    }
    componentDidMount() {
        this.focus()
        const fetch = () => {
            const {fetchTransactions, inputAddress} = this.props
            fetchTransactions(inputAddress)
        }
        const poll = () => {
            fetchTimeoutId = setTimeout(() => {
                if(fetchTimeoutId === -1) return
                fetch()
                poll()
            }, 5 * 1000)
        }
        poll()
    }
    componentWillReceiveProps(nextProps) {
        const wasField = this.props.fields
        const isField = nextProps.fields
        if(
            wasField.inputCoin.value !== isField.inputCoin.value ||
            wasField.outputCoin.value !== isField.outputCoin.value
        ) {
            const {fields: {inputCoin, outputCoin}} = nextProps
            const {inputAddress, fetchInputAddress, username} = nextProps
            if(!inputAddress) fetchInputAddress(inputCoin.value, outputCoin.value, username)

            const {fetchLimit} = nextProps
            fetchLimit(inputCoin.value, outputCoin.value)

            const {fetchTransactions} = nextProps
            fetchTransactions(inputAddress)
        }
        this.setState(getPaymentLink(nextProps, this.state.flip))
    }
    componentWillUnmount() {
        clearTimeout(fetchTimeoutId)
        fetchTimeoutId = -1
    }
    focus() {
        setTimeout(() => {this.refs.amountRef.focus()}, 300)
    }
    render() {
        const {fetchInputAddress, fetchEstimate, onFlip} = this
        const {paymentQr, paymentLink, flip} = this.state // inputEstimate
        const {depositLimit, inputAddress, inputAddressMemo, userTradeError, username, transactions, onClose} = this.props
        const {fields: {inputCoin, outputCoin, amount}, submitting, handleSubmit} = this.props
        const hasError = userTradeError != null
        const est = getEstimatedValue(this.props, flip)
        const getAddressLabel = translate(inputAddress ? 'change_deposit_address' : 'get_deposit_address')
        const arrowIcon = <span>→</span>
        const flipIcon = <span>⇆</span>
        const estimateInputCoin = flip ? coinName(outputCoin.value) : coinName(inputCoin.value)

        const trRows = !transactions ? null : transactions.toJS().map((tr, idx) => <div key={idx}>
            {coalesce(trStatus(tr.transactionProcessingState), '')}&nbsp;
            <TimeAgoWrapper date={tr.inputFirstSeenTime} />,&nbsp;

            {tr.inputAmount}&nbsp;
            {coinName(toSteem(tr.inputCoinType))}&nbsp;
            {/*{trHashLink(inputCoin.value, tr.inputTransactionHash)}&nbsp;*/}

            {arrowIcon}&nbsp;

            {tr.outputAmount}&nbsp;
            {coinName(toSteem(tr.outputCoinType))}&nbsp;
            {/*{trHashLink(outputCoin.value, tr.outputTransactionHash)}&nbsp;*/}
        </div>)

        const depositTip = outputCoin.value === LIQUID_TICKER
            ? translate('tradeable_tokens_that_may_be_transferred_anywhere_at_anytime')
                + ' ' +
                translate('LIQUID_TOKEN_can_be_converted_to_VESTING_TOKEN_in_a_process_called_powering_up')
            : outputCoin.value === VEST_TICKER ? <div>
                <p>{translate('influence_tokens_which_earn_more_power_by_holding_long_term') + ' ' + translate('the_more_you_hold_the_more_you_influence_post_rewards')}</p>
                <p>{translate('VESTING_TOKEN_is_non_transferrable_and_requires_convert_back_to_LIQUID_TOKEN')}</p>
            </div>
            : null

        const selectOutputCoin = <span>
             <input type="radio" {...cleanReduxInput(outputCoin)} value={VEST_TICKER} checked={outputCoin.value === VEST_TICKER} id="powerCheck" />
             &nbsp;
             <label htmlFor="powerCheck">{VESTING_TOKEN}</label>

             <input type="radio" {...cleanReduxInput(outputCoin)} value={LIQUID_TICKER} checked={outputCoin.value === LIQUID_TICKER} id="steemCheck" />
             &nbsp;
             <label htmlFor="steemCheck">{LIQUID_TOKEN}</label>
        </span>

        const coin_menu = [
            {onClick: (e) => {e.preventDefault(); inputCoin.onChange('ETH')},
                value: 'Ether', icon: 'ether', link: '#'},
            {onClick: (e) => {e.preventDefault(); inputCoin.onChange('BTC')},
                value: 'Bitcoin', icon: 'bitcoin', link: '#'},
            {onClick: (e) => {e.preventDefault(); inputCoin.onChange('BTS')},
                value: 'Bitshares', icon: 'bitshares', link: '#'},
        ];
        const selectInputCoin = <DropdownMenu className="move-left" items={coin_menu} selected={coinName(inputCoin.value)} el="span" />
        const estimateButtonLabel = translate(est.inputAmount != null ? 'update_estimate' : 'get_estimate')
        const sendTo = <span>
            {translate("send_amount_of_coins_to", {
                value: amount.value,
                coinName: coinName(inputCoin.value)
            }) + ' '}
            {
                inputAddress && !hasError ? <span><code>{inputAddress}</code>
                {inputAddressMemo && <span><br />
                    {translate("memo")}: <code>{inputAddressMemo}</code><br />
                    {translate("must_include_memo")}&hellip;
                </span>} </span> :
                <span>&hellip;</span>
            }
        </span>
        return <div className="BlocktradesDeposit">
            <div className="row">
                <div className="column small-12">
                    <h1>{translate('buy') + ' ' + coinName(outputCoin.value)}</h1>
                    <span className="text-center">{selectOutputCoin}</span>
                    <span><Icon name={APP_ICON} /></span>
                    <div>{depositTip}</div>
                </div>
            </div>
            <hr />
            <form onSubmit={handleSubmit(() => {fetchEstimate()})}>
                <div className="row">
                    <div className="column small-9">
                        <h5>
                            {est.inputAmount} {coinName(inputCoin.value, true)} {arrowIcon} {est.outputAmount} {formatCoins(coinName(outputCoin.value, true))}
                        </h5>
                        <div>
                            <label className="float-left" htmlFor="estimateAmount">
                                {translate('estimate_using') + ' ' + estimateInputCoin}
                            </label>
                            <span className="float-right" onClick={onFlip}>{flipIcon}</span>
                        </div>
                        <input id="estimateAmount" type="tel" {...cleanReduxInput(amount)} disabled={submitting}
                            placeholder={translate('amount_to_send', {estimateInputCoin})}
                            autoComplete="off" ref="amountRef"
                        />
                        <div className="warning">{amount.touched && amount.error && amount.error}&nbsp;</div>
                    </div>
                    <div className="column small-3">
                        {!hasError && paymentQr}
                    </div>
                </div>
                <div className="row">
                    <div className="column small-12">
                        {translate('deposit_using') + ' '} {selectInputCoin}
                    </div>
                </div>
                <div className="row">
                    <div className="column small-12">
                        {sendTo}
                        {paymentLink && !hasError && <a href={paymentLink}>&nbsp;<Icon name="extlink" /></a>}
                        <div className="de-empasize">{depositLimit && translate('suggested_limit', {depositLimit})}&nbsp;</div>
                    </div>
                </div>
                <br />
                <div className="row">
                    <div className="column small-12">
                        {inputAddress && trRows && <div className="BlocktradesDeposit__history">
                            <h4>{translate("transaction_history")}</h4>
                            {trRows.length ? trRows : <div>{translate("nothing_yet")}&hellip;</div>}
                        </div>}
                    </div>
                </div>
                <hr />
                <div className="row">
                    <div className="column small-12">
                        {userTradeError && <div className="error">{userTradeError}&nbsp;</div>}
                        <button type="submit" className="button" disabled={submitting || !username}>
                            {estimateButtonLabel}</button>

                        {onClose && <button className="button secondary hollow float-right" type="button" disabled={submitting} onClick={onClose}>{translate("close")}</button>}
                        <button onClick={fetchInputAddress} className="button secondary hollow float-right" type="button" disabled={submitting || !username}>
                            {getAddressLabel}</button>
                    </div>
                </div>
                <div className="row">
                    <div className="column small-12">
                        <div className="secondary">
                            {translate('powered_by') + ' '}<a href="//blocktrades.us" target="_blank">Blocktrades</a>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    }
}
let fetchTimeoutId
const blocktrades = {
    url: 'https://api.blocktrades.us/v2/',
}
export default reduxForm(
    {
        form: 'blocktradesDeposit',
        fields: ['inputCoin', 'outputCoin', 'amount']
    },
    (state, ownProps) => {
        // static defaultProps were not available, set them here instead
        let {inputCoinType = 'BTC', outputCoinType = VEST_TICKER} = ownProps
        if(state.form.blocktradesDeposit) {
            const blocktradesDepositForm = state.form.blocktradesDeposit
            if(blocktradesDepositForm.inputCoin.value)
                inputCoinType = blocktradesDepositForm.inputCoin.value
            if(blocktradesDepositForm.outputCoin.value)
                outputCoinType = blocktradesDepositForm.outputCoin.value
        }
        inputCoinType = toSteem(inputCoinType)
        outputCoinType = toSteem(outputCoinType)
        const initialValues = {inputCoin: inputCoinType, outputCoin: outputCoinType}

        inputCoinType = toTrade(inputCoinType)
        outputCoinType = toTrade(outputCoinType)

        const limitResult = state.global.get(`blocktrades_${inputCoinType}_${outputCoinType}_limit`, Map())
        const depositLimit = limitResult.getIn(['result', 'depositLimit'])

        const username = state.user.getIn(['current', 'username'])
        const inputAddressId = username ? `blocktrades_${username}_${inputCoinType}_${outputCoinType}_trade` : null
        const tradeResult = state.global.get(inputAddressId, Map())
        const inputAddress = localCache(inputAddressId, tradeResult.getIn(['result', 'inputAddress']))
        const inputAddressMemo = localCache(inputAddressId + '_memo', tradeResult.getIn(['result', 'inputMemo']))
        const id = `blocktrades_${inputAddress}_transactions`
        const transactions = state.global.getIn([id, 'result'])

        const estimateResult = state.global.get(`blocktrades_${inputCoinType}_${outputCoinType}_estimate`, Map())
        const estimate = estimateResult.get('result')
        const err = o => o.getIn(['error', 'message'])
        const tradeError = coalesce(err(limitResult), coalesce(err(tradeResult), err(estimateResult)))

        let userTradeError
        if(tradeError) {
            const error = tradeError.toJS()
            userTradeError = error.message
            console.error('Blocktrades API Error', error)
            const prefix = translate('internal_server_error') + ': '
            if (userTradeError.startsWith(prefix))
                userTradeError = userTradeError.substr(prefix.length);
        }
        const validate = values => ({
            amount: !/[0-9\.]/.test(values.amount) ? translate('enter_amount') : null
        })
        // 'defaults' is needed because the redux form `initialValues` are not available in the fields at mounting time
        return {...ownProps, initialValues, defaults: initialValues, validate,
            depositLimit, username, inputAddress, inputAddressMemo, estimate, transactions, userTradeError}
    },
    dispatch => ({
        fetchLimit: (inputCoinType, outputCoinType) => {
            inputCoinType = toTrade(inputCoinType)
            outputCoinType = toTrade(outputCoinType)
            const id = `blocktrades_${inputCoinType}_${outputCoinType}_limit`
            const body = { inputCoinType, outputCoinType }
            dispatch(g.actions.fetchJson({id, url: blocktrades.url + 'deposit-limits?' + encodeParams(body)}))
        },
        fetchInputAddress: (inputCoinType, outputCoinType, outputAddress) => {
            if(!outputAddress) return
            inputCoinType = toTrade(inputCoinType)
            outputCoinType = toTrade(outputCoinType)
            const id = `blocktrades_${outputAddress}_${inputCoinType}_${outputCoinType}_trade`
            const body = {inputCoinType, outputCoinType, outputAddress}
            dispatch(g.actions.fetchJson({id, url: blocktrades.url + 'simple-api/initiate-trade', body}))
        },
        /* Estimate the output amount given the input amount from the user */
        fetchEstimate: (inputCoinType, outputCoinType, amount, flip = false) => {
            if(!amount || amount.trim() === '') return
            inputCoinType = toTrade(inputCoinType)
            outputCoinType = toTrade(outputCoinType)
            const id = `blocktrades_${inputCoinType}_${outputCoinType}_estimate`
            const body = {inputCoinType, outputCoinType, [flip ? 'outputAmount' : 'inputAmount']: amount}
            const amountType = flip ? 'input' : 'output'
            dispatch(g.actions.fetchJson({id, url: blocktrades.url + `estimate-${amountType}-amount?` + encodeParams(body)}))
        },
        fetchTransactions: (address) => {
            if(!address) return
            const id = `blocktrades_${address}_transactions`
            dispatch(g.actions.fetchJson({id, url: blocktrades.url + `simple-api/transactions?inputAddress=${encodeURIComponent(address)}`, skipLoading: true}))
        }
    })
)(BlocktradesDeposit)

// ['transaction_seen' or 'transaction_fully_confirmed' or 'no_output_mapping' or 'permanent_output_failure_unauthorized_input_currency' or 'permanent_output_failure_unauthorized_output_currency' or 'permanent_output_failure_input_too_small' or 'output_wallet_unreachable' or 'insufficient_funds_in_hot_wallet' or 'output_transaction_initiated' or 'awaiting_order_fill' or 'unknown_error_sending_output' or 'output_transaction_broadcast' or 'output_transaction_fully_confirmed' or 'no_refund_address']
const statusNames = {
    transaction_seen: translate('processing'),
    output_transaction_broadcast: translate('broadcasted'),
    output_transaction_fully_confirmed: translate('confirmed'),
}

const coalesce = (...values) => values.find(v => v != null)
const coinName = (symbol, full = false) =>
    coalesce(coinNames[symbol] ? (full ? coinNames[symbol] + (symbol === VEST_TICKER ? '' : ' (' + symbol + ')') :
    coinNames[symbol]) : null, symbol)
const toSteem = value => coalesce(coalesce(coinToTypes.find(v => v[1] === value), [])[0], value)
const toTrade = value => coalesce(coalesce(coinToTypes.find(v => v[0] === value), [])[1], value)
const encodeParams = obj => Object.keys(obj).map(key => `${key}=${encodeURIComponent(obj[key])}`).join('&')
const trStatus = stat => coalesce(statusNames[stat], stat)
const trHashLink = (coin, hash) =>
    !hash ? null :
    coin === 'BTC' ? <a href={`https://blockchain.info/tx/${hash}`} target="_blank"><Icon name="extlink" /></a> :
    /STEEM|VESTS|SBD/.test(coin) ? <a href={`https://steemd.com/tx/${hash}`} target="_blank"><Icon name="extlink" /></a> :
    /GOLOS|GESTS|GBG/.test(coin) ? <a href={`http://golosd.com/tx/${hash}`} target="_blank"><Icon name="extlink" /></a> :
    <span t={hash}>hash.substring(0, 10) + '...'</span>

/** Memory backed local storage.  Assumes this is the sole maintainer of this key.
    @arg {string} key null or undefined simply return null or undefined
    @arg {string} value - null to remove, undefined to lookup, or provide a value for storage
    @return {string} from storage or null if not present or undefined if operation did not check storage
*/
function localCache(key, value) {
    if(key == null) return key
    if(typeof key !== 'string') throw new TypeError('key must be a string')
    if(value === null) {
        localCacheMem = localCacheMem.set(key, null)
        localStorage.removeItem(key)
        return null
    }
    if(value) {
        localCacheMem = localCacheMem.set(key, value)
        localStorage.setItem(key, value)
        return value
    }
    let v = localCacheMem.get(key)
    if(v !== undefined) return v
    v = localStorage.getItem(key)
    if(v) {
        localCacheMem = localCacheMem.set(key, v)
    } else {
        localCacheMem = localCacheMem.set(key, null)
    }
    return v
}
let localCacheMem = Map()

function getPaymentLink(props, flip) {
    // bip-0021 bitcoin:<address>[?amount=<amount>][?label=<label>][?message=<message>]'
    const {fields: {inputCoin, outputCoin}} = props
    const {inputAddress, username, defaults} = props
    if(!inputAddress || !username) return {paymentQr: null, paymentLink: null}
    const coinType = inputCoin.value ? inputCoin.value : defaults.inputCoin
    const {fields: {amount}} = props
    const est = getEstimatedValue(props, flip)
    let sendAmount = est.inputAmount
    if(sendAmount == null && !flip && amount.value !== '') {
        sendAmount = amount.value
    }
    if(coinType === 'BTC') {
        const parms = []
        if(sendAmount != null) parms.push(`amount=${sendAmount}`)
        if(est.outputAmount) parms.push(`message=${encodeURIComponent(`For ${est.outputAmount} ${outputCoin.value} (approx)`)}`)
        parms.push('label=' + encodeURIComponent(username + '@blocktrades'))
        const paymentLink = `bitcoin:${inputAddress}?${parms.join('&')}`
        const paymentQr = <QRCode text={paymentLink} />
        return {paymentQr, paymentLink}
    }
    return {paymentQr: null, paymentLink: null}
}

/** Ensure that the estimate is accurate or not seen at all. */
function getEstimatedValue(props, flip) {
    const {estimate, userTradeError} = props
    const {fields: {inputCoin, outputCoin, amount}} = props
    const hasError = userTradeError != null
    const est = estimate ? estimate.toJS() : null
    return est && !hasError &&
        (flip ? est.outputAmount : est.inputAmount) === amount.value &&
        est.inputCoinType === toTrade(inputCoin.value) &&
        est.outputCoinType === toTrade(outputCoin.value) ?
        est : {inputAmount: null, outputAmount: null}
}
