import {fromJS, Map} from 'immutable'
import {call, put} from 'redux-saga/effects';
import {Apis} from 'shared/api_client';

// Test limit with 2 (not 1, infinate looping)
export function* loadFollows(method, follower, type, start = '', limit = 100) {
    const res = fromJS(yield Apis.follow(method, follower, start, type, limit))
    // console.log('res.toJS()', res.toJS())
    let cnt = 0
    let lastFollowing = null
    const key = method === "get_following" ? "following" : "follower";

    yield put({type: 'global/UPDATE', payload: {
        key: ['follow', method, follower],
        notSet: Map(),
        updater: m => {
            m = m.update('result', Map(), m2 => {
                res.forEach(value => {
                    cnt++
                    const what = value.get('what')
                    const following = lastFollowing = value.get(key)
                    m2 = m2.set(following, what)
                })
                return m2
            })
            return m.merge({loading: true, error: null})
        }
    }})
    if(cnt === limit) {
        yield call(loadFollows, method, follower, type, lastFollowing)
    } else {
        yield put({type: 'global/UPDATE', payload: {
            key: ['follow', method, follower],
            updater: m => m.merge({loading: false, error: null})
        }})
    }
}
