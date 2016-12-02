/* eslint react/prop-types: 0 */
import React from 'react';
import {connect} from 'react-redux'
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
import { translate, translateNumber } from 'app/Translator';
import { localizedCurrency } from 'app/components/elements/LocalizedCurrency';
import { APP_NAME_LATIN, LIQUID_TOKEN, DEBT_TOKEN, CURRENCY_SIGN, VESTING_TOKEN, DEBT_TOKEN_SHORT, LIQUID_TICKER, VEST_TICKER, DEBT_TICKER } from 'config/client_config';
import {steemTip, powerTip, valueTip, savingsTip} from 'app/utils/Tips'
import {numberWithCommas, vestingSteem} from 'app/utils/StateFunctions'
import FoundationDropdownMenu from 'app/components/elements/FoundationDropdownMenu'
import WalletSubMenu from 'app/components/elements/WalletSubMenu'

// normalize app name
const appName = APP_NAME_LATIN.toLowerCase()

class UserWallet extends React.Component {
    constructor() {
        super()
        this.state = {}
        this.onShowDeposit = () => {this.setState({showDeposit: !this.state.showDeposit})}
        this.onShowDepositSteem = (e) => {
            e.preventDefault()
            this.trackAnalytics('buy golos button clicked in user\'s wallet')
            this.setState({showDeposit: !this.state.showDeposit, depositType: LIQUID_TICKER})
        }
        this.onShowDepositPower = (e) => {
            e.preventDefault()
            this.setState({showDeposit: !this.state.showDeposit, depositType: VEST_TICKER})
        }
        // this.onShowDeposit = this.onShowDeposit.bind(this)
        this.trackAnalytics = eventType => {
            console.log(eventType)
            analytics.track(eventType)
        }
    }
    render() {
        const {state: {showDeposit, depositType, toggleDivestError}, onShowDeposit, onShowDepositSteem, onShowDepositPower} = this
        const {convertToSteem, price_per_steem} = this.props
        let account          = this.props.account;
        let current_user     = this.props.current_user;
        let gprops           = this.props.global.getIn( ['props'] ).toJS();

        let vesting_steemf = vestingSteem(account, gprops);
        let vesting_steem = vesting_steemf.toFixed(3);

        let isMyAccount = current_user && current_user.get('username') === account.name;

        const disabledWarning = false;
        // isMyAccount = false; // false to hide wallet transactions

        const showTransfer = (asset, e) => {
            e.preventDefault();
            if (!current_user) {
                this.props.login();
                return;
            }
            this.props.showTransfer({to: (isMyAccount ? null : account.name), asset});
        };

        const powerDown = (cancel, e) => {
            e.preventDefault()
            const {name} = account
            const vesting_shares = cancel ? '0.000000 '+VEST_TICKER : account.vesting_shares
            this.setState({toggleDivestError: null})
            const errorCallback = e2 => {this.setState({toggleDivestError: e2.toString()})}
            const successCallback = () => {this.setState({toggleDivestError: null})}
            this.props.withdrawVesting({account: name, vesting_shares, errorCallback, successCallback})
        }


        /// vests + steem balance
        let balance_steem = parseFloat(account.balance.split(' ')[0]);
        let total_steem   = (vesting_steemf + balance_steem).toFixed(3);
        let divesting = parseFloat(account.vesting_withdraw_rate.split(' ')[0]) > 0.000000;
        const sbd_balance = parseFloat(account.sbd_balance)

        const total_value = (((vesting_steemf + balance_steem) * price_per_steem) + sbd_balance) || 0
        /// transfer log
        let idx = 0
        const transfer_log = account.transfer_history.map(item => {
            const data = item[1].op[1]
            // Filter out rewards
            if (item[1].op[0] === "curation_reward" || item[1].op[0] === "author_reward") {
                return null;
            }

            if(data.sbd_payout === '0.000 ' + DEBT_TICKER && data.vesting_payout === '0.000000 ' + VEST_TICKER)
                return null
            return <TransferHistoryRow key={idx++} op={item} context={account.name} />;
        }).filter(el => !!el);
        transfer_log.reverse();

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
        const isWithdrawScheduled = new Date(account.next_vesting_withdrawal + 'Z').getTime() > Date.now()
        const depositReveal = showDeposit && <div>
            <Reveal onHide={onShowDeposit} show={showDeposit}>
                <CloseButton onClick={onShowDeposit} />
                <BlocktradesDeposit onClose={onShowDeposit} outputCoinType={depositType} />
            </Reveal>
        </div>

        const steem_balance_str = translateNumber(balance_steem.toFixed(3)) // formatDecimal(balance_steem, 3)
        const power_balance_str = translateNumber(vesting_steem) // formatDecimal(vesting_steem, 3)
        const sbd_balance_str = localizedCurrency(sbd_balance.toFixed(3)) // formatDecimal(account.sbd_balance, 3)
        const savings_balance_str = translateNumber(saving_balance_steem.toFixed(3)) + ' ' + LIQUID_TOKEN
        const savings_sbd_balance_str = localizedCurrency(sbd_balance_savings.toFixed(3))

        const savings_menu = [
            { value: translate('withdraw_LIQUID_TOKEN'), link: '#', onClick: showTransfer.bind( this, 'STEEM', 'Savings Withdraw' ) },
        ]
        const savings_sbd_menu = [
            { value: translate('witdhdraw_DEBT_TOKEN'), link: '#', onClick: showTransfer.bind( this, 'SBD', 'Savings Withdraw' ) },
        ]
        // set dynamic secondary wallet values
        const sbdInterest = this.props.sbd_interest / 100
        const sbdMessage = <span>{translate('tokens_worth_about_AMOUNT_of_LIQUID_TOKEN_currenlty_collecting_sbdinterest_apr', {amount: localizedCurrency(1), sbdInterest})}.</span>

        return (<div className="UserWallet">
            <div className="row">
                <div className="columns small-10 medium-12 medium-expand">
                    {isMyAccount ? <WalletSubMenu account_name={account.name} /> : <div><br /><h4 className="uppercase">translate('balances')</h4><br /></div>}
                </div>
                <div className="columns shrink">
                    {isMyAccount && <button className="UserWallet__buysp button hollow" onClick={this.onShowDepositSteem}>{translate('buy_LIQUID_TOKEN_or_VESTING_TOKEN')}</button>}
                </div>
            </div>
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
                        <div>{translate('LIQUID_TOKEN_can_be_converted_to_INVEST_TOKEN_in_a_process_called_powering_up')}</div>
                    </span>
                </div>
                <div className="column small-12 medium-4">
                    {isMyAccount ?
                    <FoundationDropdownMenu onClick={this.trackAnalytics.bind(this, 'golos dropdown in user\'s profile clicked')} className="Wallet_dropdown" dropdownPosition="bottom" dropdownAlignment="right" label={steem_balance_str + ' ' + LIQUID_TOKEN} menu={steem_menu} />
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
                    <FoundationDropdownMenu onClick={this.trackAnalytics.bind(this, 'golos power dropdown in user\'s profile clicked')} className="Wallet_dropdown" dropdownPosition="bottom" dropdownAlignment="right" label={power_balance_str + ' ' + LIQUID_TOKEN} menu={power_menu} />
                    : power_balance_str + ' ' + LIQUID_TOKEN}
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
                <div className="column small-12 medium-8">
                    <span className="uppercase">{translate('savings')}</span>SAVINGS<br /><span className="secondary">{savingsTip}</span>
                </div>
                <div className="column small-12 medium-4">
                    {isMyAccount ?
                    <FoundationDropdownMenu onClick={this.trackAnalytics.bind(this, 'gbg dropdown in user\'s profile clicked')} className="Wallet_dropdown" dropdownPosition="bottom" dropdownAlignment="right" label={savings_balance_str} menu={savings_menu} />
                    : savings_balance_str}
                    <br />
                    {isMyAccount ?
                    <FoundationDropdownMenu onClick={this.trackAnalytics.bind(this, 'gbg dropdown in user\'s profile clicked')} className="Wallet_dropdown" dropdownPosition="bottom" dropdownAlignment="right" label={savings_sbd_balance_str} menu={savings_sbd_menu} />
                    : savings_sbd_balance_str}
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
                    {localizedCurrency(total_value)}
                </div>
            </div>
            <div className="UserWallet__balance row">
                <div className="column small-12">
                    {isWithdrawScheduled && <span>{translate('next_power_down_is_scheduled_to_happen_at')}&nbsp; <TimeAgoWrapper date={account.next_vesting_withdrawal} />.</span> }
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
  console.log(pair);
  try {
    return parseFloat(pair[0][0])/parseFloat(pair[1][0])
  } catch(e) {
    console.log(error);
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
            console.log(priceGBGperGOLOS, "GBG/GOLOS :::: GOLOS/GBG", priceGOLOSperGBG)

            console.log(feed_price.toJS(), "OOOOOO")
            price_per_steem = priceGBGperGOLOS;
            console.log (price_per_steem, " set price per steem")
        }
        const savings_withdraws = state.user.get('savings_withdraws')
        const sbd_interest = state.global.get('props').get('sbd_interest_rate')
        return {
            ...ownProps,
            price_per_steem,
            savings_withdraws,
            sbd_interest
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
