import React from 'react';
import { connect } from 'react-redux';
import tt from 'counterpart';
import * as globalActions from 'app/redux/GlobalReducer';
import * as transactionActions from 'app/redux/TransactionReducer';

const getRewardsString = account => {
    console.log('ACCOUNT2', account);
    const reward_steem =
        parseFloat(account.get('reward_steem_balance').split(' ')[0]) > 0
            ? account.get('reward_steem_balance')
            : null;
    const reward_sbd =
        parseFloat(account.get('reward_sbd_balance').split(' ')[0]) > 0
            ? account.get('reward_sbd_balance')
            : null;
    const reward_sp =
        parseFloat(account.get('reward_vesting_steem').split(' ')[0]) > 0
            ? account.get('reward_vesting_steem').replace('STEEM', 'SP')
            : null;

    const rewards = [];
    if (reward_steem) rewards.push(reward_steem);
    if (reward_sbd) rewards.push(reward_sbd);
    if (reward_sp) rewards.push(reward_sp);

    let rewards_str;
    switch (rewards.length) {
        case 3:
            rewards_str = `${rewards[0]}, ${rewards[1]} and ${rewards[2]}`;
            break;
        case 2:
            rewards_str = `${rewards[0]} and ${rewards[1]}`;
            break;
        case 1:
            rewards_str = `${rewards[0]}`;
            break;
        default:
            rewards_str = 'No steem, sbd, sp rewards found.';
    }
    return rewards_str;
};

class ClaimBox extends React.Component {
    constructor() {
        super();
        this.state = {
            claimInProgress: false,
        };
    }

    handleClaimRewards = account => {
        this.setState({ claimInProgress: true }); // disable the claim button
        this.props.claimRewards(account);
    };

    render() {
        const { account } = this.props;
        const rewards_str = account ? getRewardsString(account) : 'Checking...';
        return (
            <div className="row">
                <div className="columns small-12">
                    <div className="UserWallet__claimbox">
                        <span className="UserWallet__claimbox-text">
                            Your current rewards: {rewards_str}
                        </span>
                        <button
                            disabled={this.state.claimInProgress}
                            className="button"
                            onClick={e => {
                                e.preventDefault();
                                this.handleClaimRewards(account);
                            }}
                        >
                            {tt('userwallet_jsx.redeem_rewards')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    const accountName = ownProps.accountName;
    const currentUser = state.user.get('current');
    const account = state.global.getIn(['accounts', accountName]);
    const isOwnAccount =
        state.user.getIn(['current', 'username'], '') == accountName;
    return {
        account,
        currentUser,
        isOwnAccount,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        claimRewards: account => {
            const username = account.get('name');
            const successCallback = () => {
                // TODO: do something here...
            };
            const operation = {
                account: username,
                reward_steem: account.get('reward_steem_balance'),
                reward_sbd: account.get('reward_sbd_balance'),
                reward_vests: account.get('reward_vesting_balance'),
            };

            dispatch(
                transactionActions.broadcastOperation({
                    type: 'claim_reward_balance',
                    operation,
                    successCallback,
                })
            );
        },
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ClaimBox);
