import {fromJS} from 'immutable';
import { DEFAULT_LANGUAGE } from 'app/client_config';
import store from 'store';

const defaultState = fromJS({
    current: null,
    show_login_modal: false,
    show_transfer_modal: false,
    show_promote_post_modal: false,
    show_signup_modal: false,
    pub_keys_used: null,
    locale: DEFAULT_LANGUAGE
});

if (process.env.BROWSER) {
    const locale = store.get('language');
    if (locale) defaultState.locale = locale;
}

export default function reducer(state = defaultState, action) {
    const payload = action.payload;

    if (action.type === 'user/SHOW_LOGIN') {
        let operation, loginDefault;
        if (payload) {
            operation = fromJS(payload.operation);
            loginDefault = fromJS(payload.loginDefault);
        }
        return state.merge({show_login_modal: true, loginBroadcastOperation: operation, loginDefault});
    }

    if (action.type === 'user/SHOW_TERMS') {
        let operation, termsDefault;
        if (payload) {
            operation = fromJS(payload.operation);
            termsDefault = fromJS(payload.termsDefault);
        }
        return state.merge({show_terms_modal: true, loginBroadcastOperation: operation, termsDefault});
    }

    if (action.type === 'user/HIDE_LOGIN') {
        return state.merge({show_login_modal: false, loginBroadcastOperation: undefined, loginDefault: undefined});
    }

    if (action.type === 'user/SAVE_LOGIN_CONFIRM') {
        return state.set('saveLoginConfirm', payload);
    }

    if (action.type === 'user/SAVE_LOGIN') {
        // Use only for low security keys (like posting only keys)
        return state;
    }

    if (action.type === 'user/REMOVE_HIGH_SECURITY_KEYS') {
        if (!state.hasIn(['current', 'private_keys'])) return state;
        let empty = false;
        state = state.updateIn(['current', 'private_keys'], private_keys => {
            if (!private_keys) return null;
            if (private_keys.has('active_private')) console.log('removeHighSecurityKeys');
            private_keys = private_keys.delete('active_private');
            empty = private_keys.size === 0;
            return private_keys;
        })
        if (empty) {
            // User logged in with Active key then navigates away from the page
            // LOGOUT
            return defaultState.merge({logged_out: true});
        }
        const username = state.getIn(['current', 'username']);
        state = state.setIn(['authority', username, 'active'], 'none');
        state = state.setIn(['authority', username, 'owner'], 'none');
        return state;
    }

    if (action.type === 'user/CHANGE_LANGUAGE') {
        return state.set('locale', payload);
    }

    if (action.type === 'user/SHOW_TRANSFER') {
        return state.set('show_transfer_modal', true);
    }

    if (action.type === 'user/HIDE_TRANSFER') {
        return state.set('show_transfer_modal', false);
    }

    if (action.type === 'user/SHOW_POWERDOWN') {
        return state.set('show_powerdown_modal', true);
    }

    if (action.type === 'user/HIDE_POWERDOWN') {
        return state.set('show_powerdown_modal', false);
    }

    if (action.type === 'user/SHOW_PROMOTE_POST') {
        return state.set('show_promote_post_modal', true);
    }

    if (action.type === 'user/HIDE_PROMOTE_POST') {
        return state.set('show_promote_post_modal', false);
    }

    if (action.type === 'user/SET_TRANSFER_DEFAULTS') {
        return state.set('transfer_defaults', fromJS(payload));
    }

    if (action.type === 'user/CLEAR_TRANSFER_DEFAULTS') {
        return state.remove('transfer_defaults');
    }

    if (action.type === 'user/SET_POWERDOWN_DEFAULTS') {
        return state.set('powerdown_defaults', fromJS(payload));
    }

    if (action.type === 'user/CLEAR_POWERDOWN_DEFAULTS') {
        return state.remove('powerdown_defaults');
    }

    if (action.type === 'user/USERNAME_PASSWORD_LOGIN') {
        return state; // saga
    }

    if (action.type === 'user/SET_USER') {
        if (payload.vesting_shares) payload.vesting_shares = parseFloat(payload.vesting_shares);
        if (payload.delegated_vesting_shares) payload.delegated_vesting_shares = parseFloat(payload.delegated_vesting_shares);
        if (payload.received_vesting_shares) payload.received_vesting_shares = parseFloat(payload.received_vesting_shares);
        return state.mergeDeep({ current: payload, show_login_modal: false, loginBroadcastOperation: undefined, loginDefault: undefined, logged_out: undefined });
    }

    if (action.type === 'user/CLOSE_LOGIN') {
        return state.merge({ login_error: undefined, show_login_modal: false, loginBroadcastOperation: undefined, loginDefault: undefined });
    }

    if (action.type === 'user/LOGIN_ERROR') {
        return state.merge({ login_error: payload.error, logged_out: undefined });
    }

    if (action.type === 'user/LOGOUT') {
        return defaultState.merge({logged_out: true});
    }

    if (action.type === 'user/SHOW_SIGN_UP') {
        return state.set('show_signup_modal', true);
    }

    if (action.type === 'user/HIDE_SIGN_UP') {
        return state.set('show_signup_modal', false);
    }

    if (action.type === 'user/KEYS_ERROR') {
        return state.merge({ keys_error: payload.error })
    }

    if (action.type === 'user/ACCOUNT_AUTH_LOOKUP') {
        // AuthSaga
        return state;
    }

    if (action.type === 'user/SET_AUTHORITY') {
        // AuthSaga
        const {accountName, auth, pub_keys_used} = payload;
        state = state.setIn(['authority', accountName], fromJS(auth));
        if (pub_keys_used) state = state.set('pub_keys_used', pub_keys_used);
        return state;
    }

    if (action.type === 'user/HIDE_CONNECTION_ERROR_MODAL') {
        return state.set('hide_connection_error_modal', true);
    }

    if (action.type === 'user/SET') {
        const key = Array.isArray(payload.key) ? payload.key : [payload.key];
        return state.setIn(key, fromJS(payload.value));
    }

    return state;
}
