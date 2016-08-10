/* eslint react/prop-types: 0 */
import React from 'react';
import {connect} from 'react-redux'
import TransferHistoryRow from 'app/components/cards/TransferHistoryRow';
import {numberWithCommas, vestsToSp, assetFloat} from 'app/utils/StateFunctions'

class AuthorRewards extends React.Component {
    constructor() {
        super()
        this.state = {historyIndex: 0}
        this.onShowDeposit = () => {this.setState({showDeposit: !this.state.showDeposit})}
        this.onShowDepositSteem = () => {
            this.setState({showDeposit: !this.state.showDeposit, depositType: 'STEEM'})
        }
        this.onShowDepositPower = () => {
            this.setState({showDeposit: !this.state.showDeposit, depositType: 'VESTS'})
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
        let rewards24Vests = 0, rewardsWeekVests = 0, totalRewardsVests = 0;
        let rewards24SBD = 0, rewardsWeekSBD = 0, totalRewardsSBD = 0;
        const today = new Date();
        const oneDay = 86400 * 1000;
        const yesterday = new Date(today.getTime() - oneDay ).getTime();
        const lastWeek = new Date(today.getTime() - 7 * oneDay ).getTime();

        let firstDate, finalDate;
        let author_log = account.transfer_history.map((item, index) => {
            // Filter out rewards
            if (item[1].op[0] === "comment_reward") {
                if (!finalDate) {
                    finalDate = new Date(item[1].timestamp).getTime();
                }
                firstDate = new Date(item[1].timestamp).getTime();
                const vest = assetFloat(item[1].op[1].vesting_payout, 'VESTS');
                const sbd = assetFloat(item[1].op[1].sbd_payout, 'SBD');

                if (new Date(item[1].timestamp).getTime() > yesterday) {
                    rewards24Vests += vest;
                    rewardsWeekVests += vest;
                    rewards24SBD += sbd;
                    rewardsWeekSBD += sbd;
                } else if (new Date(item[1].timestamp).getTime() > lastWeek) {
                    rewardsWeekVests += vest;
                    rewardsWeekSBD += sbd;
                }
                totalRewardsVests += vest;
                totalRewardsSBD += sbd;
                return <TransferHistoryRow key={index} op={item} context={account.name} />
            }
            return null;
        }).filter(el => !!el);

        let currentIndex = -1;
        const curationLength = author_log.length;
        const daysOfCuration = (firstDate - finalDate) / oneDay || 1;
        const averageCurationVests = !daysOfCuration ? 0 : totalRewardsVests / daysOfCuration;
        const averageCurationSBD = !daysOfCuration ? 0 : totalRewardsSBD / daysOfCuration;
        const hasFullWeek = daysOfCuration >= 7;
        const limitedIndex = Math.min(historyIndex, curationLength - 10);
        author_log = author_log.reverse().filter(() => {
            currentIndex++;
            return currentIndex >= limitedIndex && currentIndex < limitedIndex + 10;
        });

         const navButtons = (
             <nav>
               <ul className="pager">
                 <li>
                     <div className={"button tiny hollow float-left " + (historyIndex === 0 ? " disabled" : "")} onClick={this._setHistoryPage.bind(this, false)} aria-label="Previous">
                         <span aria-hidden="true">&larr; Newer</span>
                     </div>
                 </li>
                 <li>
                     <div className={"button tiny hollow float-right " + (historyIndex >= (curationLength - 10) ? " disabled" : "")} onClick={historyIndex >= (curationLength - 10) ? null : this._setHistoryPage.bind(this, true)} aria-label="Next">
                         <span aria-hidden="true">Older &rarr;</span>
                     </div>
                 </li>
               </ul>
             </nav>
        );
        return (<div className="UserWallet">
            <div className="row">
                <div className="column small-12">
                    <h4>AUTHOR REWARDS</h4>
                </div>
            </div>
            <div className="UserWallet__balance UserReward__row row">
                <div className="column small-12 medium-8">
                    Author rewards last 24 hours:
                </div>
                <div className="column small-12 medium-3">
                    {numberWithCommas(vestsToSp(this.props.state, rewards24Vests + " VESTS")) + " STEEM POWER"}
                    <br />
                    {rewards24SBD.toFixed(3) + " SD"}
                </div>
            </div>

            <div className="UserWallet__balance UserReward__row row">
                <div className="column small-12 medium-8">
                    Daily average author rewards:
                </div>
                <div className="column small-12 medium-3">
                    {numberWithCommas(vestsToSp(this.props.state, averageCurationVests + " VESTS")) + " STEEM POWER"}
                    <br />
                    {averageCurationSBD.toFixed(3) + " SD"}
                </div>
            </div>
            <div className="UserWallet__balance UserReward__row row">
                <div className="column small-12 medium-8">
                    {!hasFullWeek ? "Estimated author rewards last week" : "Author rewards last week"}:
                </div>
                <div className="column small-12 medium-3">
                    {numberWithCommas(vestsToSp(this.props.state, (hasFullWeek ? rewardsWeekVests : averageCurationVests * 7) + " VESTS")) + " STEEM POWER"}
                    <br />
                    {(hasFullWeek ? rewardsWeekSBD : averageCurationSBD * 7).toFixed(3) + " SD"}
                </div>
            </div>

            <div className="row">
                <div className="column small-12">
                    <hr />
                </div>
            </div>

            <div className="row">
                <div className="column small-12">
                    {/** history */}
                    <h4>AUTHOR REWARDS HISTORY</h4>
                    {navButtons}
                    <table>
                        <tbody>
                        {author_log}
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
)(AuthorRewards)
