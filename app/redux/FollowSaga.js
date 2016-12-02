import {fromJS, Map, Set, List} from 'immutable'
import {call, put} from 'redux-saga/effects';
import {Apis} from 'shared/api_client';

/**
    This loadFollows both 'blog' and 'ignore'
*/

// Test limit with 2 (not 1, infinate looping)
export function* loadFollows(method, account, type, start = '', limit = 100) {
    const res = fromJS(yield Apis.follow(method, account, start, type, limit))
    // console.log('res.toJS()', res.toJS())

    let cnt = 0
    let lastAccountName = null
    const accountNameKey = method === "get_following" ? "following" : "follower";

    yield put({type: 'global/UPDATE', payload: {
        key: ['follow', method, account],
        notSet: Map(),
        updater: m => {
            m = m.asMutable()
            res.forEach(value => {
                cnt++

                let whatList = value.get('what')
                if(typeof whatList === 'string')
                    whatList = new List([whatList]) // TODO: after shared-db upgrade, this line can be removed

                const accountName = lastAccountName = value.get(accountNameKey)
                whatList.forEach(what => {
                    //currently this is always true: what === type
                    m.update(what + '_loading', Set(), s => s.add(accountName))
                })
            })
            m.merge({[type]: {loading: true, error: null}})
            return m.asImmutable()
        }
    }})

    if(cnt === limit) {
        // This is paging each block of up to limit results
        yield call(loadFollows, method, account, type, lastAccountName)
    } else {
        // This condition happens only once at the very end of the list.
        // Every account has a different followers and following list for: blog, ignore
        yield put({type: 'global/UPDATE', payload: {
            key: ['follow', method, account],
            updater: m => {
                m = m.asMutable()
                const result = m.get(type + '_loading')
                m.delete(type + '_loading')
                m.merge({
                    [type + '_count']: result.size,
                    [type + '_result']: result,
                    [type]: {loading: false, error: null},
                })
                return m.asImmutable()
            }
        }})
    }
}
