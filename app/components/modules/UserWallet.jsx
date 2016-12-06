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
import { translate } from 'app/Translator';

const assetPrecision = 1000;
const BLOCKTRADES_ENABLED = false;

class UserWallet extends React.Component {
    constructor() {
        super()
        this.state = {}
        this.onShowDeposit = () => {this.setState({showDeposit: !this.state.showDeposit})}
        this.onShowDepositSteem = (e) => {
            e.preventDefault()
            this.setState({showDeposit: !this.state.showDeposit, depositType: 'STEEM'})
        }
        this.onShowDepositPower = (e) => {
            e.preventDefault()
            this.setState({showDeposit: !this.state.showDeposit, depositType: 'VESTS'})
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
            const vesting_shares = cancel ? '0.000000 VESTS' : account.get('vesting_shares')
            this.setState({toggleDivestError: null})
            const errorCallback = e2 => {this.setState({toggleDivestError: e2.toString()})}
            const successCallback = () => {this.setState({toggleDivestError: null})}
            this.props.withdrawVesting({account: name, vesting_shares, errorCallback, successCallback})
        }

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

        const balance_steem = parseFloat(account.get('balance').split(' ')[0]);
        const saving_balance_steem = parseFloat(savings_balance.split(' ')[0]);
        const total_steem = (vesting_steemf + balance_steem + saving_balance_steem + savings_pending).toFixed(3);
        const divesting = parseFloat(account.get('vesting_withdraw_rate').split(' ')[0]) > 0.000000;
        const sbd_balance = parseFloat(account.get('sbd_balance'))
        const sbd_balance_savings = parseFloat(savings_sbd_balance.split(' ')[0]);
        const total_sbd = sbd_balance + sbd_balance_savings + savings_sbd_pending
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
        let total_value = '$' + numberWithCommas(
            ((total_steem * price_per_steem) + total_sbd
        ).toFixed(2))

        // format spacing on estimated value based on account state
        let estimate_output = <p>{total_value}</p>;
        if (isMyAccount) {
            estimate_output = <p>{total_value}&nbsp; &nbsp; &nbsp;</p>;
        }

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

            if(data.sbd_payout === '0.000 SBD' && data.vesting_payout === '0.000000 VESTS')
                return null
            return <TransferHistoryRow key={idx++} op={item.toJS()} context={account.get('name')} />;
        }).filter(el => !!el).reverse();

        let steem_menu = [
            { value: 'Transfer', link: '#', onClick: showTransfer.bind( this, 'STEEM', 'Transfer to Account' ) },
            { value: 'Transfer to Savings', link: '#', onClick: showTransfer.bind( this, 'STEEM', 'Transfer to Savings' ) },
            { value: 'Power Up', link: '#', onClick: showTransfer.bind( this, 'VESTS', 'Transfer to Account' ) },
        ]
        let power_menu = [
            { value: 'Power Down', link: '#', onClick: powerDown.bind(this, false) }
        ]
        if(isMyAccount) {
            if(BLOCKTRADES_ENABLED) steem_menu.push({ value: 'Deposit', link: '#', onClick: onShowDepositSteem })
            steem_menu.push({ value: 'Buy or Sell', link: '/market' })
            if(BLOCKTRADES_ENABLED) power_menu.push({ value: 'Deposit', link: '#', onClick: onShowDepositPower })
        }
        if( divesting ) {
            power_menu.push( { value: 'Cancel Power Down', link:'#', onClick: powerDown.bind(this,true) } );
        }

        let dollar_menu = [
            { value: 'Transfer', link: '#', onClick: showTransfer.bind( this, 'SBD', 'Transfer to Account' ) },
            { value: 'Transfer to Savings', link: '#', onClick: showTransfer.bind( this, 'SBD', 'Transfer to Savings' ) },
            { value: 'Buy or Sell', link: '/market' },
            { value: 'Convert to STEEM', link: '#', onClick: convertToSteem },
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
                    {isMyAccount && BLOCKTRADES_ENABLED && <button className="UserWallet__buysp button hollow" onClick={this.onShowDepositSteem}>Buy Steem or Steem Power</button>}
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
                    {steemOrders ? <div style={{paddingRight: "0.85rem"}}><Link to="/market"><Tooltip t={translate('open_orders')}>(+{steem_orders_balance_str} STEEM)</Tooltip></Link></div> : null}
                </div>
            </div>
            <div className="UserWallet__balance row">
                <div className="column small-12 medium-8">
                    STEEM POWER<br /><span className="secondary">{powerTip.split(".").map((a, index) => {if (a) {return <div key={index}>{a}.</div>;} return null;})}</span>
                </div>
                <div className="column small-12 medium-4">
                    {isMyAccount ?
                    <FoundationDropdownMenu className="Wallet_dropdown" dropdownPosition="bottom" dropdownAlignment="right" label={power_balance_str + ' STEEM'} menu={power_menu} />
                    : power_balance_str + ' STEEM'}
                </div>
            </div>
            <div className="UserWallet__balance row">
                <div className="column small-12 medium-8">
                    STEEM DOLLARS<br /><span className="secondary">{sbdMessage}</span>
                </div>
                <div className="column small-12 medium-4">
                    {isMyAccount ?
                    <FoundationDropdownMenu className="Wallet_dropdown" dropdownPosition="bottom" dropdownAlignment="right" label={sbd_balance_str} menu={dollar_menu} />
                    : sbd_balance_str}
                    {sbdOrders ? <div style={{paddingRight: "0.85rem"}}><Link to="/market"><Tooltip t={translate('open_orders')}>(+{sbd_orders_balance_str})</Tooltip></Link></div> : null}
                </div>
            </div>
            <div className="UserWallet__balance row">
                <div className="column small-12 medium-8">
                    SAVINGS<br /><span className="secondary">{savingsTip}</span>
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
            <div className="row">
                <div className="column small-12">
                    <div style={{borderTop: '1px solid #eee', paddingTop: '0.25rem', marginTop: '0.25rem'}}>
                    </div>
                </div>
            </div>
            <div className="UserWallet__balance row">
                <div className="column small-12 medium-8">
                    Estimated Account Value<br /><span className="secondary">{valueTip}</span>
                </div>
                <div className="column small-12 medium-4">
                    {estimate_output}
                </div>
            </div>
            <div className="UserWallet__balance row">
                <div className="column small-12">
                    {isWithdrawScheduled && <span>The next power down is scheduled to happen&nbsp; <TimeAgoWrapper date={account.get('next_vesting_withdrawal')} />.</span> }
                    {/*toggleDivestError && <div className="callout alert">{toggleDivestError}</div>*/}
                    <TransactionError opType="withdraw_vesting" />
                </div>
            </div>
            {disabledWarning && <div className="row">
                <div className="column small-12">
                    <div className="callout warning">
                        Transfers are temporary disabled.
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
                    <h4>HISTORY</h4>
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
        let price_per_steem = undefined
        const feed_price = state.global.get('feed_price')
        if(feed_price && feed_price.has('base') && feed_price.has('quote')) {
            const {base, quote} = feed_price.toJS()
            if(/ SBD$/.test(base) && / STEEM$/.test(quote))
                price_per_steem = parseFloat(base.split(' ')[0])
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
