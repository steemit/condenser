/* eslint react/prop-types: 0 */
import React from 'react';
import {connect} from 'react-redux'
import {Link} from 'react-router'
import g from 'app/redux/GlobalReducer'
import TransferHistoryRow from 'app/components/cards/TransferHistoryRow';
import TransactionError from 'app/components/elements/TransactionError';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import DropdownMenu from 'app/components/elements/DropdownMenu';
import BlocktradesDeposit from 'app/components/modules/BlocktradesDeposit';
import Reveal from 'react-foundation-components/lib/global/reveal'
import CloseButton from 'react-foundation-components/lib/global/close-button';
import {steemTip, powerTip, dollarTip, valueTip} from 'app/utils/Tips'
import {numberWithCommas, vestingSteem} from 'app/utils/StateFunctions'
import { localizedCurrency } from 'app/components/elements/LocalizedCurrency';
import { APP_NAME_LATIN, LIQUID_TOKEN, DEBT_TOKEN, CURRENCY_SIGN, VESTING_TOKEN, DEBT_TOKEN_SHORT, LIQUID_TICKER, VEST_TICKER, DEBT_TICKER } from 'config/client_config';
import FoundationDropdownMenu from 'app/components/elements/FoundationDropdownMenu'
import WalletSubMenu from 'app/components/elements/WalletSubMenu'
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import Tooltip from 'app/components/elements/Tooltip'
import { translate } from 'app/Translator';

// normalize app name
const appName = APP_NAME_LATIN.toLowerCase()
const assetPrecision = 1000;

