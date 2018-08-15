import { combineReducers } from 'redux';
import gate from './gate';
import notifications from './notifications';
import settings from './settings';

export default combineReducers({
    gate,
    notifications,
    settings,
});
