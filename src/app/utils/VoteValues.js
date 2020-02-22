import { parsePayoutAmount } from 'app/utils/ParsersAndFormatters';

function parseVests(vestsStr) {
    return Math.round(parseFloat(vestsStr) * 1000000);
}

// https://github.com/steemit/steem/blob/master/libraries/chain/include/steem/chain/util/manabar.hpp
function getEffectiveVestingShares(account) {
    let effectiveVestingShares =
        parseVests(account.vesting_shares) +
        parseVests(account.received_vesting_shares) -
        parseVests(account.delegated_vesting_shares);
    if (new Date(account.next_vesting_withdrawal) >= new Date()) {
        effectiveVestingShares -= Math.min(
            parseVests(account.vesting_withdraw_rate),
            parseInt(account.to_withdraw) - parseInt(account.withdrawn)
        );
    }
    return effectiveVestingShares;
}

function regenerateMana(mana, maxMana, updateTime) {
    return Math.min(
        maxMana,
        mana +
            maxMana *
                (new Date() - new Date(updateTime * 1000)) /
                (1000 * 60 * 60 * 24 * 5)
    );
}

export const computeVotingPower = account => {
    if (!account || !account.voting_manabar || !account.downvote_manabar) {
        return null;
    }
    const maxUpvoteMana = getEffectiveVestingShares(account);
    const maxDownvoteMana = maxUpvoteMana / 4;
    const currentUpvoteMana = regenerateMana(
        parseInt(account.voting_manabar.current_mana),
        maxUpvoteMana,
        account.voting_manabar.last_update_time
    );
    const upvotePower = currentUpvoteMana / maxUpvoteMana * 100;
    const currentDownvoteMana = regenerateMana(
        parseInt(account.downvote_manabar.current_mana),
        maxDownvoteMana,
        account.downvote_manabar.last_update_time
    );
    const downvotePower = currentDownvoteMana / maxDownvoteMana * 100;
    return {
        up: upvotePower,
        down: downvotePower,
        maxUpvoteMana,
        currentUpvoteMana,
        maxDownvoteMana,
        currentDownvoteMana,
    };
};

// https://github.com/steemit/steem/blob/master/libraries/chain/steem_evaluator.cpp
// hf20_vote_evaluator
export const computeVoteRshares = (votingPower, weight, cashout_time) => {
    const maxUpvoteMana = votingPower.maxUpvoteMana;
    const maxDownvoteMana = votingPower.maxDownvoteMana;
    let usedMana = votingPower.currentUpvoteMana;
    if (weight < 0) {
        usedMana = Math.max(usedMana, votingPower.currentDownvoteMana * 4);
    }
    usedMana *= Math.abs(weight) * 60 * 60 * 24 / 10000;
    const denom = 10 * 60 * 60 * 24 * 5;
    usedMana = (usedMana + denom - 1) / denom;

    usedMana = Math.max(0, usedMana - 50000000);

    const lockoutTimeMillis = 12 * 60 * 60 * 1000;
    const cashoutDeltaMillis = new Date(cashout_time) - new Date();
    if (cashoutDeltaMillis < lockoutTimeMillis) {
        usedMana /= cashoutDeltaMillis / lockoutTimeMillis;
    }

    return weight >= 0 ? usedMana : -usedMana;
};

// https://github.com/steemit/steem/blob/master/libraries/chain/util/reward.cpp
export const applyRewardsCurve = (rewardFund, r) => {
    if (!rewardFund || r <= 0) {
        return 0;
    }
    const s = rewardFund.content_constant;
    const claims = (Math.pow(r, 2) + 2 * r * s) / (r + 4 * s);
    return (
        parsePayoutAmount(rewardFund.reward_balance) *
        claims /
        parseInt(rewardFund.recent_claims)
    );
};
