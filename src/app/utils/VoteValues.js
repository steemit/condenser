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

// https://github.com/steemit/steem/blob/master/libraries/chain/steem_evaluator.cpp
// hf20_vote_evaluator
export const computeVoteRshares = (account, weight, comment) => {
    const maxUpvoteMana = getEffectiveVestingShares(account);
    const maxDownvoteMana = maxUpvoteMana / 4;
    let usedMana = currentUpvoteMana;
    if (weight < 0) {
        usedMana = Math.max(usedMana, currentDownvoteMana * 4);
    }
    usedMana *= Math.abs(weight) * 60 * 60 * 24 / 10000;
    const denom = 10 * 60 * 60 * 24 * 5;
    usedMana = (usedMana + denom - 1) / denom;

    usedMana = Math.max(0, usedMana - 50000000);

    const lockoutTimeMillis = 12 * 60 * 60 * 1000;
    const cashoutDeltaMillis = new Date(comment.cashout_time) - new Date();
    if (cashoutDeltaMillis < lockoutTimeMillis) {
        usedMana /= cashoutDeltaMillis / lockoutTimeMillis;
    }

    return usedMana;
};
