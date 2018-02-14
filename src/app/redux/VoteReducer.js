import { fromJS, Map } from 'immutable';

// Action constants
const UPDATE_WEIGHT = 'vote/UPDATE_WEIGHT';

const defaultState = fromJS({
    weight: 10000,
});

export default function reducer(state = defaultState, action) {
    const payload = action.payload;
    switch (action.type) {
        case UPDATE_WEIGHT: {
            const weight = payload.weight;
            return state.merge({
                weight,
            });
        }
        default:
            return state;
    }
}

// Action creators
export const updateWeight = payload => {
    return {
        type: UPDATE_WEIGHT,
        payload,
    };
};
