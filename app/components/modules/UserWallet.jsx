/* eslint react/prop-types: 0 */
import React from 'react';
import {connect} from 'react-redux'
import {Link} from 'react-router'
import g from 'app/redux/GlobalReducer'
import SavingsWithdrawHistory from 'app/components/elements/SavingsWithdrawHistory';
import TransferHistoryRow from 'app/components/cards/TransferHistoryRow';
import TransactionError from 'app/components/elements/TransactionError';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import BlocktradesDeposit from 'app/components/modules/BlocktradesDeposit';
import Reveal from 'react-foundation-components/lib/global/reveal'
import CloseButton from 'react-foundation-components/lib/global/close-button';
import {steemTip, powerTip, valueTip, savingsTip} from 'app/utils/Tips'
import {numberWithCommas, vestingSteem} from 'app/utils/StateFunctions'
import FoundationDropdownMenu from 'app/components/elements/FoundationDropdownMenu'
import WalletSubMenu from 'app/components/elements/WalletSubMenu'
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import Tooltip from 'app/components/elements/Tooltip'
import { translate, translateNumber } from 'app/Translator';
import {prettyDigit} from 'app/utils/ParsersAndFormatters';
import LocalizedCurrency from 'app/components/elements/LocalizedCurrency';
import { APP_NAME_LATIN, LIQUID_TOKEN, LIQUID_TOKEN_UPPERCASE, DEBT_TOKEN, CURRENCY_SIGN, VESTING_TOKEN, DEBT_TOKEN_SHORT, LIQUID_TICKER, VEST_TICKER, DEBT_TICKER } from 'config/client_config';
import {List} from 'immutable'

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
        const {convertToSteem, price_per_golos, savings_withdraws, account,
            current_user, open_orders} = this.props
        const gprops = this.props.gprops.toJS();

        if (!account) return null;
        let vesting_steemf = vestingSteem(account.toJS(), gprops);
        let vesting_steem = vesting_steemf.toFixed(3);

        let isMyAccount = current_user && current_user.get('username') === account.get('name');

        const disabledWarning = false;
        // isMyAccount = false; // false to hide wallet transactions

        const showTransfer = (asset, transferType, e) => {
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
            const vesting_shares = cancel ? '0.000000 GESTS' : account.get('vesting_shares')
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
                if(asset === LIQUID_TICKER)
                    savings_pending += parseFloat(amount)
                else {
                    if(asset === DEBT_TICKER)
                        savings_sbd_pending += parseFloat(amount)
                }
            })
        }

        // Sum conversions
        // Sum conversions
        let conversionValue = 0;
        const currentTime = (new Date()).getTime();
        const conversions = account.get('other_history', List()).reduce( (out, item) => {
            if(item.getIn([1, 'op', 0], "") !== 'convert') return out;

            const timestamp = new Date(item.getIn([1, 'timestamp'])).getTime();
            const finishTime = timestamp + (86400000 * (timestamp <= 1481040000000 ? 7 : 3.5)); // add conversion delay before/after hardfork change
            // const finishTime = timestamp + (86400000 * 3.5); // add 3.5day conversion delay
            if(finishTime < currentTime) return out;

            const amount = parseFloat(item.getIn([1, 'op', 1, 'amount']).replace(' ' + DEBT_TICKER, ""));
            conversionValue += amount;

            return out.concat([
                <div key={item.get(0)}>
                    <Tooltip t={translate('conversion_complete_tip') + ": " + new Date(finishTime).toLocaleString()}>
                        <span>(+{translate('in_conversion', {amount: translateNumber(amount.toFixed(3)) + ' ' + DEBT_TICKER})})</span>
                    </Tooltip>
                </div>
            ]);
        }, [])


        const balance_steem = parseFloat(account.get('balance').split(' ')[0]);
        const saving_balance_steem = parseFloat(savings_balance.split(' ')[0]);
        const divesting = parseFloat(account.get('vesting_withdraw_rate').split(' ')[0]) > 0.000000;
        const sbd_balance = parseFloat(account.get('sbd_balance'))
        const sbd_balance_savings = parseFloat(savings_sbd_balance.split(' ')[0]);
        const sbdOrders = (!open_orders || !isMyAccount) ? 0 : open_orders.reduce((o, order) => {
            if (order.sell_price.base.indexOf(DEBT_TICKER) !== -1) {
                o += order.for_sale;
            }
            return o;
        }, 0) / assetPrecision;

        const steemOrders = (!open_orders || !isMyAccount) ? 0 : open_orders.reduce((o, order) => {
            if (order.sell_price.base.indexOf(LIQUID_TICKER) !== -1) {
                o += order.for_sale;
            }
            return o;
        }, 0) / assetPrecision;

        // set displayed estimated value
        const total_sbd = sbd_balance + sbd_balance_savings + savings_sbd_pending + sbdOrders + conversionValue;
        const total_steem = vesting_steemf + balance_steem + saving_balance_steem + savings_pending + steemOrders;
        const total_value = Number(((total_steem * price_per_golos) + total_sbd).toFixed(3))
        // format spacing on estimated value based on account state
        const estimate_output = <LocalizedCurrency amount={total_value} />

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

            if(data.sbd_payout === '0.000 GBG' && data.vesting_payout === '0.000000 GESTS')
                return null
            return <TransferHistoryRow key={idx++} op={item.toJS()} context={account.get('name')} />;
        }).filter(el => !!el).reverse();

        let steem_menu = [
            { value: translate('transfer'), link: '#', onClick: showTransfer.bind( this, LIQUID_TICKER, 'Transfer to Account' ) },
            { value: translate('transfer_to_savings'), link: '#', onClick: showTransfer.bind( this, LIQUID_TICKER, 'Transfer to Savings' ) },
            { value: translate('power_up'), link: '#', onClick: showTransfer.bind( this, VEST_TICKER, 'Transfer to Account' ) },
        ]
        let power_menu = [
            { value: translate('power_down'), link: '#', onClick: powerDown.bind(this, false) }
        ]
        if( divesting ) {
            power_menu.pop()
            power_menu.push( { value: translate('cancel_power_down'), link:'#', onClick: powerDown.bind(this,true) } );
        }
        if(isMyAccount) {
            // steem_menu.push({ value: translate('deposit'), link: '#', onClick: onShowDepositSteem })
            steem_menu.push({ value: translate('buy_or_sell'), link: '/market' })
            // power_menu.push({ value: translate('deposit'), link: '#', onClick: onShowDepositPower })
        }

        let dollar_menu = [
            { value: translate('transfer'), link: '#', onClick: showTransfer.bind( this, DEBT_TICKER, 'Transfer to Account' ) },
            { value: translate('transfer_to_savings'), link: '#', onClick: showTransfer.bind( this, DEBT_TICKER, 'Transfer to Savings' ) },
            { value: translate('buy_or_sell'), link: '/market' },
            { value: translate('convert_to_LIQUID_TOKEN'), link: '#', onClick: convertToSteem },
        ]
        const isWithdrawScheduled = new Date(account.get('next_vesting_withdrawal') + 'Z').getTime() > Date.now()
        const depositReveal = showDeposit && <div>
            <Reveal onHide={onShowDeposit} show={showDeposit}>
                <CloseButton onClick={onShowDeposit} />
                <BlocktradesDeposit onClose={onShowDeposit} outputCoinType={depositType} />
            </Reveal>
        </div>

        const steem_balance_str = translateNumber(balance_steem.toFixed(3)) + ' ' + LIQUID_TOKEN_UPPERCASE // formatDecimal(balance_steem, 3)
        const steem_orders_balance_str = translateNumber(steemOrders.toFixed(3)) + ' ' + LIQUID_TOKEN_UPPERCASE
        const power_balance_str = translateNumber(vesting_steem) + ' ' + LIQUID_TOKEN_UPPERCASE // formatDecimal(vesting_steem, 3)
        const savings_balance_str = translateNumber(saving_balance_steem.toFixed(3)) + ' ' + LIQUID_TOKEN_UPPERCASE

        // const sbd_balance_str = translateNumber('$' + sbd_balance.toFixed(3)) // formatDecimal(account.sbd_balance, 3)
        const sbd_balance_str = translateNumber(sbd_balance.toFixed(3)) + ' ' + DEBT_TICKER // formatDecimal(account.sbd_balance, 3)
        // const sbd_orders_balance_str = translateNumber('$' + sbdOrders.toFixed(3))
        const sbd_orders_balance_str = translateNumber(sbdOrders.toFixed(3)) + ' ' + DEBT_TICKER // formatDecimal(account.sbd_balance, 3)
        // const savings_sbd_balance_str = translateNumber('$' + sbd_balance_savings.toFixed(3))
        const savings_sbd_balance_str = translateNumber(sbd_balance_savings.toFixed(3)) + ' ' + DEBT_TICKER // formatDecimal(account.sbd_balance, 3)

        const savings_menu = [
            { value: translate('withdraw_steem'), link: '#', onClick: showTransfer.bind( this, LIQUID_TICKER, 'Savings Withdraw' ) },
        ]
        const savings_sbd_menu = [
            { value: translate('withdraw_steem_dollars'), link: '#', onClick: showTransfer.bind( this, DEBT_TICKER, 'Savings Withdraw' ) },
        ]
        // set dynamic secondary wallet values
        const sbdInterest = this.props.sbd_interest / 100
        const sbdMessage = translate('tokens_worth_about_AMOUNT_of_LIQUID_TOKEN') //TODO: add APR param to xlation

        return (<div className="UserWallet">
            <div className="row">
                <div className="columns small-10 medium-12 medium-expand">
                    {isMyAccount ? <WalletSubMenu account_name={account.get('name')} /> : <div><br /><h4>{translate('balances').toUpperCase()}</h4><br /></div>}
                </div>
                <div className="columns shrink">
                    {/* isMyAccount && <button className="UserWallet__buysp button hollow" onClick={this.onShowDepositSteem}>{translate('buy_LIQUID_TOKEN_or_VESTING_TOKEN')}</button> */}
                </div>
            </div>


            <div className="UserWallet__balance row">
                <div className="column small-12 medium-8">
                    {LIQUID_TOKEN.toUpperCase()}<br /><span className="secondary">{steemTip.split(".").map((a, index) => {if (a) {return <div key={index}>{a}.</div>;} return null;})}</span>
                </div>
                <div className="column small-12 medium-4">
                    {isMyAccount ?
                    <FoundationDropdownMenu className="Wallet_dropdown" dropdownPosition="bottom" dropdownAlignment="right" label={steem_balance_str} menu={steem_menu} />
                    : steem_balance_str}
                    {steemOrders ? <div style={{paddingRight: isMyAccount ? "0.85rem" : null}}><Link to="/market"><Tooltip t={translate('open_orders')}>(+{steem_orders_balance_str})</Tooltip></Link></div> : null}
                </div>
            </div>


            <div className="UserWallet__balance row zebra">
                <div className="column small-12 medium-8">
                    {VESTING_TOKEN.toUpperCase()}<br /><span className="secondary">{powerTip.split(".").map((a, index) => {if (a) {return <div key={index}>{a}.</div>;} return null;})}</span>
                </div>
                <div className="column small-12 medium-4">
                    {isMyAccount ?
                    <FoundationDropdownMenu className="Wallet_dropdown" dropdownPosition="bottom" dropdownAlignment="right" label={power_balance_str} menu={power_menu} />
                    : power_balance_str}
                </div>
            </div>


            <div className="UserWallet__balance row">
                <div className="column small-12 medium-8">
                    {DEBT_TOKEN.toUpperCase()}<br /><span className="secondary">{sbdMessage}</span>
                </div>
                <div className="column small-12 medium-4">
                    {isMyAccount ?
                    <FoundationDropdownMenu className="Wallet_dropdown" dropdownPosition="bottom" dropdownAlignment="right" label={sbd_balance_str} menu={dollar_menu} />
                    : sbd_balance_str}
                    {sbdOrders ? <div style={{paddingRight: isMyAccount ? "0.85rem" : null}}><Link to="/market"><Tooltip t={translate('open_orders')}>(+{sbd_orders_balance_str})</Tooltip></Link></div> : null}
                    {conversions}
                </div>
            </div>


            <div className="UserWallet__balance row zebra">
                <div className="column small-12 medium-8">
                    {translate('savings').toUpperCase()}<br /><span className="secondary">{savingsTip}</span>
                </div>
                <div className="column small-12 medium-4">
                    {isMyAccount ?
                    <FoundationDropdownMenu className="Wallet_dropdown" dropdownPosition="bottom" dropdownAlignment="right" label={savings_balance_str} menu={savings_menu} />
                    : savings_balance_str}
                    <br />
                    {isMyAccount ?
                    <FoundationDropdownMenu className="Wallet_dropdown" dropdownPosition="bottom" dropdownAlignment="right" label={savings_sbd_balance_str} menu={savings_sbd_menu} />
                    : savings_sbd_balance_str}
                </div>
            </div>
            <div className="UserWallet__balance row">
                <div className="column small-12 medium-8">
                    {translate('estimated_account_value')}<br /><span className="secondary">{valueTip}</span>
                </div>
                <div className="column small-12 medium-4">
                    {estimate_output}
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
                        {translate('transfers_are_temporary_disabled')}
                    </div>
                </div>
            </div>}
            <div className="row">
                <div className="column small-12">
                    <hr />
                </div>
            </div>

            {isMyAccount && <SavingsWithdrawHistory />}

            <div className="row">
                <div className="column small-12">
                    {/** history */}
                    <h4>{translate('history').toUpperCase()}</h4>
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

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        let price_per_golos = undefined
        const feed_price = state.global.get('feed_price')
        if(feed_price && feed_price.has('base') && feed_price.has('quote')) {
            const {base, quote} = feed_price.toJS()
            if(/ GBG$/.test(base) && / GOLOS$/.test(quote))
                price_per_golos = parseFloat(base.split(' ')[0]) / parseFloat(quote.split(' ')[0])
        }
        const savings_withdraws = state.user.get('savings_withdraws')
        const gprops = state.global.get('props');
        const sbd_interest = gprops.get('sbd_interest_rate')
        return {
            ...ownProps,
            open_orders: state.market.get('open_orders'),
            price_per_golos,
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
