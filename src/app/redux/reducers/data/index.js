import { combineReducers } from 'redux';
import settings from './settings';
import favorites from './favorites';
import rates from './rates';

import { initReducer } from 'app/redux/reducers';

export default combineReducers({
    settings: initReducer(settings),
    favorites,
    rates,
});
