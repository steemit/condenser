import {fromJS} from 'immutable';
import { createModule } from 'redux-modules';
import { DEFAULT_LANGUAGE } from 'app/client_config';
import store from 'store';

const defaultState = fromJS({
    current: null,
    show_login_modal: false,
    show_transfer_modal: false,
    show_powerdown_modal: false,
    show_promote_post_modal: false,
    show_signup_modal: false,
    pub_keys_used: null,
    locale: DEFAULT_LANGUAGE
});

if (process.env.BROWSER) {
    const locale = store.get('language');
    if (locale) defaultState.locale = locale;
}

export default createModule({
    name: 'user',
    initialState: defaultState,
    transformations: {
        showLogin: {
            reducer: (state, {payload}) => {
                // https://github.com/mboperator/redux-modules/issues/11
                if (typeof payload === 'function') payload = undefined;
                let operation, loginDefault
                if(payload) {
                    operation = fromJS(payload.operation)
                    loginDefault = fromJS(payload.loginDefault)
                }
                return state.merge({show_login_modal: true, loginBroadcastOperation: operation, loginDefault})
            }
        },
        showTerms: {
            reducer: (state, {payload}) => {
                // https://github.com/mboperator/redux-modules/issues/11
                if (typeof payload === 'function') payload = undefined;
                let operation, termsDefault;
                if(payload) {
                    operation = fromJS(payload.operation);
                    termsDefault = fromJS(payload.termsDefault)
                }
                return state.merge({show_terms_modal: true, loginBroadcastOperation: operation, termsDefault})
            }
        },
        hideLogin: { reducer: state =>
            state.merge({show_login_modal: false, loginBroadcastOperation: undefined, loginDefault: undefined}) },
        saveLoginConfirm: { reducer: (state, {payload}) => state.set('saveLoginConfirm', payload) },
        saveLogin: { reducer: (state) => state }, // Use only for low security keys (like posting only keys)
        removeHighSecurityKeys: { reducer: (state) => {
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
        changeLanguage: { reducer: (state, {payload}) => {
            return state.set('locale', payload)}
        },
        showTransfer: { reducer: state => state.set('show_transfer_modal', true) },
        hideTransfer: { reducer: state => state.set('show_transfer_modal', false) },
        showPowerdown: { reducer: state => state.set('show_powerdown_modal', true) },
        hidePowerdown: { reducer: state => state.set('show_powerdown_modal', false) },
        showPromotePost: { reducer: state => state.set('show_promote_post_modal', true) },
        hidePromitePost: { reducer: state => state.set('show_promote_post_modal', false) },
        setTransferDefaults: { reducer: (state, {payload}) => state.set('transfer_defaults', fromJS(payload)) },
        clearTransferDefaults: { reducer: (state) => state.remove('transfer_defaults') },
        setPowerdownDefaults: { reducer: (state, {payload}) => state.set('powerdown_defaults', fromJS(payload)) },
        clearPowerdownDefaults: { reducer: (state) => state.remove('powerdown_defaults') },
        usernamePasswordLogin: {
            reducer: state => state, // saga
        },
        setUser: {
            reducer: (state, {payload}) => {
                // console.log('SET_USER')
                if (payload.vesting_shares) payload.vesting_shares = parseFloat(payload.vesting_shares);
                if (payload.delegated_vesting_shares) payload.delegated_vesting_shares = parseFloat(payload.delegated_vesting_shares);
                if (payload.received_vesting_shares) payload.received_vesting_shares = parseFloat(payload.received_vesting_shares);
                return state.mergeDeep({ current: payload, show_login_modal: false, loginBroadcastOperation: undefined, loginDefault: undefined, logged_out: undefined })
            }
        },
        closeLogin: {
            reducer: (state) => state.merge({ login_error: undefined, show_login_modal: false, loginBroadcastOperation: undefined, loginDefault: undefined })
        },
        loginError: {
            reducer: (state, {payload: {error}}) => state.merge({ login_error: error, logged_out: undefined })
        },
        logout: {
            reducer: () => {
                return defaultState.merge({logged_out: true})
            }
        },
        // {
        //     action: 'ACCEPTED_COMMENT',
        //     // User can only post 1 comment per minute
        //     reducer: (state) => state.merge({ current: {lastComment: Date.now()} })
        // },
        showSignUp: { reducer: state => state.set('show_signup_modal', true) },
        hideSignUp: { reducer: state => state.set('show_signup_modal', false) },

        keysError: {
            reducer: (state, {payload: {error}}) => state.merge({ keys_error: error })
        },
        // { action: 'UPDATE_PERMISSIONS', reducer: state => {
        //     return state // saga
        // }},
        accountAuthLookup: { // AuthSaga
            reducer: state => state
        },
        setAuthority: { // AuthSaga
            reducer: (state, {payload: {accountName, auth, pub_keys_used}}) => {
                state = state.setIn(['authority', accountName], fromJS(auth))
                if(pub_keys_used)
                    state = state.set('pub_keys_used', pub_keys_used)
                return state
            },
        },
        hideConnectionErrorModal: { reducer: state => state.set('hide_connection_error_modal', true) },
        set: {
            reducer: (state, {payload: {key, value}}) => {
                key = Array.isArray(key) ? key : [key]
                return state.setIn(key, fromJS(value))
            }
        },
    }
});
