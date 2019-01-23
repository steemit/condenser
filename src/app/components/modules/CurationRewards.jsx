/* eslint react/prop-types: 0 */
import React from 'react';
import { connect } from 'react-redux';
import TransferHistoryRow from 'app/components/cards/TransferHistoryRow';
import {
    numberWithCommas,
    vestsToSp,
    assetFloat,
} from 'app/utils/StateFunctions';
import tt from 'counterpart';
import {
    APP_NAME,
    DEBT_TOKEN,
    DEBT_TOKEN_SHORT,
    LIQUID_TOKEN,
    CURRENCY_SIGN,
    VESTING_TOKEN,
    LIQUID_TICKER,
    VEST_TICKER,
} from 'app/client_config';

class CurationRewards extends React.Component {
    constructor() {
        super();
        this.state = { historyIndex: 0 };
        this.onShowDeposit = () => {
            this.setState({ showDeposit: !this.state.showDeposit });
        };
        this.onShowDepositSteem = () => {
            this.setState({
                showDeposit: !this.state.showDeposit,
                depositType: LIQUID_TICKER,
            });
        };
        this.onShowDepositPower = () => {
            this.setState({
                showDeposit: !this.state.showDeposit,
                depositType: VEST_TICKER,
            });
        };
        // this.onShowDeposit = this.onShowDeposit.bind(this)
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            nextProps.transfer_history.length !==
                this.props.transfer_history.length ||
            nextState.historyIndex !== this.state.historyIndex
        );
    }

    _setHistoryPage(back) {
        const newIndex = this.state.historyIndex + (back ? 10 : -10);
        this.setState({ historyIndex: Math.max(0, newIndex) });
    }

    render() {
        const { state: { historyIndex } } = this;
        const { transfer_history, account_name } = this.props;

        /// transfer log
        let rewards24 = 0,
            rewardsWeek = 0,
            totalRewards = 0;
        let today = new Date();
        let oneDay = 86400 * 1000;
        let yesterday = new Date(today.getTime() - oneDay).getTime();
        let lastWeek = new Date(today.getTime() - 7 * oneDay).getTime();

        let firstDate, finalDate;
        let curation_log = transfer_history
            .map((item, index) => {
                // Filter out rewards
                if (item[1].op[0] === 'curation_reward') {
                    if (!finalDate) {
                        finalDate = new Date(item[1].timestamp).getTime();
                    }
                    firstDate = new Date(item[1].timestamp).getTime();
                    const vest = assetFloat(item[1].op[1].reward, VEST_TICKER);
                    if (new Date(item[1].timestamp).getTime() > yesterday) {
                        rewards24 += vest;
                        rewardsWeek += vest;
                    } else if (
                        new Date(item[1].timestamp).getTime() > lastWeek
                    ) {
                        rewardsWeek += vest;
                    }
                    totalRewards += vest;
                    return (
                        <TransferHistoryRow
                            key={index}
                            op={item}
                            context={account_name}
                        />
                    );
                }
                return null;
            })
            .filter(el => !!el);
        let currentIndex = -1;
        const curationLength = curation_log.length;
        const daysOfCuration = (firstDate - finalDate) / oneDay || 1;
        const averageCuration = !daysOfCuration
            ? 0
            : totalRewards / daysOfCuration;
        const hasFullWeek = daysOfCuration >= 7;
        const limitedIndex = Math.min(historyIndex, curationLength - 10);
        curation_log = curation_log.reverse().filter(() => {
            currentIndex++;
            return (
                currentIndex >= limitedIndex && currentIndex < limitedIndex + 10
            );
        });

        const navButtons = (
            <nav>
                <ul className="pager">
                    <li>
                        <div
                            className={
                                'button tiny hollow float-left ' +
                                (historyIndex === 0 ? ' disabled' : '')
                            }
                            onClick={this._setHistoryPage.bind(this, false)}
                            aria-label="Previous"
                        >
                            <span aria-hidden="true">
                                &larr; {tt('g.newer')}
                            </span>
                        </div>
                    </li>
                    <li>
                        <div
                            className={
                                'button tiny hollow float-right ' +
                                (historyIndex >= curationLength - 10
                                    ? ' disabled'
                                    : '')
                            }
                            onClick={
                                historyIndex >= curationLength - 10
                                    ? null
                                    : this._setHistoryPage.bind(this, true)
                            }
                            aria-label="Next"
                        >
                            <span aria-hidden="true">
                                {tt('g.older')} &rarr;
                            </span>
                        </div>
                    </li>
                </ul>
            </nav>
        );

        return (
            <div className="UserWallet">
                <div className="UserWallet__balance UserReward__row row">
                    <div className="column small-12 medium-8">
                        {tt(
                            'curationrewards_jsx.estimated_curation_rewards_last_week'
                        )}:
                    </div>
                    <div className="column small-12 medium-4">
                        {numberWithCommas(
                            vestsToSp(
                                this.props.state,
                                rewardsWeek + ' ' + VEST_TICKER
                            )
                        ) +
                            ' ' +
                            VESTING_TOKEN}
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
                        <h4>
                            {tt('curationrewards_jsx.curation_rewards_history')}
                        </h4>
                        <table>
                            <tbody>{curation_log}</tbody>
                        </table>
                        {navButtons}
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const { account } = ownProps;
        return {
            state,
            account_name: account.name,
            transfer_history: account.transfer_history || [],
        };
    }
)(CurationRewards);
