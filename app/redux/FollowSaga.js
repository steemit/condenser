import {fromJS, Map} from 'immutable'
import {call, put} from 'redux-saga/effects';
import {Apis} from 'shared/api_client';

// Test limit with 2 (not 1, infinate looping)
export function* loadFollowing(follower, type, start = '', limit = 100) {
    const res = fromJS(yield Apis.follow('get_following', follower, start, type, limit))
    // console.log('res.toJS()', res.toJS())
    let cnt = 0
    let lastFollowing = null
    yield put({type: 'global/UPDATE', payload: {
        key: ['follow', 'get_following', follower],
        notSet: Map(),
        updater: m => {
            m = m.update('result', Map(), m2 => {
                res.forEach(value => {
                    cnt++
                    const what = value.get('what')
                    const following = lastFollowing = value.get('following')
                    m2 = m2.set(following, what)
                })
                return m2
            })
            return m.merge({loading: true, error: null})
        }
    }})
    if(cnt === limit) {
        yield call(loadFollowing, follower, type, lastFollowing)
    } else {
        yield put({type: 'global/UPDATE', payload: {
            key: ['follow', 'get_following', follower],
            updater: m => m.merge({loading: false, error: null})
        }})
    }
}

// Test limit with 2 (not 1, infinate looping)
export function* loadFollowers(following, type, start = '', limit = 100) {
    const res = fromJS(yield Apis.follow('get_followers', following, start, type, limit))
    // console.log('res.toJS()', res.toJS())
    let cnt = 0
    let last = null
    yield put({type: 'global/UPDATE', payload: {
        key: ['follow', 'get_followers', following],
        notSet: Map(),
        updater: m => {
            m = m.update('result', Map(), m2 => {
                res.forEach(value => {
                    cnt++
                    const what = value.get('what')
                    const follower = last = value.get('follower')
                    m2 = m2.set(follower, what)
                })
                return m2
            })
            return m.merge({loading: true, error: null})
        }
    }})
    if(cnt === limit) {
        yield call(loadFollowers, following, type, last)
    } else {
        yield put({type: 'global/UPDATE', payload: {
            key: ['follow', 'get_following', following],
            updater: m => m.merge({loading: false, error: null})
        }})
    }
}