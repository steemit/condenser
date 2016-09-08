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
import {steemTip, powerTip, dollarTip, valueTip, savingsTip, transferTips} from 'app/utils/Tips'
import {numberWithCommas, vestingSteem} from 'app/utils/StateFunctions'
import FoundationDropdownMenu from 'app/components/elements/FoundationDropdownMenu'

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

        const showTransfer = (asset, transferType, e) => {
            e.preventDefault();
            this.props.showTransfer({
                to: (isMyAccount ? null : account.name),
                asset, transferType
            });
        };

        const {savings_balance, savings_sbd_balance} = account

        const powerDown = (cancel, e) => {
            e.preventDefault()
            const {name} = account
            const vesting_shares = cancel ? '0.000000 VESTS' : account.vesting_shares
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

        let total_value = '$' + numberWithCommas(
            (((vesting_steemf + balance_steem) * price_per_steem) + sbd_balance
        ).toFixed(2))

        /// transfer log
        let idx = 0
        const transfer_log = account.transfer_history.map(item => {
            const data = item[1].op[1]
            // Filter out rewards
            if (item[1].op[0] === "curation_reward" || item[1].op[0] === "author_reward") {
                return null;
            }

            if(data.sbd_payout === '0.000 SBD' && data.vesting_payout === '0.000000 VESTS')
                return null
            return <TransferHistoryRow key={idx++} op={item} context={account.name} />;
        }).filter(el => !!el);
        transfer_log.reverse();

        let steem_menu = [
            { value: 'Transfer', link: '#', onClick: showTransfer.bind( this, 'STEEM', 'Transfer to Account' ) },
            { value: 'Transfer to Savings', link: '#', onClick: showTransfer.bind( this, 'STEEM', 'Transfer to Savings' ) },
            { value: 'Power Up', link: '#', onClick: showTransfer.bind( this, 'VESTS', 'Transfer to Account' ) },
        ]
        let power_menu = [
            { value: 'Power Down', link: '#', onClick: powerDown.bind(this, false) }
        ]
        if(isMyAccount) {
            steem_menu.push({ value: 'Deposit', link: '#', onClick: onShowDepositSteem })
            steem_menu.push({ value: 'Buy or Sell', link: '/market' })
            power_menu.push({ value: 'Deposit', link: '#', onClick: onShowDepositPower })
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
        const isWithdrawScheduled = new Date(account.next_vesting_withdrawal + 'Z').getTime() > Date.now()
        const depositReveal = showDeposit && <div>
            <Reveal onHide={onShowDeposit} show={showDeposit}>
                <CloseButton onClick={onShowDeposit} />
                <BlocktradesDeposit onClose={onShowDeposit} outputCoinType={depositType} />
            </Reveal>
        </div>

        const steem_balance_str = numberWithCommas(balance_steem.toFixed(3)) // formatDecimal(balance_steem, 3)
        const power_balance_str = numberWithCommas(vesting_steem) // formatDecimal(vesting_steem, 3)
        const sbd_balance_str = numberWithCommas('$' + sbd_balance.toFixed(3)) // formatDecimal(account.sbd_balance, 3)

        const savings_menu = [
            { value: 'Withdraw Steem', link: '#', onClick: showTransfer.bind( this, 'STEEM', 'Savings Withdraw' ) },
        ]
        const savings_sbd_menu = [
            { value: 'Withdraw Steem Dollars', link: '#', onClick: showTransfer.bind( this, 'SBD', 'Savings Withdraw' ) },
        ]

        return (<div className="UserWallet">
            <div className="row">
                <div className="column small-12 medium-8">
                    <h4>BALANCES</h4>
                </div>
                {isMyAccount && <div className="column small-12 medium-4">
                    <button className="UserWallet__buysp button hollow float-right " onClick={this.onShowDepositSteem}>Buy Steem or Steem Power</button>
                </div>}
            </div>
            <br />
            <div className="UserWallet__balance row">
                <div className="column small-12 medium-8">
                    STEEM<br /><span className="secondary">{steemTip.split(".").map((a, index) => {if (a) {return <div key={index}>{a}.</div>;} return null;})}</span>
                </div>
                <div className="column small-12 medium-4">
                    {isMyAccount ?
                    <FoundationDropdownMenu dropdownPosition="bottom" dropdownAlignment="right" label={steem_balance_str + ' STEEM'} menu={steem_menu} />
                    : steem_balance_str + ' STEEM'}
                </div>
            </div>
            <div className="UserWallet__balance row">
                <div className="column small-12 medium-8">
                    STEEM POWER<br /><span className="secondary">{powerTip.split(".").map((a, index) => {if (a) {return <div key={index}>{a}.</div>;} return null;})}</span>
                </div>
                <div className="column small-12 medium-4">
                    {isMyAccount ?
                    <FoundationDropdownMenu dropdownPosition="bottom" dropdownAlignment="right" label={power_balance_str + ' STEEM'} menu={power_menu} />
                    : power_balance_str + ' STEEM'}
                </div>
            </div>
            <div className="UserWallet__balance row">
                <div className="column small-12 medium-8">
                    STEEM DOLLARS<br /><span className="secondary">{dollarTip}</span>
                </div>
                <div className="column small-12 medium-4">
                    {isMyAccount ?
                    <FoundationDropdownMenu dropdownPosition="bottom" dropdownAlignment="right" label={sbd_balance_str} menu={dollar_menu} />
                    : sbd_balance_str}
                </div>
            </div>
            <div className="UserWallet__balance row">
                <div className="column small-12 medium-8">
                    SAVINGS<br /><span className="secondary">{savingsTip}</span>
                </div>
                <div className="column small-12 medium-4">
                    {isMyAccount ?
                    <FoundationDropdownMenu dropdownPosition="bottom" dropdownAlignment="right" label={savings_balance} menu={savings_menu} />
                    : savings_balance}
                    <br />
                    {isMyAccount ?
                    <FoundationDropdownMenu dropdownPosition="bottom" dropdownAlignment="right" label={savings_sbd_balance} menu={savings_sbd_menu} />
                    : savings_sbd_balance}
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
                    {total_value}
                </div>
            </div>
            <div className="UserWallet__balance row">
                <div className="column small-12">
                    {isWithdrawScheduled && <span>The next power down is scheduled to happen&nbsp; <TimeAgoWrapper date={account.next_vesting_withdrawal} />.</span> }
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
        return {
            ...ownProps,
            price_per_steem
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