class UserWallet extends React.Component {
    constructor() {
        super()
        this.state = {}
        this.onShowDeposit = () => {this.setState({showDeposit: !this.state.showDeposit})}
        this.onShowDepositSteem = (e) => {
            e.preventDefault()
            this.setState({showDeposit: !this.state.showDeposit, depositType: LIQUID_TICKER})
        }
        this.onShowDepositPower = (e) => {
            e.preventDefault()
            this.setState({showDeposit: !this.state.showDeposit, depositType: VEST_TICKER})
        }
        // this.onShowDeposit = this.onShowDeposit.bind(this)
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'UserWallet');
    }
    render() {
        const {state: {showDeposit, depositType, toggleDivestError},
            onShowDeposit, onShowDepositSteem, onShowDepositPower} = this
        const {convertToSteem, price_per_steem, savings_withdraws, account,
            current_user, open_orders} = this.props
        const gprops = this.props.gprops.toJS();

        if (!account) return null;
        let vesting_steemf = vestingSteem(account.toJS(), gprops);
        let vesting_steem = vesting_steemf.toFixed(3);

        let isMyAccount = current_user && current_user.get('username') === account.get('name');

        const disabledWarning = false;
        // isMyAccount = false; // false to hide wallet transactions

        const showTransfer = (asset, e) => {
            e.preventDefault();
            this.props.showTransfer({
                to: (isMyAccount ? null : account.get('name')),
                asset, transferType
            });
        };

        const savings_balance = account.get('savings_balance');
        const savings_sbd_balance = account.get('savings_sbd_balance');

        const powerDown = (cancel, e) => {
            e.preventDefault()
            const name = account.get('name');
            const vesting_shares = cancel ? '0.000000 ' + VEST_TICKER : account.get('vesting_shares')
            this.setState({toggleDivestError: null})
            const errorCallback = e2 => {this.setState({toggleDivestError: e2.toString()})}
            const successCallback = () => {this.setState({toggleDivestError: null})}
            this.props.withdrawVesting({account: name, vesting_shares, errorCallback, successCallback})
        }

        // Sum savings withrawals
        let savings_pending = 0, savings_sbd_pending = 0
        if(savings_withdraws) {
            savings_withdraws.forEach(withdraw => {
                const [amount, asset] = withdraw.get('amount').split(' ')
                if(asset === 'STEEM')
                    savings_pending += parseFloat(amount)
                else {
                    if(asset === 'SBD')
                        savings_sbd_pending += parseFloat(amount)
                }
            })
        }

        // Sum conversions
        let conversionValue = 0;
        const conversions = account.get('other_history').filter(a => {
            return a.getIn([1, 'op', 0]) === 'convert';
        }).map(c => {
            const timestamp = new Date(c.getIn([1, 'timestamp'])).getTime();
            const finishTime = timestamp + (86400000 * (timestamp <= 1481040000000 ? 7 : 3.5)); // add conversion delay before/after hardfork change
            const amount = parseFloat(c.getIn([1, 'op', 1, 'amount']).replace(" SBD", ""));
            conversionValue += amount;
            return (
                <div key={c.get(0)}>
                    <Tooltip t={translate('conversion_complete_tip') + ": " + new Date(finishTime).toLocaleString()}>
                        <span>(+{translate('in_conversion', {amount: numberWithCommas('$' + amount.toFixed(3))})})</span>
                    </Tooltip>
                </div>
            );
        })

        const balance_steem = parseFloat(account.get('balance').split(' ')[0]);
        const saving_balance_steem = parseFloat(savings_balance.split(' ')[0]);
        const divesting = parseFloat(account.get('vesting_withdraw_rate').split(' ')[0]) > 0.000000;
        const sbd_balance = parseFloat(account.get('sbd_balance'))
        const sbd_balance_savings = parseFloat(savings_sbd_balance.split(' ')[0]);
        const sbdOrders = (!open_orders || !isMyAccount) ? 0 : open_orders.reduce((o, order) => {
            if (order.sell_price.base.indexOf("SBD") !== -1) {
                o += order.for_sale;
            }
            return o;
        }, 0) / assetPrecision;

        const steemOrders = (!open_orders || !isMyAccount) ? 0 : open_orders.reduce((o, order) => {
            if (order.sell_price.base.indexOf("STEEM") !== -1) {
                o += order.for_sale;
            }
            return o;
        }, 0) / assetPrecision;

        // set displayed estimated value
        const total_sbd = sbd_balance + sbd_balance_savings + savings_sbd_pending + sbdOrders + conversionValue;
        const total_steem = vesting_steemf + balance_steem + saving_balance_steem + savings_pending + steemOrders;
        let total_value = '$' + numberWithCommas(
            ((total_steem * price_per_steem) + total_sbd
        ).toFixed(2))

        // format spacing on estimated value based on account state
        let estimate_output = <p>{total_value}</p>;
        if (isMyAccount) {
            estimate_output = <p>{total_value}&nbsp; &nbsp; &nbsp;</p>;
        }

        // const total_value = (((vesting_steemf + balance_steem) * price_per_steem) + sbd_balance) || 0
        /// transfer log
        let idx = 0
        const transfer_log = account.get('transfer_history')
        .map(item => {
            const data = item.getIn([1, 'op', 1]);
            const type = item.getIn([1, 'op', 0]);

            // Filter out rewards
            if (type === "curation_reward" || type === "author_reward") {
                return null;
            }

            if(data.sbd_payout === '0.000 ' + DEBT_TICKER && data.vesting_payout === '0.000000 ' + VEST_TICKER)
                return null
            return <TransferHistoryRow key={idx++} op={item.toJS()} context={account.get('name')} />;
        }).filter(el => !!el).reverse();

        let steem_menu = [
            { value: translate('transfer'), link: '#', onClick: showTransfer.bind( this, LIQUID_TICKER ) },
            { value: translate('power_up'), link: '#', onClick: showTransfer.bind( this, VEST_TICKER ) },
        ]
        let power_menu = [
            { value: translate('power_down'), link: '#', onClick: powerDown.bind(this, false) }
        ]
        if(isMyAccount) {
            // steem_menu.push({ value: translate('deposit'), link: '#', onClick: onShowDepositSteem })
            steem_menu.push({ value: translate('buy_or_sell'), link: '/market' })
            // power_menu.push({ value: translate('deposit'), link: '#', onClick: onShowDepositPower })
        }
        if( divesting ) {
            power_menu.push({ value: translate('cancel_power_down'), link: '#', onClick: powerDown.bind(this, true) });
        }

        let dollar_menu = [
            { value: translate('transfer'), link: '#', onClick: showTransfer.bind( this, DEBT_TOKEN_SHORT ) },
            // { value: translate('buy_or_sell'), link: '/market' },
            { value: translate('convert_to_LIQUID_TOKEN'), link: '#', onClick: convertToSteem },
        ]
        const isWithdrawScheduled = new Date(account.get('next_vesting_withdrawal') + 'Z').getTime() > Date.now()
        const depositReveal = showDeposit && <div>
            <Reveal onHide={onShowDeposit} show={showDeposit}>
                <CloseButton onClick={onShowDeposit} />
                <BlocktradesDeposit onClose={onShowDeposit} outputCoinType={depositType} />
            </Reveal>
        </div>

        const steem_balance_str = numberWithCommas(balance_steem.toFixed(3)) // formatDecimal(balance_steem, 3)
        const steem_orders_balance_str = numberWithCommas(steemOrders.toFixed(3))
        const power_balance_str = numberWithCommas(vesting_steem) // formatDecimal(vesting_steem, 3)
        const sbd_balance_str = numberWithCommas('$' + sbd_balance.toFixed(3)) // formatDecimal(account.sbd_balance, 3)
        const sbd_orders_balance_str = numberWithCommas('$' + sbdOrders.toFixed(3))
        const savings_balance_str = numberWithCommas(saving_balance_steem.toFixed(3) + ' STEEM')
        const savings_sbd_balance_str = numberWithCommas('$' + sbd_balance_savings.toFixed(3))

        const savings_menu = [
            { value: 'Withdraw Steem', link: '#', onClick: showTransfer.bind( this, 'STEEM', 'Savings Withdraw' ) },
        ]
        const savings_sbd_menu = [
            { value: 'Withdraw Steem Dollars', link: '#', onClick: showTransfer.bind( this, 'SBD', 'Savings Withdraw' ) },
        ]
        // set dynamic secondary wallet values
        const sbdInterest = this.props.sbd_interest / 100
        //const sbdMessage = translate('tokens_worth_about_AMOUNT_of_LIQUID_TOKEN') //TODO: add APR param to xlation
        const sbdMessage = <span>Tokens worth about $1.00 of STEEM, currently collecting {sbdInterest}% APR.</span>

        return (<div className="UserWallet">
            <div className="row">
                <div className="columns small-10 medium-12 medium-expand">
                    {isMyAccount ? <WalletSubMenu account_name={account.get('name')} /> : <div><br /><h4>BALANCES</h4><br /></div>}
                </div>
                <div className="columns shrink">
                    {isMyAccount && <button className="UserWallet__buysp button hollow" onClick={this.onShowDepositSteem}>Buy Steem or Steem Power</button>}
                </div>
            </div>
            <div className="UserWallet__balance row">
                <div className="column small-12 medium-8">
                    STEEM<br /><span className="secondary">{steemTip.split(".").map((a, index) => {if (a) {return <div key={index}>{a}.</div>;} return null;})}</span>
                </div>
                <div className="column small-12 medium-4">
                    {isMyAccount ?
                    <FoundationDropdownMenu className="Wallet_dropdown" dropdownPosition="bottom" dropdownAlignment="right" label={steem_balance_str + ' STEEM'} menu={steem_menu} />
                    : steem_balance_str + ' STEEM'}
                    {steemOrders ? <div style={{paddingRight: isMyAccount ? "0.85rem" : null}}><Link to="/market"><Tooltip t={translate('open_orders')}>(+{steem_orders_balance_str} STEEM)</Tooltip></Link></div> : null}
                </div>
                {/* {isMyAccount && <div className="column small-12 medium-4">
                    <button className="UserWallet__buysp button hollow float-right" onClick={this.onShowDepositSteem}>{translate('buy_LIQUID_TOKEN_or_INVEST_TOKEN')}</button>
                </div>} */}
            </div>
            <br />
            <div className="UserWallet__balance row">
                <div className="column small-12 medium-8">
                    <span className="uppercase">
                      <img src="/images/golos-badge.jpg" width="36px" height="36px" alt="символ Голоса" />
                      {LIQUID_TOKEN}
                    </span>
                    <br />
                    <span className="secondary">
                        {/* not using steemTip because translate strings may be undefined on load */}
                        {/* {steemTip.split(".").map((a, index) => {if (a) {return <div key={index}>{a}.</div>;} return null;})} */}
                        <div>{translate('tradeable_tokens_that_may_be_transferred_anywhere_at_anytime')}</div>
                        <div>{translate('LIQUID_TOKEN_can_be_converted_to_VESTING_TOKEN_in_a_process_called_powering_up')}</div>
                    </span>
                </div>
                <div className="column small-12 medium-4">
                    {isMyAccount ?
                    <DropdownMenu selected={<span className="uppercase">{steem_balance_str + ' ' + LIQUID_TOKEN}</span>} className="Header__sort-order-menu" items={steem_menu} el="span" />
                    : steem_balance_str + ' ' + LIQUID_TOKEN}
                </div>
            </div>
            <div className="UserWallet__balance row">
                <div className="column small-12 medium-8">
                    <span className="uppercase">
                      <img src="/images/golospower-badge.jpg" width="36px" height="36px" alt="символ Силы Голоса" />
                      {VESTING_TOKEN}
                    </span>
                    <br />
                    <span className="secondary">
                        {/* not using steemTip because translate strings may be undefined on load */}
                        {/* {powerTip.split(".").map((a, index) => {if (a) {return <div key={index}>{a}.</div>;} return null;})} */}
                        <div>{translate('influence_tokens_which_earn_more_power_by_holding_long_term')}</div>
                        <div>{translate('the_more_you_hold_the_more_you_influence_post_rewards')}</div>
                    </span>
                </div>
                <div className="column small-12 medium-4">
                    {isMyAccount ?
                    <FoundationDropdownMenu className="Wallet_dropdown" dropdownPosition="bottom" dropdownAlignment="right" label={sbd_balance_str} menu={dollar_menu} />
                    : sbd_balance_str}
                    {sbdOrders ? <div style={{paddingRight: isMyAccount ? "0.85rem" : null}}><Link to="/market"><Tooltip t={translate('open_orders')}>(+{sbd_orders_balance_str})</Tooltip></Link></div> : null}
                    {conversions}
                </div>
            </div>
            <div className="UserWallet__balance row">
                <div className="column small-12 medium-8">
                    <span className="uppercase">
                      <img src="/images/zolotoy-badge.jpg" width="32px" height="32px" alt="символ Золотого" />
                      {DEBT_TOKEN}
                    </span>
                    <br />
                    <span className="secondary">{translate('tokens_worth_about_AMOUNT_of_LIQUID_TOKEN', {amount: localizedCurrency(1)})}</span>
                </div>
                <div className="column small-12 medium-4">
                    {isMyAccount ?
                    <DropdownMenu selected={sbd_balance_str} items={dollar_menu} el="span" className="Header__sort-order-menu" />
                    : sbd_balance_str}
                </div>
            </div>
            <div className="row">
                <div className="column small-12">
                    <div style={{borderTop: '1px solid #eee', paddingTop: '0.25rem', marginTop: '0.25rem'}}>
                    </div>
                </div>
            </div>
            <div className="UserWallet__balance row">
                <div className="column small-12 medium-8">
                    {translate('estimate_account_value')}<br /><span className="secondary">{translate('the_estimated_value_is_based_on_a_7_day_average_value_of_LIQUID_TOKEN_in_currency')}</span>
                </div>
                <div className="column small-12 medium-4">
                    {
                        process.env.BROWSER
                        ? localizedCurrency(total_value)
                        : translate('loading') + '...'
                    }
                </div>
            </div>
            <div className="UserWallet__balance row">
                <div className="column small-12">
                    {isWithdrawScheduled && <span>{translate('next_power_down_is_scheduled_to_happen_at')}&nbsp; <TimeAgoWrapper date={account.get('next_vesting_withdrawal')} />.</span> }
                    {/*toggleDivestError && <div className="callout alert">{toggleDivestError}</div>*/}
                    <TransactionError opType="withdraw_vesting" />
                </div>
            </div>
            {disabledWarning && <div className="row">
                <div className="column small-12">
                    <div className="callout warning">
                        {translate('transfers_are_temporary_disabled')}.
                    </div>
                </div>
            </div>}
            <div className="row">
                <div className="column small-12">
                    <hr />
                </div>
            </div>

            <div className="row">
                <div className="column small-12">
                    {/** history */}
                    <h4 className="uppercase">{translate('history')}</h4>
                    <table>
                        <tbody>
                        {transfer_log}
                        </tbody>
                     </table>
                </div>
            </div>
            {depositReveal}
        </div>);
    }
}

