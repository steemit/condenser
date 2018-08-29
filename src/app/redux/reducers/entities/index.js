import { combineEntitiesReducers } from 'redux-entities-immutable';
import notifications from './notifications';

export default combineEntitiesReducers({
    notifications,
});
