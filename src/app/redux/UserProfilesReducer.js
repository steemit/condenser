import { fromJS } from 'immutable';

// Action constants
const ADD_USER_PROFILE = 'user_profile/ADD';

const defaultState = fromJS({
    profiles: {},
});

export default function reducer(state = defaultState, action) {
    const payload = action.payload;

    switch (action.type) {
        case ADD_USER_PROFILE: {
            if (payload) {
                return state.setIn(
                    ['profiles', payload.username],
                    fromJS(payload.account)
                );
            }
            return state;
        }

        default:
            return state;
    }
}

// Action creators
export const addProfile = payload => ({
    type: ADD_USER_PROFILE,
    payload,
});
