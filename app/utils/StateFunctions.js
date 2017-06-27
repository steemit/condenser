import assert from 'assert';
import constants from 'app/redux/constants';
import {parsePayoutAmount, repLog10} from 'app/utils/ParsersAndFormatters';
import {Long} from 'bytebuffer';
import {VEST_TICKER, LIQUID_TICKER} from 'config/client_config'
import {Map, Seq, fromJS} from 'immutable';

export const numberWithCommas = (x) => x.replace(/\B(?=(\d{3})+(?!\d))/g, ",")

export function vestsToSp(state, vesting_shares) {
    const {global} = state
    const vests = assetFloat(vesting_shares, VEST_TICKER)
    const total_vests = assetFloat(global.getIn(['props', 'total_vesting_shares']), VEST_TICKER)
    const total_vest_steem = assetFloat(global.getIn(['props', 'total_vesting_fund_steem']), LIQUID_TICKER)
    const vesting_steemf = total_vest_steem * (vests / total_vests);
    const steem_power = vesting_steemf.toFixed(3)
    return steem_power
}

export function vestingSteem(account, gprops) {
    const vests = parseFloat(account.vesting_shares.split( ' ' )[0]);
    const total_vests = parseFloat(gprops.total_vesting_shares.split( ' ' )[0]);
    const total_vest_steem = parseFloat(gprops.total_vesting_fund_steem.split( ' ' )[0]);
    const vesting_steemf = total_vest_steem * (vests / total_vests);
    return vesting_steemf;
}

export function assetFloat(str, asset) {
    try {
        assert.equal(typeof str, 'string')
        assert.equal(typeof asset, 'string')
        assert(new RegExp(`^\\d+(\\.\\d+)? ${asset}$`).test(str), 'Asset should be formatted like 99.99 ' + asset + ': ' + str)
        return parseFloat(str.split(' ')[0])
    } catch(e) {
        console.log(e);
        return undefined
    }
}

export function isFetchingOrRecentlyUpdated(global_status, order, category) {
    const status = global_status ? global_status.getIn([category || '', order]) : null;
    if (!status) return false;
    if (status.fetching) return true;
    if (status.last_fetch) {
        const res = new Date() - status.last_fetch < constants.FETCH_DATA_EXPIRE_SEC * 1000;
        return res;
    }
    return false;
}

export function contentStats(content) {
    if(!content) return {}
    let votes = Long.ZERO
    let hasFlag = false
    content.get('active_votes').forEach(v => {
        const rshares = String(v.get('rshares'))
        const voterRepLog10 = repLog10(v.get('reputation'))
        if(voterRepLog10) {
            // Don't allow low rep users to gray out everyone's posts.
            if(voterRepLog10 < 25)
                return
        }
        const neg = rshares.substring(0, 1) === '-'
        if(neg) hasFlag = true
        // Prevent tiny downvotes (less than 9 digits) from hiding content
        if(neg && rshares.length < 10) return
        votes = votes.add(rshares)
    })
    const netVoteSign = votes.compare(Long.ZERO)
    const pending_payout = content.get('pending_payout_value');
    const hasPendingPayout = parsePayoutAmount(pending_payout) >= 0.02

    const authorRepLog10 = repLog10(content.get('author_reputation'))
    const hasReplies = content.get('replies').size !== 0

    const gray = authorRepLog10 < 1 || netVoteSign < 0
    const hide = authorRepLog10 < 0 && !hasPendingPayout && !hasReplies // rephide
    const pictures = !gray

    // Combine tags+category to check nsfw status
    const json = content.get('json_metadata')
    let tags = []
    try {
        tags = json && JSON.parse(json).tags || [];
        if(typeof tags == 'string') {
            tags = [tags];
        } if(!Array.isArray(tags)) {
            tags = [];
        }
    } catch(e) {
        tags = []
    }
    tags.push(content.get('category'))
    const isNsfw = tags.filter(tag => tag.match(/^nsfw$|^ru--mat$|^18\+$/i)).length > 0;

    return {hide, gray, pictures, netVoteSign, hasPendingPayout, authorRepLog10, hasReplies, hasFlag, isNsfw}
}

export function fromJSGreedy(js) {
  return typeof js !== 'object' || js === null ? js :
    Array.isArray(js) ?
      Seq(js).map(fromJSGreedy).toList() :
      Seq(js).map(fromJSGreedy).toMap();
}
