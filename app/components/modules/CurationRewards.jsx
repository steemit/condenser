/* eslint react/prop-types: 0 */
import React from 'react';
import {connect} from 'react-redux'
import TransferHistoryRow from 'app/components/cards/TransferHistoryRow';
import {numberWithCommas, vestsToSp, assetFloat} from 'app/utils/StateFunctions'
import { translate } from 'app/Translator';
import { APP_NAME, DEBT_TOKEN, DEBT_TOKEN_SHORT, LIQUID_TOKEN, CURRENCY_SIGN,
VESTING_TOKEN, VESTING_TOKENS, LIQUID_TICKER, VEST_TICKER } from 'config/client_config';

class CurationRewards extends React.Component {
    constructor() {
        super()
        this.state = {historyIndex: 0}
        this.onShowDeposit = () => {this.setState({showDeposit: !this.state.showDeposit})}
        this.onShowDepositSteem = () => {
            this.setState({showDeposit: !this.state.showDeposit, depositType: LIQUID_TICKER})
        }
        this.onShowDepositPower = () => {
            this.setState({showDeposit: !this.state.showDeposit, depositType: VEST_TICKER})
        }
        // this.onShowDeposit = this.onShowDeposit.bind(this)
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            nextProps.account.transfer_history.length !== this.props.account.transfer_history.length ||
            nextState.historyIndex !== this.state.historyIndex);
    }

    _setHistoryPage(back) {
        const newIndex = this.state.historyIndex + (back ? 10 : -10);
        this.setState({historyIndex: Math.max(0, newIndex)});
    }

    render() {
        const {state: {historyIndex}} = this
        const account = this.props.account;

        /// transfer log
        let rewards24 = 0, rewardsWeek = 0, totalRewards = 0;
        let today = new Date();
        let oneDay = 86400 * 1000;
        let yesterday = new Date(today.getTime() - oneDay ).getTime();
        let lastWeek = new Date(today.getTime() - 7 * oneDay ).getTime();

        let firstDate, finalDate;
        let curation_log = account.transfer_history.map((item, index) => {
            // Filter out rewards
            if (item[1].op[0] === "curation_reward") {
                if (!finalDate) {
                    finalDate = new Date(item[1].timestamp).getTime();
                }
                firstDate = new Date(item[1].timestamp).getTime();
                const vest = assetFloat(item[1].op[1].reward, VEST_TICKER);
                if (new Date(item[1].timestamp).getTime() > yesterday) {
                    rewards24 += vest;
                    rewardsWeek += vest;
                } else if (new Date(item[1].timestamp).getTime() > lastWeek) {
                    rewardsWeek += vest;
                }
                totalRewards += vest;
                return <TransferHistoryRow key={index} op={item} context={account.name} />
            }
            return null;
        }).filter(el => !!el);
        let currentIndex = -1;
        const curationLength = curation_log.length;
        const daysOfCuration = (firstDate - finalDate) / oneDay || 1;
        const averageCuration = !daysOfCuration ? 0 : totalRewards / daysOfCuration;
        const hasFullWeek = daysOfCuration >= 7;
        const limitedIndex = Math.min(historyIndex, curationLength - 10);
        curation_log = curation_log.reverse().filter(() => {
            currentIndex++;
            return currentIndex >= limitedIndex && currentIndex < limitedIndex + 10;
        });

         const navButtons = (
             <nav>
               <ul className="pager">
                 <li>
                     <div className={"button tiny hollow float-left " + (historyIndex === 0 ? " disabled" : "")} onClick={this._setHistoryPage.bind(this, false)} aria-label="Previous">
                         <span aria-hidden="true">&larr; {translate('newer')}</span>
                     </div>
                 </li>
                 <li>
                     <div className={"button tiny hollow float-right " + (historyIndex >= (curationLength - 10) ? " disabled" : "")} onClick={historyIndex >= (curationLength - 10) ? null : this._setHistoryPage.bind(this, true)} aria-label="Next">
                         <span aria-hidden="true">{translate('older')} &rarr;</span>
                     </div>
                 </li>
               </ul>
             </nav>
        );




        return (<div className="UserWallet">
            <div className="row">
                <div className="column small-12">
                    <h4 className="uppercase">{translate('curation_rewards')}</h4>
                </div>
            </div>
            <div className="UserWallet__balance UserReward__row row">
                <div className="column small-12 medium-8">
                    {translate('estimated_curation_rewards_last_week')}:
                </div>
                <div className="column small-12 medium-4">
                    {numberWithCommas(vestsToSp(this.props.state, rewardsWeek + " " + VEST_TICKER)) + " " + VESTING_TOKENS}
                </div>
            </div>

            {/*  -- These estimates have been causing issus, see #600 --
            <div className="UserWallet__balance UserReward__row row">
                <div className="column small-12 medium-8">
                    {translate('curation_rewards_last_24_hours')}:
                </div>
                <div className="column small-12 medium-3">
                    {numberWithCommas(vestsToSp(this.props.state, rewards24 + " " + VEST_TICKER)) + " " + VESTING_TOKEN}
                </div>
            </div>
            <div className="UserWallet__balance UserReward__row row">
                <div className="column small-12 medium-8">
                    {translate('daily_average_curation_rewards')}:
                </div>
                <div className="column small-12 medium-3">
                    {numberWithCommas(vestsToSp(this.props.state, averageCuration + " " + VEST_TICKER)) + " " + VESTING_TOKEN}
                </div>
            </div>
            <div className="UserWallet__balance UserReward__row row">
                <div className="column small-12 medium-8">
                    {translate(!hasFullWeek ? 'estimated_curation_rewards_last_week' : 'curation_rewards_last_week')}:
                </div>
                <div className="column small-12 medium-3">
                    {numberWithCommas(vestsToSp(this.props.state, (hasFullWeek ? rewardsWeek : averageCuration * 7) + " " + VEST_TICKER)) + " " + VESTING_TOKEN}
                </div>
            </div>
            */}
            <div className="row">
                <div className="column small-12">
                    <hr />
                </div>
            </div>

            <div className="row">
                <div className="column small-12">
                    {/** history */}
                    <h4 className="uppercase">{translate('curation_rewards_history')}</h4>
                    {navButtons}
                    <table>
                        <tbody>
                        {curation_log}
                        </tbody>
                     </table>
                    {navButtons}
                </div>
            </div>
        </div>);
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        return {
            state,
            ...ownProps
        }
    }
)(CurationRewards)
