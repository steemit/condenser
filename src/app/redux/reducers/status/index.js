import { combineReducers } from 'redux';
import gate from './gate';
import notifies from './notifies';

export default combineReducers({
    gate,
    notifies,
});
