import { fromJS } from 'immutable';

const initialState = fromJS({});

export default function(state = initialState, { type, payload }) {
    switch (type) {
        default:
            return state;
    }
}
