import {fromJS} from 'immutable';
import createModule from 'redux-modules';
import { DEFAULT_LANGUAGE } from 'config/client_config';

const defaultState = fromJS({
    current: null,
    show_login_modal: false,
    show_transfer_modal: false,
    show_promote_post_modal: false,
    show_signup_modal: false,
    pub_keys_used: null,
    locale: DEFAULT_LANGUAGE
});

export default createModule({
    name: 'user',
    initialState: defaultState,
    transformations: [
        {
            action: 'SHOW_LOGIN',
            reducer: (state, {payload}) => {
                // https://github.com/mboperator/redux-modules/issues/11
                if (typeof payload === 'function') payload = undefined
                let operation, loginDefault
                if(payload) {
                    operation = fromJS(payload.operation)
                    loginDefault = fromJS(payload.loginDefault)
                }
                return state.merge({show_login_modal: true, loginBroadcastOperation: operation, loginDefault})
            }
        },
        { action: 'HIDE_LOGIN', reducer: state =>
            state.merge({show_login_modal: false, loginBroadcastOperation: undefined, loginDefault: undefined}) },
        { action: 'SAVE_LOGIN_CONFIRM', reducer: (state, {payload}) => state.set('saveLoginConfirm', payload) },
        { action: 'SAVE_LOGIN', reducer: (state) => state }, // Use only for low security keys (like posting only keys)
        { action: 'REMOVE_HIGH_SECURITY_KEYS', reducer: (state) => {
            if(!state.hasIn(['current', 'private_keys'])) return state
            let empty = false
            state = state.updateIn(['current', 'private_keys'], private_keys => {
                if(!private_keys) return null
                if(private_keys.has('active_private'))
                    console.log('removeHighSecurityKeys')
                private_keys = private_keys.delete('active_private')
                empty = private_keys.size === 0
                return private_keys
            })
            if(empty) {
                // User logged in with Active key then navigates away from the page
                // LOGOUT
                return defaultState.merge({logged_out: true})
            }
            const username = state.getIn(['current', 'username'])
            state = state.setIn(['authority', username, 'active'], 'none')
            state = state.setIn(['authority', username, 'owner'], 'none')
            return state
        }},
        { action: 'CHANGE_LANGUAGE', reducer: (state, {payload}) => {
            return state.set('locale', payload)}
        },
        { action: 'SHOW_TRANSFER', reducer: state => state.set('show_transfer_modal', true) },
        { action: 'HIDE_TRANSFER', reducer: state => state.set('show_transfer_modal', false) },
        { action: 'SHOW_PROMOTE_POST', reducer: state => state.set('show_promote_post_modal', true) },
        { action: 'HIDE_PROMOTE_POST', reducer: state => state.set('show_promote_post_modal', false) },
        { action: 'SET_TRANSFER_DEFAULTS', reducer: (state, {payload}) => state.set('transfer_defaults', fromJS(payload)) },
        { action: 'CLEAR_TRANSFER_DEFAULTS', reducer: (state) => state.remove('transfer_defaults') },
        {
            action: 'USERNAME_PASSWORD_LOGIN',
            reducer: state => state, // saga
        },
        {
            action: 'SET_USER',
            reducer: (state, {payload}) => {
                // console.log('SET_USER')
                if (payload.vesting_shares) payload.vesting_shares = parseFloat(payload.vesting_shares);
                return state.mergeDeep({ current: payload, show_login_modal: false, loginBroadcastOperation: undefined, loginDefault: undefined, logged_out: undefined })
            }
        },
        {
            action: 'CLOSE_LOGIN',
            reducer: (state) => state.merge({ login_error: undefined, show_login_modal: false, loginBroadcastOperation: undefined, loginDefault: undefined })
        },
        {
            action: 'LOGIN_ERROR',
            reducer: (state, {payload: {error}}) => state.merge({ login_error: error, logged_out: undefined })
        },
        {
            action: 'LOGOUT',
            reducer: () => {
                return defaultState.merge({logged_out: true})
            }
        },
        // {
        //     action: 'ACCEPTED_COMMENT',
        //     // User can only post 1 comment per minute
        //     reducer: (state) => state.merge({ current: {lastComment: Date.now()} })
        // },
        { action: 'SHOW_SIGN_UP', reducer: state => state.set('show_signup_modal', true) },
        { action: 'HIDE_SIGN_UP', reducer: state => state.set('show_signup_modal', false) },

        {
            action: 'KEYS_ERROR',
            reducer: (state, {payload: {error}}) => state.merge({ keys_error: error })
        },
        // { action: 'UPDATE_PERMISSIONS', reducer: state => {
        //     return state // saga
        // }},
        { // AuthSaga
            action: 'ACCOUNT_AUTH_LOOKUP',
            reducer: state => state
        },
        { // AuthSaga
            action: 'SET_AUTHORITY',
            reducer: (state, {payload: {accountName, auth, pub_keys_used}}) => {
                state = state.setIn(['authority', accountName], fromJS(auth))
                if(pub_keys_used)
                    state = state.set('pub_keys_used', pub_keys_used)
                return state
            },
        },
        { action: 'HIDE_CONNECTION_ERROR_MODAL', reducer: state => state.set('hide_connection_error_modal', true) },
        {
            action: 'SET',
            reducer: (state, {payload: {key, value}}) => {
                key = Array.isArray(key) ? key : [key]
                return state.setIn(key, fromJS(value))
            }
        },
    ]
});
