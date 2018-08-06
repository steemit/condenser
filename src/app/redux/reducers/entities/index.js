import { combineEntitiesReducers } from 'redux-entities-immutable';
import notifies from './notifies';

export default combineEntitiesReducers({
    notifies,
});
