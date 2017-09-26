import {Map} from 'immutable';
import { createModule } from 'redux-modules';


export default createModule({
    name: 'market',
    initialState: Map({status: {}}),
    transformations: {
        receiveOrderbook: {
            reducer: (state, action) => {
                return state.set('orderbook', action.payload);
            }
        },
        receiveTicker: {
            reducer: (state, action) => {
                return state.set('ticker', action.payload);
            }
        },
        receiveOpenOrders: {
            reducer: (state, action) => {
                return state.set('open_orders', action.payload);
            }
        },
        receiveTradeHistory: {
            reducer: (state, action) => {
                return state.set('history', action.payload);
            }
        },
        appendTradeHistory: {
            reducer: (state, action) => {
                return state.set('history', [...action.payload, ...state.get('history')]);
            }
        }
    }
});
