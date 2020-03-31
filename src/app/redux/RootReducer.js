import { Map, fromJS } from 'immutable';
import { routerReducer } from 'react-router-redux';
import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form'; // @deprecated, instead use: app/utils/ReactForm.js
import appReducer from './AppReducer';
import globalReducer from './GlobalReducer';
import userReducer from './UserReducer';
import transactionReducer from './TransactionReducer';
import offchainReducer from './OffchainReducer';
import communityReducer from './CommunityReducer';
import userProfilesReducer from './UserProfilesReducer';
import searchReducer from './SearchReducer';

function initReducer(reducer, type) {
    return (state, action) => {
        if (!state) return reducer(state, action);

        // @@redux/INIT server and client init
        if (action.type === '@@redux/INIT' || action.type === '@@INIT') {
            if (!(state instanceof Map)) {
                state = fromJS(state);
            }
            return state;
        }

        if (action.type === '@@router/LOCATION_CHANGE' && type === 'global') {
            state = state.set('pathname', action.payload.pathname);
            // console.log(action.type, type, action, state.toJS())
        }

        return reducer(state, action);
    };
}

export default combineReducers({
    community: initReducer(communityReducer),
    global: initReducer(globalReducer, 'global'),
    offchain: initReducer(offchainReducer),
    user: initReducer(userReducer),
    transaction: initReducer(transactionReducer),
    discussion: initReducer((state = {}) => state),
    routing: initReducer(routerReducer),
    app: initReducer(appReducer),
    form: formReducer,
    userProfiles: initReducer(userProfilesReducer),
    search: initReducer(searchReducer),
});
