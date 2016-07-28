import assert from 'assert';
import constants from 'app/redux/constants';

export const numberWithCommas = (x) => x.replace(/\B(?=(\d{3})+(?!\d))/g, ",")

export function vestsToSp(state, vesting_shares) {
    const {global} = state
    const vests = assetFloat(vesting_shares, 'VESTS')
    const total_vests = assetFloat(global.getIn(['props', 'total_vesting_shares']), 'VESTS')
    const total_vest_steem = assetFloat(global.getIn(['props', 'total_vesting_fund_steem']), 'STEEM')
    const vesting_steemf = total_vest_steem * (vests / total_vests);
    const steem_power = vesting_steemf.toFixed(3)
    return steem_power
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
