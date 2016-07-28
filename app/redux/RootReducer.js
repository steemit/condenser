import Immutable, {Map} from 'immutable';
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

function initReducer(reducer) {
    return (state, action) => {
        // console.log('RootReducer:', action.type);
        if (state && (action.type === '@@redux/INIT' || action.type === '@@INIT')) {
            return state instanceof Map ? state : Immutable.fromJS(state);
        }
        return reducer(state, action);
    }
}

export default combineReducers({
    global: initReducer(globalReducerModule.reducer),
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
