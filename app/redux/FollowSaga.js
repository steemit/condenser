import {fromJS, Map} from 'immutable'
import {call, put} from 'redux-saga/effects';
import {Apis} from 'shared/api_client';
import {List} from 'immutable'

// Test limit with 2 (not 1, infinate looping)
export function* loadFollows(method, account, type, start = '', limit = 100) {
    const res = fromJS(yield Apis.follow(method, account, start, type, limit))
    // console.log('res.toJS()', res.toJS())
    let cnt = 0
    let lastFollowing = null
    const key = method === "get_following" ? "following" : "follower";
    yield put({type: 'global/UPDATE', payload: {
        key: ['follow', method, account],
        notSet: Map(),
        updater: m => {
            m = m.updateIn([type, 'result'], Map(), m2 => {
                res.forEach(value => {
                    cnt++
                    let what = value.get('what')
                    if(typeof what === 'string') what = new List([what]) // TODO: after shared-db upgrade, this line can be removed
                    const following = lastFollowing = value.get(key)
                    m2 = m2.set(following, what)
                })
                return m2
            })
            return m.mergeDeep({[type]: {loading: true, error: null}})
        }
    }})
    if(cnt === limit) {
        yield call(loadFollows, method, account, type, lastFollowing)
    } else {
        yield put({type: 'global/UPDATE', payload: {
            key: ['follow', method, account],
            updater: m => {
                const count = m.getIn([type, 'result']) ? m.getIn([type, 'result']).filter(a => {
                    return a.get(0) === type;
                }).size : 0;
                m = m.mergeDeep({[type]: {count, loading: false, error: null}})
                return m;
            }
        }})
    }
}
