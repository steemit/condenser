import Immutable from 'immutable';
import { PropTypes } from 'react';

const defaultState = Immutable.fromJS({ user: {} });

export default function reducer(state = defaultState, action = {}) {
    if (action.type === 'user/SAVE_LOGIN_CONFIRM') {
        if (!action.payload) {
            state = state.set('account', null);
        }
    }
    return state;
}
