import Immutable, {Map, fromJS} from 'immutable';
import {combineReducers} from 'redux';
import {routerReducer} from 'react-router-redux';
import appReducer from './AppReducer';
//import discussionReducer from './DiscussionReducer';
import globalReducerModule from './GlobalReducer';
import marketReducerModule from './MarketReducer';
import user from './User';
// import auth from './AuthSaga';
import transaction from './Transaction';
import offchain from './Offchain';
import {reducer as formReducer} from 'redux-form';
import {contentStats} from 'app/utils/StateFunctions'

function initReducer(reducer, type) {
    return (state, action) => {
        // @@redux/INIT server and client init
        if (state && (action.type === '@@redux/INIT' || action.type === '@@INIT')) {
            state = state instanceof Map ? state : Immutable.fromJS(state);
            if(type === 'global') {
                const content = state.get('content').withMutations(c => {
                    c.forEach((cc, key) => {
                        const stats = fromJS(contentStats(cc))
                        c.setIn([key, 'stats'], stats)
                    })
                })
                state = state.set('content', content)
            }
            return state
        }
        return reducer(state, action);
    }
}

export default combineReducers({
    global: initReducer(globalReducerModule.reducer, 'global'),
    market: initReducer(marketReducerModule.reducer),
    offchain: initReducer(offchain.reducer),
    user: initReducer(user.reducer),
    // auth: initReducer(auth.reducer),
    transaction: initReducer(transaction.reducer),
    //discussion: initReducer(discussionReducer),
    discussion: initReducer((state = {}) => state),
    routing: initReducer(routerReducer),
    app: initReducer(appReducer),
    form: formReducer,
});

/*
let now
    benchStart: initReducer((state = {}, action) => {console.log('>> action.type', action.type); now = Date.now(); return state}),
    benchEnd: initReducer((state = {}, action) => {console.log('<< action.type', action.type, (Date.now() - now), 'ms'); return state}),
*/
