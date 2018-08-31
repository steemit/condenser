import { combineReducers } from 'redux';
import settings from './settings';
import favorites from './favorites';

export default combineReducers({
    settings,
    favorites,
});
