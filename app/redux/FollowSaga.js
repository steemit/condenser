import {fromJS, Map, Set} from 'immutable'
import {call, put, select} from 'redux-saga/effects';
import {Apis} from 'shared/api_client';

/**
    This loadFollows both 'blog' and 'ignore'
*/

//fetch for follow/following count
export function* fetchFollowCount(account) {
    const counts = yield call(Apis.follow, 'get_follow_count', account)
    yield put({type: 'global/UPDATE', payload: {
        key: ['follow_count', account],
        updater: m => m.mergeDeep({'follower_count': counts.follower_count,
        'following_count': counts.following_count})
    }})
}

// Test limit with 2 (not 1, infinate looping)
export function* loadFollows(method, account, type, force = false) {
    if(yield select(state => state.global.getIn(['follow', method, account, type + '_loading']))) {
        // console.log('Already loading', method, account, type)
        return
    }

    if(!force) {
        const hasResult = yield select(state => state.global.hasIn(['follow', method, account, type + '_result']))
        if(hasResult) {
            // console.log('Already loaded', method, account, type)
            return
        }
    }

    yield put({type: 'global/UPDATE', payload: {
        key: ['follow', method, account],
        notSet: Map(),
        updater: m => m.set(type + '_loading', true),
    }})

    yield loadFollowsLoop(method, account, type)
}

function* loadFollowsLoop(method, account, type, start = '', limit = 100) {
    const res = fromJS(yield Apis.follow(method, account, start, type, limit))
    // console.log('res.toJS()', res.toJS())

    let cnt = 0
    let lastAccountName = null

    yield put({type: 'global/UPDATE', payload: {
        key: ['follow_inprogress', method, account],
        notSet: Map(),
        updater: m => {
            m = m.asMutable()
            res.forEach(value => {
                cnt++

                const whatList = value.get('what')
                const accountNameKey = method === "get_following" ? "following" : "follower";
                const accountName = lastAccountName = value.get(accountNameKey)
                whatList.forEach(what => {
                    //currently this is always true: what === type
                    m.update(what, Set(), s => s.add(accountName))
                })
            })
            return m.asImmutable()
        }
    }})

    if(cnt === limit) {
        // This is paging each block of up to limit results
        yield call(loadFollowsLoop, method, account, type, lastAccountName)
    } else {
        // This condition happens only once at the very end of the list.
        // Every account has a different followers and following list for: blog, ignore
        yield put({type: 'global/UPDATE', payload: {
            key: [],
            updater: m => {
                m = m.asMutable()

                const result = m.getIn(['follow_inprogress', method, account, type], Set())
                m.deleteIn(['follow_inprogress', method, account, type])
                m.updateIn(['follow', method, account], Map(), mm => mm.merge({
                    // Count may be set separately without loading the full xxx_result set
                    [type + '_count']: result.size,
                    [type + '_result']: result.sort().reverse(),
                    [type + '_loading']: false,
                }))
                return m.asImmutable()
            }
        }})
    }
}
