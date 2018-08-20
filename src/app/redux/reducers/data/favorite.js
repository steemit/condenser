import uniq from 'lodash/uniq';
import { Set, List } from 'immutable';

export default function(state, { type, payload }) {
    if (!state) {
        state = {
            isLoading: false,
            list: List(),
            set: Set(),
        };
    }

    switch (type) {
        case 'FAVORITE/LOADING_STARTED':
            return {
                ...state,
                isLoading: true,
            };
        case 'FAVORITE/ADD_DATA': {
            let list;

            if (state.list) {
                list = state.list.toJS().concat(payload.list);

                list = uniq(list);
            } else {
                list = payload.list;
            }

            return {
                isLoading: false,
                list: List(list),
                set: Set(list),
            };
        }
        case 'FAVORITE/TOGGLE':
            if (!state.isLoading) {
                let list;

                if (payload.isAdd) {
                    list = state.list.push(payload.link);
                } else {
                    list = state.list.filter(link => link !== payload.link);
                }

                return {
                    isLoading: false,
                    list,
                    set: Set(list),
                };
            }
    }

    return state;
}
