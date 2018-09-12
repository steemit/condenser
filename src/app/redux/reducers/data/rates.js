import { Map } from 'immutable';
import { RATES_GET_HISTORICAL_SUCCESS, RATES_GET_ACTUAL_SUCCESS } from '../../constants/rates';

const initialState = {
    actual: {},
    dates: Map(),
};

export default function(state = initialState, { type, payload }) {
    if (!(state.dates instanceof Map)) {
        state = {
            actual: state.actual,
            dates: Map(state.dates),
        };
    }

    switch (type) {
        case RATES_GET_ACTUAL_SUCCESS:
            return {
                ...state,
                actual: payload.rates,
            };
        case RATES_GET_HISTORICAL_SUCCESS:
            return {
                ...state,
                dates: state.dates.withMutations(dates => {
                    for (let { date, rates } of payload.items) {
                        dates.set(date, rates);
                    }
                }),
            };
    }

    return state;
}
