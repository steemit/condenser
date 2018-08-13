import { combineReducers } from 'redux';
import gate from './gate';
import notifications from './notifications';

export default combineReducers({
    gate,
    notifications,
});