function getPriceFromPair(_price_, _tokensPair_){
  let price = [_price_.base.split(' '), _price_.quote.split(' ')]
  if (price[0].length !== 2 || price[1].length !== 2) return;
  try {
    if (typeof price[0][0] === 'string') price[0][0] = parseFloat(price[0][0]);
    if (typeof price[1][0] === 'string') price[1][0] = parseFloat(price[1][0]);
  } catch(e) {
    console.error("could not calculate from ", _price_)
    return false;
  }

  let tokensPair = Array.isArray(_tokensPair_) ? _tokensPair_ : _tokensPair_.split('/')
  if (tokensPair.length !== 2) return false;

  let pair = new Array(2)
  pair[0] = price.find((item) => {return tokensPair[0] === item[1]})
  pair[1] = price.find((item) => {return tokensPair[1] === item[1]})
  try {
    return parseFloat(pair[0][0])/parseFloat(pair[1][0])
  } catch(e) {
    console.log(e);
    return 0
  }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        let price_per_steem = undefined
        const feed_price = state.global.get('feed_price')
        if(feed_price && feed_price.has('base') && feed_price.has('quote')) {
            let price
            let {base, quote} = feed_price.toJS()

            let priceGBGperGOLOS = getPriceFromPair(feed_price.toJS(), 'GBG/GOLOS')
            let priceGOLOSperGBG = getPriceFromPair(feed_price.toJS(), 'GOLOS/GBG')

            price_per_steem = priceGBGperGOLOS;
        }
        const savings_withdraws = state.user.get('savings_withdraws')
        const gprops = state.global.get('props');
        const sbd_interest = gprops.get('sbd_interest_rate')
        return {
            ...ownProps,
            open_orders: state.market.get('open_orders'),
            price_per_steem,
            savings_withdraws,
            sbd_interest,
            gprops
        }
    },
    // mapDispatchToProps
    dispatch => ({
        convertToSteem: (e) => {
            e.preventDefault()
            const name = 'convertToSteem'
            dispatch(g.actions.showDialog({name}))
        },
        showChangePassword: (username) => {
            const name = 'changePassword'
            dispatch(g.actions.remove({key: name}))
            dispatch(g.actions.showDialog({name, params: {username}}))
        },
    })
)(UserWallet)
